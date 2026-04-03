# Gestion des recettes

## Statut
done

## Description
CRUD complet pour les recettes de cuisine. Les utilisateurs connectés peuvent créer des recettes avec ingrédients et étapes. La consultation est publique. Seul le propriétaire ou un admin peut modifier/supprimer une recette. Les recettes sont filtrables par catégorie, recherchables par titre, et paginées.

## User Stories

- En tant que visiteur, je veux parcourir les recettes afin de trouver de l'inspiration culinaire.
- En tant que visiteur, je veux filtrer les recettes par catégorie (entrée, plat, dessert, etc.) afin de trouver un type de plat précis.
- En tant que visiteur, je veux rechercher une recette par son titre afin de retrouver une recette spécifique.
- En tant que visiteur, je veux consulter le détail d'une recette afin de voir les ingrédients et étapes.
- En tant qu'utilisateur connecté, je veux créer une recette avec ingrédients et étapes afin de la partager.
- En tant que propriétaire d'une recette, je veux la modifier afin de corriger ou améliorer son contenu.
- En tant que propriétaire d'une recette ou admin, je veux supprimer une recette afin de retirer du contenu obsolète.

## Règles métier

- Une recette doit avoir au moins 1 ingrédient et 1 étape.
- Le titre est limité à 150 caractères, la description à 2000 caractères.
- Le `cookTime` est auto-calculé à partir de la somme des durées des étapes (pre-save hook Mongoose).
- Les catégories autorisées : appetizer, starter, main_course, side_dish, dessert, snack, beverage, sauce.
- Les difficultés autorisées : easy, medium, hard.
- Les unités de durée : min, sec. Les unités de température : C, F.
- La recherche par titre est case-insensitive (regex échappé pour éviter ReDoS).
- La pagination est limitée à 100 résultats max par page (défaut : 20).
- Seul le propriétaire ou un admin peut modifier/supprimer une recette.
- Les champs modifiables sont whitelistés côté service (title, description, ingredients, steps, imageUrl, prepTime, cookTime, servings, difficulty, category).
- Les IDs sont validés au format ObjectId avant toute opération.

## Modèles de données

### Recipe
| Champ       | Type         | Contraintes                                 |
| ----------- | ------------ | ------------------------------------------- |
| _id         | ObjectId     | PK, auto                                    |
| title       | string       | required, max 150                            |
| description | string       | required, max 2000                           |
| ingredients | Ingredient[] | required, min 1                              |
| steps       | Step[]       | required, min 1                              |
| imageUrl    | string       | optional, URL valide                         |
| prepTime    | number       | optional, min 0, default 0                   |
| cookTime    | number       | optional, auto-calculé depuis steps, default 0 |
| servings    | number       | optional, min 1, max 100, default 4          |
| difficulty  | enum         | easy \| medium \| hard, optional             |
| category    | enum         | appetizer \| starter \| main_course \| side_dish \| dessert \| snack \| beverage \| sauce, optional |
| userId      | ObjectId     | ref: User, required                          |
| createdAt   | Date         | auto (timestamps)                            |
| updatedAt   | Date         | auto (timestamps)                            |

### Ingredient (sous-document)
| Champ    | Type   | Contraintes           |
| -------- | ------ | --------------------- |
| name     | string | required, max 150     |
| quantity | number | required, min 0       |
| unit     | string | required              |

### Step (sous-document)
| Champ           | Type   | Contraintes                    |
| --------------- | ------ | ------------------------------ |
| order           | number | required, min 1                |
| instruction     | string | required, max 2000             |
| duration        | number | optional, min 0                |
| durationUnit    | enum   | min \| sec, optional           |
| temperature     | number | optional, min 0                |
| temperatureUnit | enum   | C \| F, optional               |
| note            | string | optional, max 500              |

## Endpoints API

### GET /recipes
- **Auth** : public
- **Query params** : `category?`, `search?`, `skip?` (default 0), `limit?` (default 20, max 100)
- **Réponse 200** : `{ data: Recipe[], total: number }`
- **Tri** : createdAt descendant
- **Filtres** : catégorie exacte, titre regex case-insensitive

