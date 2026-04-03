# Dashboard admin

## Statut
todo

## Description
Interface d'administration pour les utilisateurs ayant le rôle ADMIN. Fournit des statistiques sur l'application, la modération des avis, et la gestion des utilisateurs.

## User Stories

- En tant qu'admin, je veux voir des statistiques globales afin de suivre l'activité de l'application.
- En tant qu'admin, je veux voir la liste des utilisateurs afin de gérer les comptes.
- En tant qu'admin, je veux modérer les avis afin de supprimer les contenus inappropriés.
- En tant qu'admin, je veux voir les recettes les plus populaires afin de comprendre ce qui plaît.
- En tant qu'admin, je veux pouvoir changer le rôle d'un utilisateur afin de gérer les permissions.

## Règles métier

- Seuls les utilisateurs avec le rôle ADMIN ont accès au dashboard.
- Un admin ne peut pas se retirer son propre rôle ADMIN (protection).
- Les statistiques sont calculées en temps réel ou avec un cache court (quelques minutes).
- La suppression d'un utilisateur supprime aussi ses recettes, favoris, avis et collections (cascade).
- La modération des avis = suppression ou masquage.
- Les actions admin sont loguées (qui a fait quoi, quand) — optionnel en V1.

## Modèles de données

Aucun nouveau modèle. Utilise les modèles existants via des agrégations.

### Statistiques agrégées
- Nombre total d'utilisateurs
- Nombre total de recettes
- Nombre total d'avis
- Nombre de recettes créées cette semaine / ce mois
- Nombre d'inscriptions cette semaine / ce mois
- Top 10 recettes par note moyenne
- Top 10 recettes par nombre de favoris

## Endpoints API

### GET /admin/stats
- **Auth** : protégé (admin uniquement)
- **Réponse 200** :
```json
{
  "usersCount": 150,
  "recipesCount": 320,
  "reviewsCount": 890,
  "newUsersThisWeek": 12,
  "newRecipesThisWeek": 25,
  "topRatedRecipes": [...],
  "topFavoritedRecipes": [...]
}
```

### GET /admin/users
- **Auth** : protégé (admin uniquement)
- **Query params** : `search?`, `role?`, `skip?`, `limit?`
- **Réponse 200** : `{ data: User[], total: number }`
- **Champs User** : id, email, name, role, createdAt, recipesCount

### PATCH /admin/users/:id/role
- **Auth** : protégé (admin uniquement)
- **Body** : `{ role: "USER" | "ADMIN" }`
- **Réponse 200** : `User` mis à jour
- **Erreurs** : 400 (auto-modification), 404

### DELETE /admin/users/:id
- **Auth** : protégé (admin uniquement)
- **Réponse 200** : `{ message }`
- **Effet** : suppression cascade (user + recettes + favoris + avis + collections)
- **Erreurs** : 400 (auto-suppression), 404

### GET /admin/reviews
- **Auth** : protégé (admin uniquement)
- **Query params** : `reported?`, `skip?`, `limit?`
- **Réponse 200** : `{ data: Review[], total: number }` (avec user et recipe populés)

### DELETE /admin/reviews/:id
- **Auth** : protégé (admin uniquement)
- **Réponse 200** : `{ message }`

## Frontend

### Page Dashboard Admin (`/admin`)
- Accès via le menu utilisateur (visible uniquement pour les admins)
- Redirect si non-admin

### Section Statistiques
- Cartes avec chiffres clés : utilisateurs, recettes, avis
- Graphique d'activité (inscriptions et recettes par semaine) — optionnel V1
- Top 10 recettes (par note et par favoris) avec liens

### Section Utilisateurs (`/admin/users`)
- Tableau : nom, email, rôle, date d'inscription, nombre de recettes
- Recherche par nom/email
- Filtre par rôle
- Actions : changer le rôle, supprimer (avec confirmation)
- Pagination

### Section Modération (`/admin/reviews`)
- Tableau : recette, auteur, note, commentaire, date
- Bouton supprimer (avec confirmation)
- Filtre par signalement (si système de signalement implémenté)
- Pagination

## Critères d'acceptance

- [ ] Seuls les admins peuvent accéder au dashboard.
- [ ] Les statistiques globales sont affichées (users, recettes, avis).
- [ ] Un admin peut voir la liste des utilisateurs avec recherche et filtres.
- [ ] Un admin peut changer le rôle d'un utilisateur.
- [ ] Un admin ne peut pas se retirer son propre rôle.
- [ ] Un admin peut supprimer un utilisateur (avec cascade).
- [ ] Un admin ne peut pas se supprimer lui-même.
- [ ] Un admin peut voir et supprimer les avis.
- [ ] Le top 10 des recettes est affiché par note et par favoris.

## Dépendances

- [auth.md](auth.md) : rôle ADMIN, guards.
- [recipes.md](recipes.md) : stats et gestion des recettes.
- [ratings.md](ratings.md) : modération des avis.
- [favorites.md](favorites.md) : stats favoris.
- [collections.md](collections.md) : suppression cascade.
