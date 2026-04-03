# Impression & Export PDF

## Statut
todo

## Description
Vue optimisée pour l'impression et export PDF des recettes. Permet aux utilisateurs d'imprimer une recette ou de la télécharger en PDF avec une mise en page propre, sans éléments d'interface (navigation, footer, boutons).

## User Stories

- En tant qu'utilisateur, je veux imprimer une recette afin de l'avoir sur papier en cuisine.
- En tant qu'utilisateur, je veux exporter une recette en PDF afin de la sauvegarder hors ligne.

## Règles métier

- La vue impression contient uniquement : titre, image (si présente), ingrédients, étapes, temps de préparation/cuisson, portions, difficulté.
- Pas de header, footer, boutons, publicités dans la vue impression.
- Le PDF reprend le même contenu que la vue impression.
- L'export PDF est généré côté client (pas de charge serveur supplémentaire).
- La mise en page est optimisée pour le format A4.

## Modèles de données

Aucun nouveau modèle.

## Endpoints API

Aucun nouvel endpoint. Tout est géré côté frontend.

## Frontend

### Bouton Imprimer (page détail recette)
- Icône imprimante à côté du bouton de partage
- Au clic : ouvre la boîte de dialogue d'impression du navigateur
- Styles CSS `@media print` pour masquer les éléments non pertinents

### Bouton Export PDF
- Icône PDF à côté du bouton imprimer
- Au clic : génère un PDF côté client (via html2pdf.js ou react-pdf)
- Téléchargement automatique : `recette-{titre-slug}.pdf`

### Vue impression (CSS)
- `@media print` :
  - Masquer : header, footer, navigation, boutons, sidebar
  - Afficher : titre, image, description, ingrédients (en colonnes), étapes numérotées
  - Typographie lisible, marges adaptées au A4
  - Pas de coupure au milieu d'une étape (page-break-inside: avoid)

## Critères d'acceptance

- [ ] Un bouton "Imprimer" est présent sur la page détail.
- [ ] L'impression n'inclut que le contenu de la recette (pas d'UI).
- [ ] Les étapes ne sont pas coupées entre deux pages.
- [ ] Un bouton "Export PDF" génère un fichier téléchargeable.
- [ ] Le PDF contient titre, image, ingrédients et étapes lisibles.
- [ ] Le nom du fichier PDF contient le titre de la recette.

## Dépendances

- [recipes.md](recipes.md) : données de la recette.
- [image-upload.md](image-upload.md) : image incluse dans l'impression/PDF.
