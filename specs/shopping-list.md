# Liste de courses

## Statut
in-progress

## Description
Génération d'une liste de courses à partir des ingrédients d'une ou plusieurs recettes.
Les ingrédients sont triés alphabétiquement et dédupliqués (même nom + même unité → quantités sommées).
La liste est cochable et exportable en texte.

## User Stories

- En tant qu'utilisateur connecté, je veux ajouter une recette à une liste de courses depuis la fiche recette.
- En tant qu'utilisateur connecté, je veux choisir d'ajouter à une liste existante ou d'en créer une nouvelle.
- En tant qu'utilisateur connecté, je veux ajuster le nombre de portions avant d'ajouter.
- En tant qu'utilisateur connecté, je veux cocher les ingrédients achetés avec persistance.
- En tant qu'utilisateur connecté, je veux voir toutes mes listes depuis le menu (icône panier).
- En tant qu'utilisateur connecté, je veux exporter ma liste en texte (presse-papiers).
- En tant qu'utilisateur connecté, je veux supprimer une liste.

## Règles métier

- Tri alphabétique des items (localeCompare fr).
- Ingrédients avec même nom (insensible à la casse) ET même unité → quantités sommées.
- Ingrédients sans unité (unit = '') ou quantity = 0 → dédupliqués par nom, pas de sommation.
- Ajustement portions : ratio = targetServings / originalServings appliqué sur quantity.
- Listes liées au compte utilisateur, non visibles par les autres.
- Items cochés persistés côté serveur.
- Utilisateur non connecté : bouton panier visible mais redirige vers /login au clic.

## API

### POST /shopping-lists
- Auth : protégé
- Body : `{ name: string, recipeIds: string[], servingsOverrides?: { recipeId: string, servings: number }[] }`
- Réponse 201 : ShoppingList

### GET /shopping-lists
- Auth : protégé
- Réponse 200 : `{ data: ShoppingList[], total: number }`

### GET /shopping-lists/:id
- Auth : protégé (propriétaire)
- Réponse 200 : ShoppingList

### PATCH /shopping-lists/:id
- Auth : protégé (propriétaire)
- Body : `{ name: string }`
- Réponse 200 : ShoppingList

### POST /shopping-lists/:id/recipes
- Auth : protégé (propriétaire)
- Body : `{ recipeId: string, servings?: number }`
- Réponse 200 : ShoppingList (re-agrégé)

### PATCH /shopping-lists/:id/items/:itemId
- Auth : protégé (propriétaire)
- Body : `{ checked: boolean }`
- Réponse 200 : ShoppingList

### DELETE /shopping-lists/:id
- Auth : protégé (propriétaire)
- Réponse 200 : `{ message: string }`

## Modèles

### ShoppingList
| Champ            | Type               | Contraintes         |
|------------------|--------------------|---------------------|
| _id              | ObjectId           | PK, auto            |
| userId           | ObjectId           | ref: User, required |
| name             | string             | required, max 100   |
| items            | ShoppingItem[]     | default: []         |
| recipeIds        | ObjectId[]         | ref: Recipe         |
| servingsOverrides| ServingsOverride[] | default: []         |
| createdAt        | Date               | auto                |
| updatedAt        | Date               | auto                |

### ShoppingItem (subdocument avec _id auto)
| Champ    | Type    | Contraintes    |
|----------|---------|----------------|
| _id      | ObjectId| auto           |
| name     | string  | required       |
| quantity | number  | optional, min 0|
| unit     | string  | optional       |
| checked  | boolean | default: false |

### ServingsOverride (subdocument sans _id)
| Champ    | Type    | Contraintes    |
|----------|---------|----------------|
| recipeId | ObjectId| required       |
| servings | number  | required, min 1|

## Frontend

### Bouton panier (RecipeDetail)
- Icône panier à côté des boutons favoris/partage
- Non connecté → redirige /login
- Connecté → ouvre AddToListModal

### AddToListModal
- Liste des listes existantes (clic → ajoute à cette liste)
- "Créer une nouvelle liste" → champ nom + confirmer
- Input pour ajuster les portions (défaut = servings de la recette)
- Si aucune liste → affiche directement le formulaire création
- Confirmation toast après ajout

### Nav (Layout)
- Icône panier pour les utilisateurs connectés → /shopping-lists

### Page /shopping-lists
- Liste des listes (nom, nb items, date)
- Message si vide : "Ajoutez une recette depuis une fiche recette"
- Clic → /shopping-lists/:id

### Page /shopping-lists/:id
- Nom de la liste (non éditable en v1)
- Compteur X/Y items
- Items triés alphabétiquement, cochables
- Items cochés : barrés + grisés
- Bouton "Copier la liste" → presse-papiers
- Bouton "Supprimer" → ConfirmDialog → retour /shopping-lists

## Dépendances
- auth.md
- recipes.md
