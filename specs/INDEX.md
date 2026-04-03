# Chez Carole - Cahier des charges

Application de gestion de recettes de cuisine. Monorepo avec backend NestJS (MongoDB) et frontend React (TanStack Router).

## Stack technique

| Couche    | Technologie                                      |
| --------- | ------------------------------------------------ |
| Backend   | NestJS 11, Mongoose 9, Passport JWT, Zod         |
| Frontend  | React 19, TanStack Router, TanStack Query, Vite 7 |
| Forms     | react-hook-form + Zod                            |
| Styling   | Tailwind CSS 4                                   |
| Tests     | Jest (backend), Vitest (frontend)                |
| CI/CD     | GitHub Actions                                   |
| DB        | MongoDB                                          |
| Package   | pnpm workspaces                                  |

## Features

### Existant (done)

| Feature                          | Fichier                                    | Statut |
| -------------------------------- | ------------------------------------------ | ------ |
| Authentification & Utilisateurs  | [auth.md](auth.md)                         | done   |
| Gestion des recettes             | [recipes.md](recipes.md)                   | done   |
| Infrastructure & Sécurité        | [infrastructure.md](infrastructure.md)     | done   |

### Priorité haute

| Feature                          | Fichier                                    | Statut |
| -------------------------------- | ------------------------------------------ | ------ |
| Profil utilisateur               | [profile.md](profile.md)                   | todo   |
| Favoris                          | [favorites.md](favorites.md)               | todo   |
| Upload d'images                  | [image-upload.md](image-upload.md)         | todo   |
| Notation & Avis                  | [ratings.md](ratings.md)                   | todo   |

### Priorité moyenne

| Feature                          | Fichier                                    | Statut |
| -------------------------------- | ------------------------------------------ | ------ |
| Partage & Liens publics          | [sharing.md](sharing.md)                   | todo   |
| Impression & Export PDF          | [print-export.md](print-export.md)         | todo   |
| Liste de courses                 | [shopping-list.md](shopping-list.md)       | todo   |
| Tags personnalisés               | [tags.md](tags.md)                         | todo   |
| Collections / Carnets            | [collections.md](collections.md)           | todo   |

### Priorité basse

| Feature                          | Fichier                                    | Statut |
| -------------------------------- | ------------------------------------------ | ------ |
| Planning de repas                | [meal-planning.md](meal-planning.md)       | todo   |
| Conversion d'unités & Portions   | [portion-converter.md](portion-converter.md) | todo |
| Mode cuisine                     | [cooking-mode.md](cooking-mode.md)         | todo   |
| Dashboard admin                  | [admin-dashboard.md](admin-dashboard.md)   | todo   |

## Ordre de développement recommandé

Les dépendances entre features imposent un ordre :

1. **Upload d'images** — nécessaire pour les avatars (profil) et les recettes
2. **Profil utilisateur** — dépend de l'upload (avatar)
3. **Favoris** — affiché dans le profil
4. **Notation & Avis** — enrichit les recettes
5. **Tags personnalisés** — enrichit les recettes
6. **Partage & Liens publics** — dépend de l'upload (OG image)
7. **Impression & Export PDF** — dépend de l'upload (images dans le PDF)
8. **Collections / Carnets** — dépend des favoris
9. **Liste de courses** — dépend des recettes + favoris
10. **Conversion d'unités & Portions** — indépendant (frontend only)
11. **Planning de repas** — dépend de la liste de courses + favoris
12. **Mode cuisine** — indépendant (frontend only)
13. **Dashboard admin** — dépend de tout le reste (stats agrégées)
