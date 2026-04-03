# Profil utilisateur

## Statut
todo

## Description
Page de profil permettant à un utilisateur de consulter et modifier ses informations personnelles, de voir ses recettes publiées et ses favoris. Chaque utilisateur a un profil public (visible par tous) et des paramètres privés (modifiables uniquement par lui).

## User Stories

- En tant qu'utilisateur connecté, je veux accéder à ma page de profil afin de voir un résumé de mon activité.
- En tant qu'utilisateur connecté, je veux modifier mon nom afin de mettre à jour mon identité.
- En tant qu'utilisateur connecté, je veux modifier mon email afin de changer mon adresse de contact.
- En tant qu'utilisateur connecté, je veux changer mon mot de passe afin de sécuriser mon compte.
- En tant qu'utilisateur connecté, je veux ajouter ou modifier mon avatar afin de personnaliser mon profil.
- En tant que visiteur, je veux consulter le profil public d'un utilisateur afin de voir ses recettes.

## Règles métier

- Le changement de mot de passe nécessite la saisie de l'ancien mot de passe.
- Le changement d'email nécessite la saisie du mot de passe pour confirmation.
- Le nouvel email doit être unique (pas déjà utilisé par un autre compte).
- L'avatar est optionnel. Si absent, afficher les initiales ou un placeholder.
- Le profil public affiche : nom, avatar, date d'inscription, nombre de recettes, recettes publiées.
- Le profil privé (mon profil) affiche en plus : email, favoris, boutons de modification.

## Modèles de données

### Modifications au modèle User
| Champ     | Type   | Contraintes                  |
| --------- | ------ | ---------------------------- |
| avatarUrl | string | optional, URL valide         |
| bio       | string | optional, max 500 caractères |

## Endpoints API

### GET /users/:id/profile
- **Auth** : public
- **Réponse 200** : `{ id, name, avatarUrl, bio, createdAt, recipesCount }`
- **Erreurs** : 404 (utilisateur non trouvé)

### PATCH /users/me
- **Auth** : protégé (utilisateur connecté, soi-même uniquement)
- **Body** : `{ name?, bio?, avatarUrl? }`
- **Réponse 200** : `User` mis à jour
- **Erreurs** : 400 (validation)

### PATCH /users/me/email
- **Auth** : protégé
- **Body** : `{ newEmail, password }`
- **Réponse 200** : `{ message }` + user mis à jour
- **Erreurs** : 400 (validation), 401 (mot de passe incorrect), 409 (email déjà utilisé)

### PATCH /users/me/password
- **Auth** : protégé
- **Body** : `{ currentPassword, newPassword }`
- **Réponse 200** : `{ message }`
- **Erreurs** : 400 (validation), 401 (ancien mot de passe incorrect)

### GET /users/:id/recipes
- **Auth** : public
- **Query params** : `skip?`, `limit?`
- **Réponse 200** : `{ data: Recipe[], total: number }`

## Frontend

### Page Mon Profil (`/profile`)
- Section infos : avatar, nom, bio, email, date d'inscription
- Boutons : modifier le profil, changer l'email, changer le mot de passe
- Onglets ou sections : "Mes recettes", "Mes favoris"
- Liste des recettes de l'utilisateur avec pagination
- Liste des favoris avec pagination
- Statistiques : nombre de recettes publiées, nombre de favoris

### Page Profil Public (`/users/:id`)
- Avatar, nom, bio, date d'inscription
- Liste des recettes publiées par cet utilisateur
- Pas d'accès aux favoris ni aux paramètres

### Modals / Formulaires
- **EditProfileModal** : modifier nom, bio, avatar
- **ChangeEmailModal** : nouveau email + mot de passe actuel
- **ChangePasswordModal** : ancien mot de passe + nouveau mot de passe (x2)

## Critères d'acceptance

- [ ] Un utilisateur connecté peut voir sa page profil avec ses infos, recettes et favoris.
- [ ] Un utilisateur peut modifier son nom et sa bio.
- [ ] Un utilisateur peut changer son email en fournissant son mot de passe.
- [ ] Un utilisateur peut changer son mot de passe en fournissant l'ancien.
- [ ] Un visiteur peut voir le profil public d'un utilisateur (nom, avatar, recettes).
- [ ] Le profil public ne montre pas l'email ni les favoris.
- [ ] L'avatar est optionnel avec un fallback visuel.

## Dépendances

- [auth.md](auth.md) : authentification requise pour les actions privées.
- [favorites.md](favorites.md) : affichage des favoris dans le profil.
- [image-upload.md](image-upload.md) : upload de l'avatar.
