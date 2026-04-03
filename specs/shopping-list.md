# Liste de courses

## Statut
todo

## Description
Génération d'une liste de courses à partir des ingrédients d'une ou plusieurs recettes. Les ingrédients identiques sont regroupés et leurs quantités sommées. La liste est exportable et cochable.

## User Stories

- En tant qu'utilisateur connecté, je veux générer une liste de courses à partir d'une recette afin de savoir quoi acheter.
- En tant qu'utilisateur connecté, je veux combiner les ingrédients de plusieurs recettes dans une seule liste afin de faire mes courses en une fois.
- En tant qu'utilisateur connecté, je veux ajuster le nombre de portions avant de générer la liste afin d'adapter les quantités.
- En tant qu'utilisateur connecté, je veux cocher les ingrédients achetés afin de suivre ma progression en magasin.
- En tant qu'utilisateur connecté, je veux exporter ma liste de courses afin de l'utiliser hors de l'application.

## Règles métier

- Les ingrédients avec le même nom et la même unité sont regroupés (quantités sommées).
- Le regroupement est case-insensitive et ignore les espaces superflus.
- L'ajustement des portions applique un ratio proportionnel sur toutes les quantités.
- La liste de courses est liée au compte utilisateur (persistée).
- Un utilisateur peut avoir plusieurs listes de courses.
- Les items cochés sont persistés (pas perdus au refresh).
- Les ingrédients sans quantité (ex: "sel", "poivre") sont ajoutés sans sommation.

## Modèles de données

### ShoppingList
| Champ     | Type             | Contraintes           |
| --------- | ---------------- | --------------------- |
| _id       | ObjectId         | PK, auto              |
| userId    | ObjectId         | ref: User, required   |
| name      | string           | required, max 100     |
| items     | ShoppingItem[]   | required              |
| recipeIds | ObjectId[]       | ref: Recipe           |
| createdAt | Date             | auto                  |
| updatedAt | Date             | auto                  |

### ShoppingItem (sous-document)
| Champ    | Type    | Contraintes      |
| -------- | ------- | ---------------- |
| name     | string  | required         |
| quantity | number  | optional, min 0  |
| unit     | string  | optional         |
| checked  | boolean | default: false   |

## Endpoints API

### POST /shopping-lists
- **Auth** : protégé
- **Body** : `{ name, recipeIds: string[], servingsOverrides?: { recipeId: string, servings: number }[] }`
- **Réponse 201** : `ShoppingList` avec ingrédients agrégés
- **Logique** : récupère les ingrédients des recettes, applique les ratios de portions, regroupe et somme

### GET /shopping-lists
- **Auth** : protégé
- **Réponse 200** : `{ data: ShoppingList[], total: number }`

### GET /shopping-lists/:id
- **Auth** : protégé (propriétaire)
- **Réponse 200** : `ShoppingList`

### PATCH /shopping-lists/:id
- **Auth** : protégé (propriétaire)
- **Body** : `{ name?, items? }` (pour cocher/décocher des items ou renommer)
- **Réponse 200** : `ShoppingList` mis à jour

### DELETE /shopping-lists/:id
- **Auth** : protégé (propriétaire)
- **Réponse 200** : `{ message }`

## Frontend

### Bouton "Liste de courses" (page détail recette)
- Icône panier à côté des boutons d'action
- Au clic : ajoute la recette à une nouvelle liste ou à une liste existante (dropdown)

### Page Mes listes de courses (`/shopping-lists`)
- Liste des listes de courses de l'utilisateur
- Chaque liste affiche : nom, nombre d'items, date, recettes sources
- Bouton créer une nouvelle liste

### Page Détail liste (`/shopping-lists/:id`)
- Nom de la liste (éditable)
- Items groupés par catégorie ou non
- Checkbox pour cocher chaque item
- Items cochés barrés et grisés
- Compteur : X/Y items achetés
- Bouton "Exporter" : copie en texte ou partage

### Modal "Créer une liste"
- Sélection de recettes (depuis les favoris ou recherche)
- Ajustement des portions par recette
- Preview des ingrédients agrégés avant création

## Critères d'acceptance

- [ ] Un utilisateur peut créer une liste de courses à partir d'une ou plusieurs recettes.
- [ ] Les ingrédients identiques (même nom + même unité) sont regroupés et sommés.
- [ ] L'utilisateur peut ajuster les portions avant génération.
- [ ] Les items sont cochables avec persistance.
- [ ] Les listes sont sauvegardées et accessibles depuis le profil.
- [ ] Un utilisateur peut supprimer une liste.
- [ ] La liste est exportable en texte.

## Dépendances

- [auth.md](auth.md) : authentification requise.
- [recipes.md](recipes.md) : source des ingrédients.
- [favorites.md](favorites.md) : sélection rapide depuis les favoris lors de la création.
