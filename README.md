# MyALLNTIC

Contexte
Je suis entrepreneur individuel en Côte d’Ivoire, fondateur de ALLNTIC, une activité de services technologiques et sécurité électronique (réseaux, vidéosurveillance, maintenance).
Je travaille en parallèle comme salarié, donc mon temps est limité.
Je veux une application web PWA interne, usage personnel uniquement, pour gérer mes prospects, devis, paiements et interventions.
Ce n’est PAS un SaaS, PAS une application client, PAS multi-utilisateurs.
🎯 Objectif principal
Créer une application simple, rapide, mobile-first, qui remplace Excel et notes WhatsApp, et me permet de :
suivre mon pipeline commercial,
ne rien oublier,
mieux relancer,
signer plus vite.
👤 Utilisateur
1 seul utilisateur : moi
Pas d’inscription publique
Authentification simple ou accès privé
📦 Modules obligatoires (V1 uniquement)
1. Prospects
Champs :
Nom de la structure
Nom du décideur
Téléphone / WhatsApp
Type de structure (PME, ONG, École, Commerce)
Besoin principal (Réseau, Vidéosurveillance, Contrôle d’accès, Maintenance)
Statut :
Prospect
Audit prévu
Audit réalisé
Devis envoyé
Signé
Refusé
Notes libres
Actions :
Créer / modifier prospect
Changer le statut rapidement
2. Devis
Champs :
Prospect lié
Date du devis
Option (Essentiel / Pro + Maintenance)
Montant du devis
Statut (Envoyé / Accepté / Refusé)
Acompte reçu (Oui / Non)
Montant de l’acompte
Actions :
Lier un devis à un prospect
Marquer acompte reçu
3. Interventions
Champs :
Prospect lié
Type (Installation / Maintenance)
Date prévue
Statut (À faire / Fait)
Notes
Actions :
Planifier intervention
Marquer comme terminée
📱 Interface attendue
Mobile-first
Interface très sobre
Listes filtrables par statut
Fiche prospect “tout-en-un” (prospect + devis + interventions)
Boutons d’action rapides
🚫 Ce que l’application ne doit PAS contenir
Pas de paiement en ligne
Pas de génération de PDF
Pas de notifications push
Pas de multi-agences
Pas d’IA
Pas de design complexe
⚙️ Contraintes techniques
Temps de mise en place : moins de 2 heures
Utilisation no-code / low-code
Données stockées de façon simple (table ou base légère)
Installable comme PWA sur smartphone Android
🧠 Résultat attendu
Une application :
fiable,
rapide,
simple,
orientée vente et exécution terrain,
adaptée à un entrepreneur individuel en phase de démarrage.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://myallntic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9193aa67-9931-42be-a795-5f08ab642024).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
