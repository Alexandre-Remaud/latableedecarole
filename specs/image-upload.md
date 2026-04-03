# Upload d'images

## Statut
todo

## Description
Système d'upload d'images pour les recettes et les avatars utilisateurs. Les images sont stockées sur un service externe (S3 ou Cloudinary) avec génération de thumbnails pour optimiser l'affichage. Remplace le champ `imageUrl` manuel par un vrai upload.

## User Stories

- En tant qu'utilisateur connecté, je veux uploader une photo pour ma recette afin de la rendre plus attractive.
- En tant qu'utilisateur connecté, je veux uploader un avatar afin de personnaliser mon profil.
- En tant que visiteur, je veux voir des images optimisées afin d'avoir un chargement rapide.
- En tant qu'utilisateur connecté, je veux supprimer une image uploadée afin de la remplacer.

## Règles métier

- Formats acceptés : JPEG, PNG, WebP.
- Taille max : 5 Mo par image.
- Les images sont redimensionnées côté serveur en plusieurs tailles :
  - Thumbnail : 300x300 (cartes recette, avatar)
  - Medium : 800x600 (détail recette)
  - Original : conservé (zoom)
- Les images sont stockées sur un service cloud (S3 ou Cloudinary).
- L'upload retourne une URL publique.
- La suppression d'une recette supprime ses images associées.
- Un utilisateur ne peut uploader que pour ses propres recettes / son propre avatar.
- Validation MIME type côté serveur (pas uniquement l'extension).

## Modèles de données

### Image
| Champ        | Type     | Contraintes                      |
| ------------ | -------- | -------------------------------- |
| _id          | ObjectId | PK, auto                         |
| originalUrl  | string   | required, URL                    |
| thumbnailUrl | string   | required, URL                    |
| mediumUrl    | string   | required, URL                    |
| publicId     | string   | required (ID cloud pour suppression) |
| userId       | ObjectId | ref: User, required              |
| createdAt    | Date     | auto                             |

### Modifications aux modèles existants
- **Recipe.imageUrl** : devient une référence vers Image (ou stocke directement les URLs des différentes tailles)
- **User.avatarUrl** : idem

## Endpoints API

### POST /upload/image
- **Auth** : protégé
- **Body** : multipart/form-data avec champ `file`
- **Réponse 201** : `{ originalUrl, thumbnailUrl, mediumUrl, publicId }`
- **Erreurs** : 400 (format invalide, taille dépassée), 401 (non connecté)

### DELETE /upload/image/:publicId
- **Auth** : protégé (propriétaire uniquement)
- **Réponse 200** : `{ message }`
- **Erreurs** : 401 (non connecté), 403 (non propriétaire), 404 (image non trouvée)

## Frontend

### Composant ImageUpload
- Zone de drag & drop + bouton "Choisir un fichier"
- Preview de l'image avant upload
- Barre de progression pendant l'upload
- Bouton supprimer pour retirer l'image
- Validation côté client : format et taille avant envoi
- Utilisé dans le formulaire recette et dans les paramètres profil

### Affichage des images
- Cartes recette : thumbnail (300x300)
- Détail recette : medium (800x600)
- Avatar dans le header/profil : thumbnail
- Placeholder si pas d'image (icône ou couleur)
- Lazy loading des images dans les listes

## Critères d'acceptance

- [ ] Un utilisateur peut uploader une image JPEG, PNG ou WebP de moins de 5 Mo.
- [ ] L'image est redimensionnée en 3 tailles (thumbnail, medium, original).
- [ ] L'URL de l'image est associée à la recette ou au profil.
- [ ] Un utilisateur peut supprimer une image qu'il a uploadée.
- [ ] Les images sont servies depuis un CDN / service cloud.
- [ ] Le composant d'upload montre un preview et une barre de progression.
- [ ] Les formats non supportés sont rejetés côté client et serveur.
- [ ] La suppression d'une recette supprime ses images du cloud.

## Dépendances

- [auth.md](auth.md) : authentification requise pour uploader.
- [recipes.md](recipes.md) : images liées aux recettes.
- [profile.md](profile.md) : avatar utilisateur.
