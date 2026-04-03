# Partage & Liens publics

## Statut
todo

## Description
Fonctionnalité de partage de recettes via des liens avec preview OpenGraph pour un affichage riche sur les réseaux sociaux et messageries. Chaque recette a une URL publique avec des métadonnées optimisées pour le partage.

## User Stories

- En tant qu'utilisateur, je veux partager une recette par lien afin de l'envoyer à quelqu'un.
- En tant que destinataire d'un lien, je veux voir un aperçu riche (titre, image, description) afin de savoir de quoi il s'agit avant de cliquer.
- En tant qu'utilisateur, je veux copier le lien d'une recette en un clic afin de le partager facilement.

## Règles métier

- Chaque recette a une URL publique partageable (déjà le cas avec `/recipes/:id`).
- Les métadonnées OpenGraph doivent inclure : titre, description (tronquée à 160 chars), image (thumbnail), type (article).
- Les métadonnées Twitter Card doivent être présentes (summary_large_image).
- Le bouton de partage propose : copier le lien, partager via Web Share API (mobile).
- Pas de système de partage privé pour l'instant (les recettes sont toutes publiques).

## Modèles de données

Aucun nouveau modèle. Les métadonnées sont générées dynamiquement à partir des données existantes de la recette.

## Endpoints API

### GET /recipes/:id/og
- **Auth** : public
- **Réponse 200** : métadonnées OpenGraph au format JSON (pour le SSR/prerender)
- **Champs** : `{ title, description, imageUrl, url }`
- **Note** : peut être géré côté frontend avec un service de prerendering (prerender.io) ou côté serveur si SSR

## Frontend

### Bouton Partager (page détail recette)
- Icône de partage à côté du titre
- Au clic :
  - Sur mobile/navigateurs compatibles : ouvre Web Share API (partage natif)
  - Sinon : copie le lien dans le presse-papier + toast "Lien copié"

### Métadonnées OpenGraph
- Balises `<meta>` dans le `<head>` pour chaque page recette :
  - `og:title` : titre de la recette
  - `og:description` : description tronquée à 160 caractères
  - `og:image` : image medium de la recette (ou placeholder)
  - `og:url` : URL canonique
  - `og:type` : article
  - `twitter:card` : summary_large_image
- Implémentation via un service de prerendering ou react-helmet-async

## Critères d'acceptance

- [ ] Un bouton de partage est présent sur la page détail de chaque recette.
- [ ] Le lien est copiable en un clic avec feedback visuel.
- [ ] Sur mobile, le Web Share API natif est utilisé si disponible.
- [ ] Un lien partagé sur un réseau social affiche titre, description et image.
- [ ] Les métadonnées OG sont présentes dans le HTML servi aux crawlers.
- [ ] La description OG est tronquée à 160 caractères.

## Dépendances

- [recipes.md](recipes.md) : les données de la recette alimentent les métadonnées.
- [image-upload.md](image-upload.md) : l'image de la recette est utilisée dans l'OG image.