### GET /recipes/:id
- **Auth** : public
- **Réponse 200** : `Recipe`
- **Erreurs** : 400 (ID invalide), 404 (non trouvé)

### POST /recipes
- **Auth** : protégé (JWT requis)
- **Body** : `CreateRecipeDto` (title, description, ingredients, steps, imageUrl?, prepTime?, servings?, difficulty?, category?)
- **Réponse 201** : `Recipe` (userId auto-injecté depuis le JWT)
- **Erreurs** : 400 (validation), 401 (non connecté)

### PATCH /recipes/:id
- **Auth** : protégé (propriétaire ou admin)
- **Body** : `UpdateRecipeDto` (partial)
- **Réponse 200** : `Recipe` mis à jour
- **Erreurs** : 400 (validation/ID invalide), 401 (non connecté), 403 (non autorisé), 404 (non trouvé)

### DELETE /recipes/:id
- **Auth** : protégé (propriétaire ou admin)
- **Réponse 200** : `Recipe` supprimée
- **Erreurs** : 400 (ID invalide), 401 (non connecté), 403 (non autorisé), 404 (non trouvé)

## Frontend

### Page Accueil (`/`)
- Affiche les 10 dernières recettes
- Bouton supprimer visible pour le propriétaire/admin
- Lien vers la liste complète si plus de recettes existent

### Page Liste (`/recipes`)
- Paramètres URL : `category`, `search`
- Pagination "Load More" (20 par page)
- Filtrage par catégorie via navigation (Entrées, Plats, Desserts, Plus...)
- Recherche par titre via barre de recherche dans le header
- Bouton supprimer visible pour le propriétaire/admin

### Page Détail (`/recipes/:id`)
- Affichage complet : titre, description, badges (difficulté, portions, temps), ingrédients, étapes ordonnées
- Chaque étape affiche durée, température et notes si présents
- Labels d'unités en français
- Boutons Modifier/Supprimer pour le propriétaire/admin
- Dialog de confirmation avant suppression

### Page Création (`/recipes/add`)
- Formulaire react-hook-form + Zod
- Champs : titre, description, portions, temps de préparation, difficulté, catégorie
- Liste dynamique d'ingrédients (ajout/suppression, min 1) : nom, quantité, unité
- Liste dynamique d'étapes (ajout/suppression, min 1) : ordre, instruction, durée optionnelle, température optionnelle, note optionnelle
- Validation au submit
- Redirection vers l'accueil après succès
- Toast de confirmation

### Page Édition (`/recipes/:id/edit`)
- Même formulaire que la création, pré-rempli depuis l'API
- Conversion API -> form data via `recipeToFormData`
- Guard d'auth : redirection vers login si non connecté
- Redirection vers le détail après succès
- Toast de confirmation

### Composants partagés
- **Form.tsx** : formulaire recette réutilisé en création et édition
- **IngredientField.tsx** : champ dynamique pour un ingrédient
- **StepField.tsx** : champ dynamique pour une étape
- **RecipeBadges.tsx** : badges difficulté, portions, temps
- **ConfirmDialog.tsx** : modal de confirmation de suppression

## Critères d'acceptance

- [ ] Un visiteur peut voir la liste des recettes sans être connecté.
- [ ] Un visiteur peut filtrer par catégorie et rechercher par titre.
- [ ] La pagination fonctionne avec "Load More" (20 par page).
- [ ] Un visiteur peut voir le détail complet d'une recette.
- [ ] Un utilisateur connecté peut créer une recette avec ingrédients et étapes.
- [ ] Le cookTime est auto-calculé depuis les durées des étapes.
- [ ] Un propriétaire peut modifier sa recette.
- [ ] Un admin peut modifier/supprimer n'importe quelle recette.
- [ ] Un utilisateur non-propriétaire non-admin ne peut pas modifier/supprimer.
- [ ] La suppression affiche un dialog de confirmation.
- [ ] Les validations côté client et serveur rejettent les données invalides.
- [ ] La recherche est case-insensitive et protégée contre ReDoS.

## Dépendances

- [auth.md](auth.md) : la création, modification et suppression nécessitent l'authentification.
