import { useClients } from './useErpData';
import { useProspects } from './useData';
import type { Prospect } from '@/types';
import type { Client } from '@/types/erp';

/**
 * Hook de synchronisation bidirectionnelle entre Prospect et Client.
 * - Champs partagés : nomStructure ↔ nom, telephone, notes
 * - Conversion : crée un Client à partir d'un Prospect et établit le lien
 * - Mise à jour synchronisée dans les deux sens
 */
export function useProspectClientSync() {
  const { clients, addClient, updateClient } = useClients();
  const { prospects, updateProspect } = useProspects();

  /** Convertit un prospect en client (ou réutilise un client existant) et lie les deux. */
  const convertProspectToClient = (prospect: Prospect): Client => {
    // Déjà lié ?
    if (prospect.clientId) {
      const existing = clients.find((c) => c.id === prospect.clientId);
      if (existing) return existing;
    }
    // Match par nom si pas de lien
    const byName = clients.find(
      (c) => c.nom.trim().toLowerCase() === prospect.nomStructure.trim().toLowerCase()
    );
    if (byName) {
      updateClient(byName.id, { prospectId: prospect.id });
      updateProspect(prospect.id, { clientId: byName.id });
      return byName;
    }
    // Création
    const newClient = addClient({
      nom: prospect.nomStructure,
      telephone: prospect.telephone,
      email: '',
      adresse: '',
      ville: '',
      notes: `Converti depuis le prospect (${prospect.nomDecideur || 'N/A'})\n${prospect.notes || ''}`.trim(),
      prospectId: prospect.id,
    });
    updateProspect(prospect.id, { clientId: newClient.id });
    return newClient;
  };

  /** Met à jour un prospect et propage les champs partagés vers le client lié. */
  const syncedUpdateProspect = (id: string, updates: Partial<Prospect>) => {
    updateProspect(id, updates);
    const prospect = prospects.find((p) => p.id === id);
    const clientId = updates.clientId ?? prospect?.clientId;
    if (!clientId) return;
    const clientUpdates: Partial<Client> = {};
    if (updates.nomStructure !== undefined) clientUpdates.nom = updates.nomStructure;
    if (updates.telephone !== undefined) clientUpdates.telephone = updates.telephone;
    if (updates.notes !== undefined) clientUpdates.notes = updates.notes;
    if (Object.keys(clientUpdates).length > 0) updateClient(clientId, clientUpdates);
  };

  /** Met à jour un client et propage les champs partagés vers le prospect lié. */
  const syncedUpdateClient = (id: string, updates: Partial<Client>) => {
    updateClient(id, updates);
    const client = clients.find((c) => c.id === id);
    const prospectId = updates.prospectId ?? client?.prospectId;
    if (!prospectId) return;
    const prospectUpdates: Partial<Prospect> = {};
    if (updates.nom !== undefined) prospectUpdates.nomStructure = updates.nom;
    if (updates.telephone !== undefined) prospectUpdates.telephone = updates.telephone;
    if (updates.notes !== undefined) prospectUpdates.notes = updates.notes;
    if (Object.keys(prospectUpdates).length > 0) updateProspect(prospectId, prospectUpdates);
  };

  /** Casse le lien sur le côté opposé quand un prospect est supprimé. */
  const unlinkClientFromProspect = (prospectId: string) => {
    const linked = clients.find((c) => c.prospectId === prospectId);
    if (linked) updateClient(linked.id, { prospectId: undefined });
  };

  /** Casse le lien sur le côté opposé quand un client est supprimé. */
  const unlinkProspectFromClient = (clientId: string) => {
    const linked = prospects.find((p) => p.clientId === clientId);
    if (linked) updateProspect(linked.id, { clientId: undefined });
  };

  return {
    convertProspectToClient,
    syncedUpdateProspect,
    syncedUpdateClient,
    unlinkClientFromProspect,
    unlinkProspectFromClient,
  };
}
