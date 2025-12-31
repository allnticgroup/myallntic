import { useLocalStorage } from './useLocalStorage';
import { Prospect, Devis, Intervention } from '@/types';

export function useProspects() {
  const [prospects, setProspects] = useLocalStorage<Prospect[]>('allntic_prospects', []);

  const addProspect = (prospect: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProspect: Prospect = {
      ...prospect,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setProspects((prev) => [...prev, newProspect]);
    return newProspect;
  };

  const updateProspect = (id: string, updates: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
  };

  const getProspect = (id: string) => prospects.find((p) => p.id === id);

  return { prospects, addProspect, updateProspect, deleteProspect, getProspect };
}

export function useDevis() {
  const [devisList, setDevisList] = useLocalStorage<Devis[]>('allntic_devis', []);

  const addDevis = (devis: Omit<Devis, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newDevis: Devis = {
      ...devis,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setDevisList((prev) => [...prev, newDevis]);
    return newDevis;
  };

  const updateDevis = (id: string, updates: Partial<Devis>) => {
    setDevisList((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d
      )
    );
  };

  const deleteDevis = (id: string) => {
    setDevisList((prev) => prev.filter((d) => d.id !== id));
  };

  const getDevisForProspect = (prospectId: string) =>
    devisList.filter((d) => d.prospectId === prospectId);

  return { devisList, addDevis, updateDevis, deleteDevis, getDevisForProspect };
}

export function useInterventions() {
  const [interventions, setInterventions] = useLocalStorage<Intervention[]>(
    'allntic_interventions',
    []
  );

  const addIntervention = (
    intervention: Omit<Intervention, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    const newIntervention: Intervention = {
      ...intervention,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    setInterventions((prev) => [...prev, newIntervention]);
    return newIntervention;
  };

  const updateIntervention = (id: string, updates: Partial<Intervention>) => {
    setInterventions((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, ...updates, updatedAt: new Date().toISOString() } : i
      )
    );
  };

  const deleteIntervention = (id: string) => {
    setInterventions((prev) => prev.filter((i) => i.id !== id));
  };

  const getInterventionsForProspect = (prospectId: string) =>
    interventions.filter((i) => i.prospectId === prospectId);

  return {
    interventions,
    addIntervention,
    updateIntervention,
    deleteIntervention,
    getInterventionsForProspect,
  };
}
