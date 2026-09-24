# Paramètres de marque et tableau de pilotage ALLNTIC GROUP

## Objectif
Unifier la personnalisation de l’entreprise, l’identité visuelle et le pilotage quotidien, tout en conservant les données locales et les fonctions existantes.

## Paramètres entreprise et documents
- Réorganiser la page Paramètres en sections lisibles sur mobile : identité, coordonnées, fiscalité, paiements et contenu des documents.
- Permettre de modifier le nom, le logo principal, une variante claire, une variante sombre et les couleurs de marque.
- Ajouter les informations de document configurables : identifiant fiscal, mentions, conditions, services et coordonnées affichées.
- Prévisualiser le logo et les couleurs sur fonds clair et sombre avant sauvegarde.
- Conserver les valeurs dans le stockage local et enregistrer chaque modification dans l’historique.
- Faire lire ces réglages communs par les devis, factures, reçus, rapports et documents Word/PDF, sans modifier les données métier.

## Tableau de bord mobile-first
- Prioriser dès le premier écran : chiffre d’affaires, impayés, devis à relancer et interventions proches.
- Ajouter une zone d’alertes d’échéances triée par urgence pour les factures, devis et interventions.
- Créer des actions rapides adaptées au téléphone pour ajouter un prospect, créer un devis et planifier une intervention.
- Mettre en avant des raccourcis directs vers Prospects, Devis et Interventions, puis conserver les autres modules en accès secondaire.
- Préserver la recherche, l’import, la sauvegarde, l’objectif mensuel et l’activité récente.

## Identité visuelle
- Utiliser le logo officiel comme valeur initiale et appliquer automatiquement sa variante adaptée au thème clair ou sombre.
- Étendre les couleurs configurables à l’en-tête, la navigation, les actions principales, les indicateurs et les documents.
- Garder Sora pour les titres, Manrope pour les textes, les motifs techniques discrets et une présentation cohérente sur toutes les pages.
- Préserver un contraste accessible et revenir aux couleurs officielles si une valeur enregistrée est invalide.

## Détails techniques
- Étendre `CompanySettings` avec les variantes de logo, les couleurs et les mentions documentaires.
- Centraliser l’application des couleurs dans des variables sémantiques afin que les composants existants suivent automatiquement la marque.
- Centraliser les informations PDF/DOCX via les réglages entreprise existants, sans introduire de service externe.
- Conserver la compatibilité avec les anciennes sauvegardes JSON en complétant les nouveaux champs par défaut.

## Vérification
- Tester la sauvegarde puis le rechargement des paramètres.
- Vérifier la génération des principaux PDF/DOCX avec les valeurs personnalisées.
- Vérifier le tableau de bord à 384 px et sur grand écran, en thème clair et sombre.
- Contrôler l’absence d’erreurs de compilation et d’exécution.
