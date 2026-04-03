# Planning de repas

## Statut
todo

## Description
Calendrier hebdomadaire permettant aux utilisateurs de planifier leurs repas en assignant des recettes à des créneaux (petit-déjeuner, déjeuner, dîner). Génération automatique d'une liste de courses à partir du planning.

## User Stories

- En tant qu'utilisateur connecté, je veux planifier mes repas sur une semaine afin d'organiser ma cuisine.
- En tant qu'utilisateur connecté, je veux assigner une recette à un créneau (jour + repas) afin de savoir quoi cuisiner.
- En tant qu'utilisateur connecté, je veux voir mon planning de la semaine en cours afin d'avoir une vue d'ensemble.
- En tant qu'utilisateur connecté, je veux naviguer entre les semaines afin de planifier à l'avance.
- En tant qu'utilisateur connecté, je veux générer une liste de courses depuis mon planning afin de tout acheter en une fois.
- En tant qu'utilisateur connecté, je veux déplacer une recette d'un créneau à un autre afin de réorganiser ma semaine.

## Règles métier

- Un planning est organisé par semaine (lundi à dimanche).
- Chaque jour a 3 créneaux : petit-déjeuner, déjeuner, dîner.
- Un créneau peut contenir 0 ou plusieurs recettes.
- Les portions peuvent être ajustées par créneau (indépendamment de la recette originale).
- La génération de liste de courses agrège tous les ingrédients du planning de la semaine.
- Un utilisateur ne peut voir/modifier que son propre planning.
- Les plannings sont persistés (pas perdus au refresh).

## Modèles de données

### MealPlan
| Champ     | Type       | Contraintes                  |
| --------- | ---------- | ---------------------------- |
| _id       | ObjectId   | PK, auto                     |
| userId    | ObjectId   | ref: User, required          |
| weekStart | Date       | required (lundi de la semaine) |
| meals     | Meal[]     | required                     |
| createdAt | Date       | auto                         |
| updatedAt | Date       | auto                         |

**Index unique** : `{ userId, weekStart }`

### Meal (sous-document)
| Champ    | Type     | Contraintes                                        |
| -------- | -------- | -------------------------------------------------- |
| day      | number   | required, 0-6 (lundi=0, dimanche=6)                |
| slot     | enum     | breakfast \| lunch \| dinner, required              |
| recipeId | ObjectId | ref: Recipe, required                              |
| servings | number   | optional, min 1, default: recette originale        |

## Endpoints API

### GET /meal-plans?weekStart=YYYY-MM-DD
- **Auth** : protégé
- **Réponse 200** : `MealPlan` (avec recettes populées)
- **Réponse 200 (vide)** : `{ meals: [] }` si pas de planning pour cette semaine

### PUT /meal-plans
- **Auth** : protégé
- **Body** : `{ weekStart, meals: Meal[] }`
- **Réponse 200** : `MealPlan` (créé ou mis à jour, upsert)

### POST /meal-plans/shopping-list
- **Auth** : protégé
- **Body** : `{ weekStart }`
- **Réponse 201** : `ShoppingList` générée depuis le planning
- **Logique** : récupère toutes les recettes du planning, applique les portions, agrège les ingrédients

## Frontend

### Page Planning (`/meal-plan`)
- Vue calendrier hebdomadaire (grille 7 colonnes x 3 lignes)
- Navigation semaine précédente / suivante
- Chaque cellule (jour + créneau) :
  - Affiche les recettes assignées (nom + thumbnail)
  - Bouton "+" pour ajouter une recette (modal de recherche/favoris)
  - Bouton "x" pour retirer une recette
  - Portions ajustables
- Drag & drop pour déplacer une recette entre créneaux
- Bouton "Générer la liste de courses" pour toute la semaine
- Vue responsive : sur mobile, affichage jour par jour

### Modal d'ajout de recette
- Recherche par titre
- Accès rapide aux favoris
- Ajustement des portions
- Aperçu de la recette (titre + image)

## Critères d'acceptance

- [ ] Un utilisateur peut voir son planning hebdomadaire.
- [ ] Un utilisateur peut naviguer entre les semaines.
- [ ] Un utilisateur peut ajouter une recette à un créneau (jour + repas).
- [ ] Un utilisateur peut retirer une recette d'un créneau.
- [ ] Un utilisateur peut déplacer une recette par drag & drop.
- [ ] Les portions sont ajustables par créneau.
- [ ] Un utilisateur peut générer une liste de courses depuis le planning.
- [ ] Le planning est persisté et restauré au rechargement.
- [ ] L'affichage est responsive (mobile = vue jour par jour).

## Dépendances

- [auth.md](auth.md) : authentification requise.
- [recipes.md](recipes.md) : les repas référencent des recettes.
- [shopping-list.md](shopping-list.md) : génération de liste de courses depuis le planning.
- [favorites.md](favorites.md) : accès rapide aux favoris dans le sélecteur.
