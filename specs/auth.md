# Authentification & Utilisateurs

## Statut
done

## Description
Système d'authentification complet avec inscription, connexion, rafraîchissement de tokens et déconnexion. Gestion des rôles (USER, ADMIN) pour le contrôle d'accès aux ressources. Les tokens JWT sont stockés dans des cookies httpOnly pour la sécurité.

## User Stories

- En tant que visiteur, je veux créer un compte afin d'accéder aux fonctionnalités réservées aux utilisateurs connectés.
- En tant que visiteur, je veux me connecter avec mon email et mot de passe afin d'accéder à mon compte.
- En tant qu'utilisateur connecté, je veux que ma session soit maintenue automatiquement afin de ne pas avoir à me reconnecter fréquemment.
- En tant qu'utilisateur connecté, je veux me déconnecter afin de sécuriser mon compte.
- En tant qu'utilisateur connecté, je veux consulter mon profil afin de vérifier mes informations.

## Règles métier

- L'email doit être unique, normalisé en minuscules et trimé.
- Le mot de passe doit contenir au moins 8 caractères, avec au moins une majuscule, une minuscule et un chiffre.
- Le nom doit contenir entre 2 et 100 caractères.
- Le rôle par défaut à l'inscription est USER.
- Seul un mécanisme interne/admin peut attribuer le rôle ADMIN (pas de self-promotion).
- Les refresh tokens sont hachés (bcrypt) côté serveur.
- Un refresh token est invalidé à chaque rotation (single-use).
- La déconnexion invalide tous les refresh tokens de l'utilisateur.
- Le rate limiting sur les endpoints auth est de 10 requêtes/minute.

## Modèles de données

### User
| Champ      | Type     | Contraintes                          |
| ---------- | -------- | ------------------------------------ |
| _id        | ObjectId | PK, auto                             |
| email      | string   | unique, required, lowercase, trimmed |
| password   | string   | required, bcrypt hashé (10 rounds)   |
| name       | string   | required, 2-100 chars                |
| role       | enum     | USER \| ADMIN, default: USER         |
| createdAt  | Date     | auto (timestamps)                    |
| updatedAt  | Date     | auto (timestamps)                    |

### RefreshToken
| Champ     | Type     | Contraintes                              |
| --------- | -------- | ---------------------------------------- |
| userId    | ObjectId | ref: User, required                      |
| token     | string   | bcrypt hashé, unique, indexé             |
| expiresAt | Date     | required, TTL index (expireAfterSeconds: 0) |

## Endpoints API

### POST /auth/register
- **Auth** : public (rate limited 10/min)
- **Body** : `{ email: string, password: string, name: string }`
- **Réponse 201** : `{ user: { id, email, name, role }, accessToken, refreshToken }` + cookies
- **Erreurs** : 400 (validation), 409 (email déjà utilisé)

### POST /auth/login
- **Auth** : public (rate limited 10/min)
- **Body** : `{ email: string, password: string }`
- **Réponse 200** : `{ user: { id, email, name, role }, accessToken, refreshToken }` + cookies
- **Erreurs** : 400 (validation), 401 (credentials invalides)

### POST /auth/refresh
- **Auth** : public (rate limited 10/min)
- **Source** : cookie `refresh_token`
- **Réponse 200** : `{ message }` + nouveaux cookies (access_token, refresh_token)
- **Erreurs** : 401 (token invalide ou expiré)

### POST /auth/logout
- **Auth** : protégé (JWT requis)
- **Réponse 200** : `{ message }` + cookies vidés
- **Effet** : supprime tous les refresh tokens de l'utilisateur

### GET /auth/me
- **Auth** : protégé (JWT requis)
- **Réponse 200** : `{ id, email, role }`

## Frontend

### Page Login (`/login`)
- Formulaire email + mot de passe validé par Zod
- Messages d'erreur serveur affichés
- Lien vers la page d'inscription
- Redirection après connexion réussie

### Page Register (`/register`)
- Formulaire email + mot de passe + nom validé par Zod
- Validation côté client (force du mot de passe)
- Lien vers la page de connexion
- Redirection après inscription réussie

### Composants auth
- **AuthProvider** : contexte React qui restore la session au montage via `GET /auth/me`
- **useAuth()** : hook exposant `user`, `isLoading`, `login()`, `register()`, `logout()`
- **Layout** : affiche Login/Register si déconnecté, menu utilisateur + bouton déconnexion si connecté

### Gestion des cookies
| Cookie        | Durée    | Flags                                    |
| ------------- | -------- | ---------------------------------------- |
| access_token  | 15 min   | httpOnly, secure (prod), sameSite: lax   |
| refresh_token | 7 jours  | httpOnly, secure (prod), sameSite: lax   |

## Critères d'acceptance

- [ ] Un utilisateur peut s'inscrire avec un email unique, un mot de passe fort et un nom.
- [ ] Un utilisateur peut se connecter et reçoit des cookies JWT valides.
- [ ] Les cookies sont httpOnly et secure en production.
- [ ] Le refresh token est rotatif : l'ancien est invalidé quand un nouveau est émis.
- [ ] La déconnexion supprime tous les refresh tokens et vide les cookies.
- [ ] Les endpoints auth sont limités à 10 req/min.
- [ ] Un mot de passe faible est rejeté côté client et côté serveur.
- [ ] Le profil retourne les infos de l'utilisateur connecté.
- [ ] Un utilisateur non connecté ne peut pas accéder aux routes protégées.

## Dépendances

Aucune (module fondation).
