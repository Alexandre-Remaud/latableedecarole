# Favoris

## Statut
done

## Description
Système de favoris permettant aux utilisateurs connectés de sauvegarder des recettes qu'ils aiment. Les favoris sont visibles sur le profil de l'utilisateur et permettent de retrouver facilement les recettes appréciées.

## User Stories

- En tant qu'utilisateur connecté, je veux ajouter une recette à mes favoris afin de la retrouver facilement.
- En tant qu'utilisateur connecté, je veux retirer une recette de mes favoris afin de nettoyer ma liste.
- En tant qu'utilisateur connecté, je veux voir la liste de mes favoris afin de retrouver mes recettes préférées.
- En tant que visiteur, je veux voir le nombre de favoris d'une recette afin de juger de sa popularité.

## Règles métier

- Un utilisateur ne peut mettre en favori une recette qu'une seule fois (pas de doublons).
- L'ajout/retrait de favori est un toggle (une seule action).
- Le nombre total de favoris d'une recette est visible publiquement.
- La liste des favoris d'un utilisateur est privée (visible uniquement par lui).
- Supprimer une recette supprime automatiquement tous les favoris associés.

## Modèles de données

### Favorite
| Champ     | Type     | Contraintes                        |
| --------- | -------- | ---------------------------------- |
| _id       | ObjectId | PK, auto                           |
| userId    | ObjectId | ref: User, required                |
| recipeId  | ObjectId | ref: Recipe, required              |
| createdAt | Date     | auto (timestamps)                  |

**Index unique** : `{ userId, recipeId }` pour empêcher les doublons.

### Modifications au modèle Recipe (champ virtuel ou agrégé)
- `favoritesCount: number` — nombre de favoris (agrégation ou champ dénormalisé)

## Endpoints API

### POST /recipes/:id/favorite
- **Auth** : protégé
- **Réponse 201** : `{ favorited: true, favoritesCount: number }`
- **Erreurs** : 404 (recette non trouvée), 409 (déjà en favori)

### DELETE /recipes/:id/favorite
- **Auth** : protégé
- **Réponse 200** : `{ favorited: false, favoritesCount: number }`
- **Erreurs** : 404 (recette ou favori non trouvé)

### GET /users/me/favorites
- **Auth** : protégé
- **Query params** : `skip?`, `limit?`
- **Réponse 200** : `{ data: Recipe[], total: number }`
- **Tri** : date d'ajout en favori, descendant

### GET /recipes/:id (modification)
- Ajouter dans la réponse : `favoritesCount`, `isFavorited` (si utilisateur connecté)

## Frontend

### Bouton Favori
- Icône coeur sur chaque carte recette et sur la page de détail
- Coeur plein si favori, coeur vide sinon
- Toggle au clic (ajout/retrait)
- Compteur de favoris affiché à côté
- Disponible uniquement pour les utilisateurs connectés (sinon redirection login ou tooltip)
- Optimistic update : le coeur change immédiatement, rollback si erreur

### Liste des favoris (dans le profil)
- Affichée dans l'onglet "Mes favoris" du profil
- Mêmes cartes recette que la liste classique
- Pagination "Load More"
- Bouton pour retirer des favoris

## Critères d'acceptance

- [ ] Un utilisateur connecté peut ajouter une recette en favori.
- [ ] Un utilisateur connecté peut retirer une recette des favoris.
- [ ] Le bouton coeur reflète l'état favori de l'utilisateur connecté.
- [ ] Le compteur de favoris est visible par tous.
- [ ] La liste des favoris est accessible depuis le profil.
- [ ] Un utilisateur ne peut pas mettre la même recette en favori deux fois.
- [ ] La suppression d'une recette nettoie les favoris associés.
- [ ] Un visiteur non connecté voit le compteur mais ne peut pas interagir.

## Dépendances

- [auth.md](auth.md) : authentification requise pour ajouter/retirer.
- [recipes.md](recipes.md) : les favoris portent sur des recettes.
