# Collections / Carnets

## Statut
done

## Description
Les utilisateurs peuvent organiser leurs recettes favorites en collections thématiques (ex: "Repas de la semaine", "Noël", "BBQ"). Les collections sont privées par défaut mais peuvent être rendues publiques pour le partage.

## User Stories

- En tant qu'utilisateur connecté, je veux créer une collection thématique afin d'organiser mes recettes.
- En tant qu'utilisateur connecté, je veux ajouter une recette à une collection afin de la retrouver dans un contexte précis.
- En tant qu'utilisateur connecté, je veux retirer une recette d'une collection afin de réorganiser mon contenu.
- En tant qu'utilisateur connecté, je veux rendre une collection publique afin de la partager.
- En tant que visiteur, je veux consulter une collection publique afin de découvrir des sélections de recettes.

## Règles métier

- Un utilisateur peut créer un nombre illimité de collections.
- Une collection a un nom (max 100 chars) et une description optionnelle (max 500 chars).
- Une recette peut appartenir à plusieurs collections.
- Une collection peut être privée (default) ou publique.
- Seul le propriétaire peut modifier/supprimer une collection.
- Les collections sont distinctes des favoris (un favori n'est pas automatiquement dans une collection).
- L'ordre des recettes dans une collection est personnalisable (drag & drop).

## Modèles de données

### Collection
| Champ       | Type     | Contraintes                     |
| ----------- | -------- | ------------------------------- |
| _id         | ObjectId | PK, auto                        |
| userId      | ObjectId | ref: User, required             |
| name        | string   | required, max 100               |
| description | string   | optional, max 500               |
| isPublic    | boolean  | default: false                  |
| recipeIds   | ObjectId[] | ref: Recipe, ordered          |
| coverImage  | string   | optional, URL (première recette avec image par défaut) |
| createdAt   | Date     | auto                            |
| updatedAt   | Date     | auto                            |

## Endpoints API

### POST /collections
- **Auth** : protégé
- **Body** : `{ name, description?, isPublic? }`
- **Réponse 201** : `Collection`

### GET /collections/me
- **Auth** : protégé
- **Réponse 200** : `{ data: Collection[], total: number }`

### GET /collections/:id
- **Auth** : public si isPublic, sinon propriétaire uniquement
- **Réponse 200** : `Collection` avec recettes populées
- **Erreurs** : 403 (privée, non propriétaire), 404

### PATCH /collections/:id
- **Auth** : protégé (propriétaire)
- **Body** : `{ name?, description?, isPublic? }`
- **Réponse 200** : `Collection` mis à jour

### POST /collections/:id/recipes
- **Auth** : protégé (propriétaire)
- **Body** : `{ recipeId }`
- **Réponse 200** : `Collection` mis à jour
- **Erreurs** : 409 (recette déjà dans la collection)

### DELETE /collections/:id/recipes/:recipeId
- **Auth** : protégé (propriétaire)
- **Réponse 200** : `Collection` mis à jour

### PATCH /collections/:id/reorder
- **Auth** : protégé (propriétaire)
- **Body** : `{ recipeIds: string[] }` (nouvel ordre)
- **Réponse 200** : `Collection` mis à jour

### DELETE /collections/:id
- **Auth** : protégé (propriétaire)
- **Réponse 200** : `{ message }`

## Frontend

### Page Mes collections (`/collections`)
- Grille de collections avec : nom, cover image, nombre de recettes, badge public/privé
- Bouton "Nouvelle collection"
- Accessible depuis le profil

### Page Détail collection (`/collections/:id`)
- Nom, description, statut public/privé
- Grille de recettes ordonnée
- Drag & drop pour réordonner (propriétaire)
- Bouton ajouter une recette (recherche/favoris)
- Bouton supprimer une recette de la collection
- Bouton partager (si publique)

### Bouton "Ajouter à une collection" (page détail recette)
- Dropdown listant les collections de l'utilisateur
- Option "Nouvelle collection" en bas du dropdown
- Indicateur si la recette est déjà dans une collection

## Critères d'acceptance

- [ ] Un utilisateur peut créer, modifier et supprimer des collections.
- [ ] Un utilisateur peut ajouter et retirer des recettes d'une collection.
- [ ] L'ordre des recettes est personnalisable par drag & drop.
- [ ] Une collection peut être publique ou privée.
- [ ] Les collections publiques sont accessibles par lien.
- [ ] Les collections privées ne sont pas accessibles par d'autres utilisateurs.
- [ ] La page détail recette propose d'ajouter à une collection.

## Dépendances

- [auth.md](auth.md) : authentification requise.
- [recipes.md](recipes.md) : les collections contiennent des recettes.
- [favorites.md](favorites.md) : sélection rapide depuis les favoris.
