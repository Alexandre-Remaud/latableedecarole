# Tags personnalisés

## Statut
todo

## Description
Système de tags libres permettant de catégoriser les recettes au-delà des catégories fixes existantes. Les tags sont créés par les utilisateurs et permettent un filtrage fin (végétarien, sans gluten, rapide, etc.).

## User Stories

- En tant qu'utilisateur connecté, je veux ajouter des tags à ma recette afin de la catégoriser plus finement.
- En tant que visiteur, je veux filtrer les recettes par tags afin de trouver des recettes correspondant à mes critères.
- En tant que visiteur, je veux voir les tags populaires afin de découvrir les tendances.

## Règles métier

- Les tags sont des chaînes normalisées : minuscules, trimées, sans caractères spéciaux (slug-like).
- Un tag fait entre 2 et 30 caractères.
- Une recette peut avoir entre 0 et 10 tags.
- Les tags sont créés à la volée lors de l'ajout à une recette (pas de gestion centralisée).
- Les tags existants sont suggérés par autocomplétion.
- Un admin peut supprimer ou renommer des tags globalement.
- Les tags sont stockés directement dans le document recette (pas de collection séparée pour les tags eux-mêmes).

## Modèles de données

### Modification au modèle Recipe
| Champ | Type     | Contraintes                           |
| ----- | -------- | ------------------------------------- |
| tags  | string[] | optional, max 10, chaque tag 2-30 chars |

### Vue agrégée (pour autocomplétion et tags populaires)
- Agrégation MongoDB sur `Recipe.tags` pour obtenir les tags uniques avec leur fréquence d'utilisation.

## Endpoints API

### GET /tags
- **Auth** : public
- **Query params** : `search?` (autocomplétion), `limit?` (default 20)
- **Réponse 200** : `{ data: { name: string, count: number }[] }`
- **Tri** : par fréquence d'utilisation, descendant

### GET /tags/popular
- **Auth** : public
- **Réponse 200** : `{ data: { name: string, count: number }[] }` (top 20)

### DELETE /tags/:name (admin)
- **Auth** : protégé (admin uniquement)
- **Effet** : supprime le tag de toutes les recettes
- **Réponse 200** : `{ message, affectedRecipes: number }`

### Modification aux endpoints recettes
- **POST /recipes** et **PATCH /recipes/:id** : acceptent un champ `tags: string[]`
- **GET /recipes** : accepte un query param `tags` (filtrage par un ou plusieurs tags, séparés par virgule)

## Frontend

### Champ Tags (formulaire recette)
- Input avec autocomplétion basée sur les tags existants
- Affichage en "chips" / "badges" supprimables
- Limite visuelle à 10 tags
- Création de nouveaux tags à la volée

### Filtrage par tags (liste recettes)
- Tags populaires affichés sous la barre de recherche (cliquables)
- Filtre multi-tags (les recettes doivent avoir tous les tags sélectionnés)
- Tags affichés sur les cartes recette

### Page détail recette
- Tags affichés sous le titre (cliquables pour filtrer)

## Critères d'acceptance

- [ ] Un utilisateur peut ajouter jusqu'à 10 tags à sa recette.
- [ ] Les tags sont normalisés (minuscules, trimés).
- [ ] L'autocomplétion suggère les tags existants.
- [ ] Un visiteur peut filtrer les recettes par un ou plusieurs tags.
- [ ] Les tags populaires sont visibles sur la page de liste.
- [ ] Les tags sont affichés sur les cartes et le détail des recettes.
- [ ] Un admin peut supprimer un tag globalement.

## Dépendances

- [recipes.md](recipes.md) : les tags sont un attribut des recettes.
- [auth.md](auth.md) : authentification requise pour ajouter des tags, rôle admin pour supprimer.
