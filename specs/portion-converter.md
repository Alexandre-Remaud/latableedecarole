# Conversion d'unités & Portions

## Statut
todo

## Description
Ajustement dynamique des quantités d'ingrédients en fonction du nombre de portions souhaité. Conversion entre unités de mesure (grammes/kg, ml/L, etc.) pour faciliter l'adaptation des recettes.

## User Stories

- En tant que visiteur, je veux ajuster le nombre de portions afin d'adapter les quantités à mes besoins.
- En tant que visiteur, je veux convertir les unités d'un ingrédient afin d'utiliser l'unité qui me convient.

## Règles métier

- L'ajustement de portions applique un ratio proportionnel : `quantité × (portions_souhaitées / portions_originales)`.
- Les quantités ajustées sont arrondies intelligemment (pas de "2.33333 g" mais "2.3 g" ou "2 g" selon le contexte).
- Les conversions d'unités supportées :
  - Poids : g ↔ kg
  - Volume : ml ↔ cl ↔ L
  - Cuillères : c. à café ↔ c. à soupe
- Les unités non convertibles (ex: "pièce", "tranche") ne proposent pas de conversion.
- L'ajustement est purement frontend (pas de requête API, calcul côté client).
- Les valeurs originales de la recette ne sont jamais modifiées.

## Modèles de données

Aucun nouveau modèle. Logique purement frontend.

### Table de conversion (constantes frontend)
```
1 kg = 1000 g
1 L = 100 cl = 1000 ml
1 c. à soupe = 3 c. à café
```

## Endpoints API

Aucun nouvel endpoint.

## Frontend

### Sélecteur de portions (page détail recette)
- Compteur +/- à côté du nombre de portions
- Affiche les portions originales comme référence : "4 portions (original : 2)"
- Toutes les quantités d'ingrédients se mettent à jour en temps réel
- Bouton "Réinitialiser" pour revenir aux portions originales

### Conversion d'unité (sur chaque ingrédient)
- Clic sur l'unité d'un ingrédient pour afficher les alternatives
- Ex : "500 g" → dropdown avec "0.5 kg"
- Uniquement pour les unités convertibles
- La conversion est indépendante de l'ajustement de portions (les deux se combinent)

### Règles d'arrondi
- Quantités ≥ 100 : arrondir à l'entier
- Quantités ≥ 10 : arrondir à 1 décimale
- Quantités < 10 : arrondir à 2 décimales
- Quantités très petites (< 0.1) : afficher en fraction si pertinent (¼, ½, ¾)

## Critères d'acceptance

- [ ] Un visiteur peut ajuster le nombre de portions sur la page détail.
- [ ] Les quantités d'ingrédients se mettent à jour proportionnellement en temps réel.
- [ ] Les quantités sont arrondies de manière lisible.
- [ ] Un visiteur peut cliquer sur une unité pour la convertir.
- [ ] Les conversions supportées : g/kg, ml/cl/L, c. à café/c. à soupe.
- [ ] Le bouton "Réinitialiser" restaure les valeurs originales.
- [ ] Les unités non convertibles (pièce, tranche) n'affichent pas d'option de conversion.
- [ ] Ajustement de portions et conversion d'unité se combinent correctement.

## Dépendances

- [recipes.md](recipes.md) : données des ingrédients et portions.
