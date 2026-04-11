---
name: gen-test
description: Génère un fichier de test pour un service/controller NestJS ou une feature frontend React
disable-model-invocation: true
---

Génère un fichier de test pour le fichier passé en argument (`$ARGUMENTS`).

## Étape 1 — Lire le fichier cible

Lis le fichier à tester avant d'écrire quoi que ce soit.

## Étape 2 — Identifier le type de test

**Backend (`*.service.ts` → `*.service.spec.ts` / `*.controller.ts` → `*.controller.spec.ts`)**

Pattern : Jest + `@nestjs/testing`. Lire un fichier spec existant comme référence (ex: `backend/src/recipes/recipes.service.spec.ts`).

- `Test.createTestingModule()` pour monter le module
- Mocker les dépendances externes (Mongoose models, services tiers) avec `jest.fn()`
- Ne pas mocker les services internes — tester leur interaction réelle
- Couvrir : cas nominal, cas d'erreur (NotFoundException, UnauthorizedException), cas limites

**Frontend (`*.ts` / `*.tsx` → `*.test.ts` / `*.test.tsx`)**

Pattern : Vitest + `@testing-library/react`. Lire un fichier test existant comme référence (ex: `frontend/src/features/recipes/api.test.ts`).

- Pour les fonctions API (`api.ts`) : mocker `apiFetch` de `@/lib/api-client`
- Pour les composants React : utiliser `render` + `screen` de Testing Library, wrapper avec les providers nécessaires (QueryClient, Router)
- Tester le comportement visible, pas les détails d'implémentation

## Étape 3 — Placer le fichier

Le fichier de test va **à côté du fichier source** (même dossier).

## Style

- Pas de point-virgule, guillemets doubles, pas de trailing comma
- Décrire les cas de test en français dans les `it()`
