# Audit technique ALLNTIC GROUP (lecture seule) et ordre de correction

Aucun fichier n'a été modifié pendant l'audit. Si vous approuvez ce plan, rien ne sera modifié automatiquement : il sert d'ordre de correction pour les prochaines demandes.

## 1. Architecture réelle
- React 18 + Vite 5 + TypeScript (strict désactivé), Tailwind/shadcn, React Router, 24 pages, toutes branchées dans le routeur (`/` affiche le tableau de bord). Aucune page orpheline.
- Toutes les données sont stockées dans le navigateur (`localStorage`, clés `allntic_*`) via `useLocalStorage`, `useData.ts` et `useErpData.ts`.
- Le backend Supabase est **configuré mais jamais utilisé** : aucun import du client en dehors de `src/integrations`, schéma vide (`Tables: never`), aucune table métier, aucune fonction.
- Une PWA existe (vite-plugin-pwa, generateSW, 19 fichiers précachés, environ 3,9 Mo). Le service worker est désactivé dans l'aperçu et dans les iframes.
- Documents : jsPDF 4.2.1 (version verrouillée) et docx, générés entièrement sur l'appareil.

## 2. Résultats de compilation (vérifiés réellement)
- Build (`vite build`, avec sortie redirigée vers /tmp) : **OK**. Un avertissement : le bundle principal fait 3,4 Mo (983 Ko gzip), sans découpage.
- Typecheck `tsgo` : **0 erreur**.
- Lint `eslint .` : **26 problèmes, dont 13 erreurs et 13 avertissements**. Aucune ne bloque le build :
  - `no-explicit-any` : parseMaterialsPdf.ts:52 et 139, Finances.tsx:508 et 519, Materials.tsx:94, Settings.tsx:393
  - `no-irregular-whitespace` : parseDocumentsFile.ts:226
  - `no-empty-object-type` : ui/textarea.tsx:5 ; `prefer-const` : previewAuthStorage.ts:38 (fichier généré automatiquement)
  - `no-require-imports` : tailwind.config.ts:108
  - Avertissements sur des dépendances de hooks : Invoices.tsx:140 et 174, Finances.tsx:213 et 227

## 3. Risques

### Critiques
1. **Données non synchronisées entre écrans.** `useLocalStorage` crée une copie indépendante par composant, sans écoute des événements `storage` ni état partagé. `useProspectClientSync` a ses propres copies des clients et prospects, comme Ventes et Stock. Conséquence : une écriture peut en écraser une autre sans avertissement.
2. **Numérotation en double.** `generateCode` prend le maximum + 1 : si on supprime le dernier code, il est réattribué. `generateInvoiceNumber` compte les factures (+1) au lieu de prendre le maximum : après une suppression, le numéro suivant existe déjà. Cette fonction est appelée depuis Ventes, Finances et Invoices avec des copies séparées.
3. **Factures récurrentes.** Elles sont générées au montage de la page Factures, avec un contrôle uniquement en mémoire. Combiné au point 1, cela crée un risque de doublon ou de perte.
4. **Code PIN contournable.** Le hash est stocké dans localStorage avec un sel fixe et le déverrouillage dans sessionStorage : il suffit de supprimer la clé pour retirer le verrou.

### Élevés
5. Chaque sauvegarde interne copie toutes les données, photos base64 comprises, dans localStorage (jusqu'à 5 versions). Le quota peut être saturé et `dailySnapshot` échoue alors sans message.
6. `restoreBackup` ne supprime pas les clés créées après la sauvegarde : on obtient un mélange de données anciennes et récentes.
7. Le journal d'audit n'est utilisé que dans Paramètres, Pilotage et Interventions. Rien n'est tracé pour les prospects, clients, devis, factures, ventes, paiements, le stock, les achats, les employés ou les projets. Cela contredit la règle du projet.
8. Le passage des factures en « overdue » se fait dans un `useMemo` qui modifie les données (effet de bord pendant l'affichage), dans Invoices.tsx:142-150.
9. Suppressions sans cascade : supprimer un client laisse ses ventes orphelines. Supprimer un prospect ne supprime ni ses devis ni ses interventions, alors que la règle métier « cascade delete quotes » l'exige.
10. Stock : les indicateurs `stockDeduit` et `stockUpdated` sont corrects individuellement. En revanche, un devis accepté et une vente peuvent tous deux déduire le stock pour la même affaire, sans contrôle croisé.

### Moyens
11. La validation Zod n'existe que pour l'import JSON (export.ts). Les imports CSV, Excel, Word et PDF (matériels, devis, factures) n'ont pas de validation par schéma.
12. Rien n'empêche un paiement de dépasser le montant de la facture (`addPayment` sans contrôle).
13. La conversion prospect → client compare les noms exactement : une petite variante d'écriture crée un client en double.
14. La PWA dépend d'une liste de domaines codés en dur et du paramètre `?sw=off`. Le bundle unique de 3,4 Mo ralentit le premier chargement.

### Faibles
15. Erreurs de lint et code mort Supabase, en dehors du fichier généré. Typage lâche (`strict: false`).

## 4. Réellement opérationnel ou seulement local/simulé
- **Opérationnel, sur l'appareil uniquement** : prospects/clients et leur synchronisation, devis, factures, ventes, stock, fournisseurs et achats, employés, projets, pilotage, interventions et rappels, exports et imports, PDF/DOCX, paramètres de marque, sauvegardes JSON.
- **Local ou simulé** : paiements (QR Wave/Orange Money sans encaissement réel), notifications (uniquement quand l'onglet est ouvert), code PIN (visuel), sauvegardes (dans le même navigateur, donc perdues si les données du site sont effacées).
- **Absent** : backend, multi-appareil, authentification, synchronisation dans le cloud.

## 5. Ordre de correction recommandé
1. Créer une source de données partagée (store unique ou contexte avec écoute des événements `storage`). Cela corrige les risques 1, 3 et une partie du 10.
2. Numérotation fondée sur le maximum, avec un compteur persistant qui ne réutilise jamais un numéro ; contrôle d'unicité à la création et à l'import.
3. Rendre les factures récurrentes et le statut « overdue » idempotents dans un `useEffect`, avec un verrou par période.
4. Cascades et gestion des éléments orphelins : prospect → devis et interventions, client → ventes, avec confirmation.
5. Tracer toutes les créations, modifications et suppressions dans le journal d'audit.
6. Stock : une seule source de déduction par affaire (devis ou vente).
7. Paiements : plafond égal au reste dû et statut « payée » calculé automatiquement.
8. Sauvegardes : exclure ou limiter les photos, gérer les erreurs de quota, et remplacer toutes les clés `allntic_*` lors d'une restauration.
9. Validation Zod pour tous les imports de fichiers.
10. Code PIN : sel aléatoire et PBKDF2, en précisant qu'il reste une protection locale.
11. Nettoyage du lint, découpage du bundle, retrait ou usage décidé de Supabase.
