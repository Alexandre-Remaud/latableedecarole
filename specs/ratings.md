# Notation & Avis

## Statut
todo

## Description
Système de notation et d'avis permettant aux utilisateurs de noter les recettes (1 à 5 étoiles) et de laisser un commentaire. La note moyenne est affichée sur chaque recette pour aider les visiteurs à identifier les meilleures recettes.

## User Stories

- En tant qu'utilisateur connecté, je veux noter une recette de 1 à 5 étoiles afin d'exprimer mon appréciation.
- En tant qu'utilisateur connecté, je veux laisser un commentaire sur une recette afin de partager mon retour.
- En tant qu'utilisateur connecté, je veux modifier ou supprimer mon avis afin de le corriger.
- En tant que visiteur, je veux voir la note moyenne d'une recette afin de juger de sa qualité.
- En tant que visiteur, je veux lire les avis sur une recette afin d'avoir des retours d'autres utilisateurs.
- En tant que propriétaire d'une recette, je veux voir les avis reçus afin de m'améliorer.

## Règles métier

- Un utilisateur ne peut laisser qu'un seul avis par recette.
- La note est obligatoire (1-5), le commentaire est optionnel (max 1000 caractères).
- Un utilisateur ne peut pas noter sa propre recette.
- La note moyenne est calculée et mise à jour à chaque ajout/modification/suppression d'avis.
- Les avis sont affichés du plus récent au plus ancien.
- Un admin peut supprimer n'importe quel avis (modération).
- Le propriétaire de l'avis peut le modifier ou le supprimer.

## Modèles de données

### Review
| Champ     | Type     | Contraintes                         |
| --------- | -------- | ----------------------------------- |
| _id       | ObjectId | PK, auto                            |
| userId    | ObjectId | ref: User, required                 |
| recipeId  | ObjectId | ref: Recipe, required               |
| rating    | number   | required, min 1, max 5, entier      |
| comment   | string   | optional, max 1000                  |
| createdAt | Date     | auto (timestamps)                   |
| updatedAt | Date     | auto (timestamps)                   |

**Index unique** : `{ userId, recipeId }`

### Modifications au modèle Recipe (champs dénormalisés ou virtuels)
- `averageRating: number` — moyenne des notes (arrondie à 1 décimale)
- `ratingsCount: number` — nombre total d'avis

## Endpoints API

### POST /recipes/:id/reviews
- **Auth** : protégé
- **Body** : `{ rating: number, comment?: string }`
- **Réponse 201** : `Review`
- **Erreurs** : 400 (validation), 403 (propre recette), 409 (avis déjà existant)

### PATCH /reviews/:id
- **Auth** : protégé (auteur uniquement)
- **Body** : `{ rating?, comment? }`
- **Réponse 200** : `Review` mis à jour
- **Erreurs** : 400, 403, 404

### DELETE /reviews/:id
- **Auth** : protégé (auteur ou admin)
- **Réponse 200** : `{ message }`
- **Erreurs** : 403, 404

### GET /recipes/:id/reviews
- **Auth** : public
- **Query params** : `skip?`, `limit?`
- **Réponse 200** : `{ data: Review[], total: number, averageRating: number }`

## Frontend

### Composant StarRating
- 5 étoiles cliquables (hover effect)
- Affichage en lecture seule pour les visiteurs
- Affichage interactif pour les utilisateurs connectés

### Section Avis (page détail recette)
- Note moyenne + nombre d'avis en haut
- Formulaire d'ajout d'avis (étoiles + textarea) si connecté et pas sa propre recette
- Liste des avis avec : avatar, nom, date, étoiles, commentaire
- Boutons modifier/supprimer sur ses propres avis
- Pagination des avis

### Affichage sur les cartes recette
- Étoiles (note moyenne) + nombre d'avis sur chaque carte
- Tri par note moyenne possible dans la liste

## Critères d'acceptance

- [ ] Un utilisateur peut noter une recette de 1 à 5 étoiles.
- [ ] Un utilisateur peut ajouter un commentaire optionnel.
- [ ] Un utilisateur ne peut pas noter sa propre recette.
- [ ] Un utilisateur ne peut laisser qu'un avis par recette.
- [ ] La note moyenne est visible sur la carte et le détail de la recette.
- [ ] Un utilisateur peut modifier ou supprimer son avis.
- [ ] Un admin peut supprimer n'importe quel avis.
- [ ] Les avis sont paginés et triés par date décroissante.

## Dépendances

- [auth.md](auth.md) : authentification requise pour noter.
- [recipes.md](recipes.md) : les avis portent sur des recettes.
- [profile.md](profile.md) : avatar et nom de l'auteur affichés dans les avis.
