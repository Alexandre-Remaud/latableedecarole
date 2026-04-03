# Infrastructure & Sécurité

## Statut
done

## Description
Configuration de l'infrastructure du projet : monorepo pnpm, CI/CD GitHub Actions, sécurité (rate limiting, helmet, CORS, validation), configuration d'environnement, et gestion des cookies. Ce module couvre tout ce qui n'est pas fonctionnalité métier mais qui est nécessaire au bon fonctionnement et à la sécurité de l'application.

## User Stories

- En tant que développeur, je veux un monorepo avec des scripts unifiés afin de gérer backend et frontend depuis la racine.
- En tant que développeur, je veux une CI qui lint, teste et build automatiquement afin de détecter les régressions.
- En tant qu'opérateur, je veux que l'application soit protégée contre les attaques courantes afin de garantir la sécurité des utilisateurs.
- En tant que développeur, je veux une validation de la configuration d'environnement au démarrage afin d'éviter les erreurs silencieuses.

## Règles métier

- Les variables d'environnement sont validées au démarrage via un schéma Zod.
- JWT_SECRET doit faire au moins 32 caractères.
- Le rate limiting global est de 100 requêtes/minute.
- Le CORS n'autorise que le FRONTEND_URL configuré.
- Les headers de sécurité sont gérés par Helmet.
- La validation globale (ValidationPipe) rejette les champs non déclarés dans les DTOs.
- Les audits de dépendances sont exécutés en CI.

## Modèles de données

N/A

## Endpoints API

N/A (transversal)

## Frontend

### Client API (`lib/api-client.ts`)
- Wrapper `apiFetch` autour de fetch natif
- URL de base : `VITE_API_URL` ou `http://localhost:5000`
- Timeout par défaut : 10 secondes
- Credentials : `include` (envoi automatique des cookies)
- Classes d'erreur : `ApiError` (réponse serveur), `NetworkError` (réseau/timeout)
- Messages d'erreur humanisés en français

### Gestion d'erreurs
- **ErrorBoundary** : capture les erreurs React et affiche un fallback
- **Toast notifications** : react-hot-toast pour feedback succès/erreur

## Critères d'acceptance

### Monorepo
- [ ] `pnpm lint` à la racine lint le backend et le frontend.
- [ ] `pnpm test` à la racine exécute les tests backend et frontend.
- [ ] `pnpm build` à la racine build le backend et le frontend.

### CI/CD (GitHub Actions)
- [ ] La CI s'exécute sur push main et sur toutes les PRs.
- [ ] Backend : type-check, lint, test, build, audit.
- [ ] Frontend : lint, test, build, audit.

### Sécurité
- [ ] Le rate limiting global bloque au-delà de 100 req/min.
- [ ] Le rate limiting auth bloque au-delà de 10 req/min.
- [ ] Les headers Helmet sont présents sur toutes les réponses.
- [ ] Le CORS rejette les origines non autorisées.
- [ ] La ValidationPipe rejette les champs inconnus.
- [ ] Les cookies sont secure en production.

### Configuration
- [ ] L'application refuse de démarrer si MONGO_URI ou JWT_SECRET manquent.
- [ ] JWT_SECRET < 32 caractères est rejeté.
- [ ] PORT a une valeur par défaut (3000).

## Dépendances

Aucune (module fondation).
