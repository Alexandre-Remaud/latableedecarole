# Mode cuisine

## Statut
todo

## Description
Interface step-by-step optimisée pour une utilisation en cuisine sur tablette ou téléphone. Affichage en gros caractères, navigation étape par étape, timer intégré, et mode plein écran pour minimiser les distractions.

## User Stories

- En tant qu'utilisateur en cuisine, je veux un affichage étape par étape en gros caractères afin de lire facilement à distance.
- En tant qu'utilisateur en cuisine, je veux naviguer entre les étapes par swipe ou boutons afin de progresser dans la recette.
- En tant qu'utilisateur en cuisine, je veux un timer intégré afin de chronométrer les temps de cuisson sans changer d'app.
- En tant qu'utilisateur en cuisine, je veux voir les ingrédients de l'étape en cours afin de savoir quoi préparer.
- En tant qu'utilisateur en cuisine, je veux que l'écran ne se mette pas en veille afin de ne pas avoir à le réveiller avec les mains sales.

## Règles métier

- Le mode cuisine affiche une seule étape à la fois en plein écran.
- Chaque étape affiche : numéro, instruction, durée (si présente), température (si présente), note (si présente).
- Les ingrédients nécessaires pour l'étape en cours sont affichés en dessous (nécessite un mapping étapes-ingrédients ou affichage de tous les ingrédients).
- Le timer se lance automatiquement si l'étape a une durée, ou manuellement via un bouton.
- Le timer émet une alerte sonore et visuelle à la fin du décompte.
- Plusieurs timers peuvent tourner simultanément (si on passe à l'étape suivante pendant qu'un timer tourne).
- L'écran reste allumé via l'API Wake Lock (si supportée par le navigateur).
- Le mode cuisine est accessible depuis la page détail d'une recette.

## Modèles de données

Aucun nouveau modèle. Utilise les données existantes des étapes de la recette.

## Endpoints API

Aucun nouvel endpoint.

## Frontend

### Bouton "Mode cuisine" (page détail recette)
- Bouton prominent sur la page détail
- Lance le mode plein écran

### Vue Mode Cuisine (`/recipes/:id/cook`)
- **Plein écran** (Fullscreen API)
- **Écran d'accueil** : titre de la recette, nombre d'étapes, temps total, bouton "Commencer"
- **Vue étape** :
  - Numéro d'étape (ex: "Étape 3/8")
  - Instruction en gros caractères (min 24px)
  - Durée et température si présentes
  - Note si présente
  - Ingrédients de la recette accessibles via un panneau latéral
- **Navigation** :
  - Boutons Précédent / Suivant (gros, faciles à toucher)
  - Swipe gauche/droite sur mobile
  - Barre de progression en haut
- **Timer** :
  - Se lance si l'étape a une durée
  - Affichage gros format (ex: "05:30")
  - Boutons : démarrer, pause, reset
  - Alerte sonore + vibration à la fin
  - Badge avec timer actif si on change d'étape
- **Fin** : écran de félicitations avec lien retour vers la recette

### Wake Lock
- Activation de l'API Screen Wake Lock au lancement du mode cuisine
- Libération à la sortie du mode
- Fallback : message indiquant de désactiver la mise en veille manuellement

### Design
- Fond sombre optionnel (mode nuit pour cuisine sombre)
- Contrastes élevés pour lisibilité
- Zones de tap larges (min 48px)
- Pas de scroll nécessaire par étape (contenu adapté à la taille d'écran)

## Critères d'acceptance

- [ ] Le mode cuisine s'ouvre en plein écran depuis la page détail.
- [ ] Une seule étape est affichée à la fois en gros caractères.
- [ ] La navigation entre étapes fonctionne par boutons et par swipe.
- [ ] Le timer se lance automatiquement pour les étapes avec durée.
- [ ] Le timer émet une alerte sonore à la fin.
- [ ] Plusieurs timers peuvent tourner simultanément.
- [ ] L'écran ne se met pas en veille pendant le mode cuisine.
- [ ] Une barre de progression indique l'avancement dans la recette.
- [ ] L'interface est utilisable sur mobile et tablette (zones de tap larges).

## Dépendances

- [recipes.md](recipes.md) : données des étapes (instruction, durée, température, note).
