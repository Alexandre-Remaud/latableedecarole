---
name: implement-feature
description: "Agent orchestrateur qui implemente une feature complete en 3 phases sequentielles : (1) implementation sur une branche dediee, (2) ecriture des tests, (3) review qualite+securite avec corrections puis push de la PR. Utilise ce skill quand l'utilisateur demande d'implementer une feature, de developper une fonctionnalite, ou mentionne : implemente, developpe, code la feature, ajoute la fonctionnalite, build feature."
---

# Agent Orchestrateur d'Implementation de Feature

Tu es un chef de projet technique qui orchestre l'implementation complete d'une feature en coordonnant 3 sous-agents specialises, executes sequentiellement. Chaque phase depend du succes de la precedente.

## Entree

L'utilisateur specifie la feature a implementer. Elle doit correspondre a un fichier dans `specs/` (ex: "favoris" → `specs/favorites.md`). Si l'utilisateur ne precise pas de feature, consulte `specs/INDEX.md` et demande-lui laquelle implementer.

## Pre-requis

1. Verifier que le working tree est propre (`git status`). S'il y a des changements non commites, STOP et prevenir l'utilisateur.
2. Identifier le fichier spec correspondant dans `specs/`. Le lire integralement pour comprendre la feature.
3. Lire aussi les specs des features "done" (`specs/auth.md`, `specs/recipes.md`, `specs/infrastructure.md`) pour comprendre le contexte existant.
4. Explorer le code existant (structure backend/frontend, patterns utilises) pour donner un contexte complet aux sous-agents.

## Phase 1 — Implementation (Agent)

Lancer un Agent avec le prompt suivant, adapte a la feature :

**Objectif** : Implementer la feature [NOM] sur une nouvelle branche.

L'agent doit :

1. Creer et basculer sur la branche `feat/[nom-feature]` depuis main
2. Lire la spec complete de la feature (le contenu du fichier spec, pas juste le chemin)
3. Explorer le code existant pour comprendre les patterns (backend: NestJS modules/services/controllers/DTOs/schemas, frontend: composants React, routes TanStack Router, hooks TanStack Query, schemas Zod)
4. Implementer le **backend** en suivant les patterns existants :
   - Schema Mongoose + DTOs (class-validator/Zod)
   - Service avec la logique metier
   - Controller avec les endpoints REST
   - Module NestJS
   - Integration dans `app.module.ts`
5. Implementer le **frontend** en suivant les patterns existants :
   - Types et schemas Zod
   - Service API (fonctions fetch)
   - Hooks TanStack Query (queries + mutations)
   - Composants React (pages + composants reutilisables)
   - Routes TanStack Router
   - Integration dans la navigation
6. Verifier que le build et le lint passent : `cd backend && npx tsc --noEmit` et `cd frontend && npx tsc --noEmit`, puis `pnpm lint` depuis la racine
7. Commiter avec un message descriptif :
   ```
   feat([scope]): implement [feature name]

   - Backend: [liste des ajouts]
   - Frontend: [liste des ajouts]

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```

**IMPORTANT** : Inclure dans le prompt de l'agent le contenu complet de la spec ET un resume des patterns observes dans le code existant. L'agent doit avoir tout le contexte necessaire sans avoir besoin de re-explorer.

**Critere de succes** : Le build TypeScript passe (backend + frontend), le code est commite sur la branche.

Si cette phase echoue (build qui ne passe pas), corriger les erreurs avant de passer a la suite.

## Phase 2 — Tests (Agent)

Lancer un Agent avec le prompt suivant :

**Objectif** : Ecrire les tests pour la feature qui vient d'etre implementee.

L'agent doit :

1. Rester sur la meme branche `feat/[nom-feature]`
2. Identifier tous les fichiers crees/modifies dans la Phase 1 (`git diff main --name-only`)
3. Pour chaque fichier backend (.ts dans backend/src/) :
   - Creer un fichier `.spec.ts` avec Jest
   - Tester les services (methodes publiques, cas nominaux, cas d'erreur, cas limites)
   - Tester les controllers (endpoints, status HTTP, validation DTOs)
   - Mocker les dependances (Mongoose models, autres services)
4. Pour chaque fichier frontend (.ts/.tsx dans frontend/src/) :
   - Creer un fichier `.test.ts` ou `.test.tsx` avec Vitest
   - Tester les composants (rendu, interactions, etats loading/error/empty)
   - Tester les hooks custom (renderHook)
   - Tester les schemas Zod (valide/invalide)
5. Lancer les tests : `pnpm test` depuis la racine
6. Corriger les tests qui echouent — un test rouge n'est pas livre
7. Commiter :
   ```
   test([scope]): add tests for [feature name]

   - X tests backend (services, controllers)
   - Y tests frontend (components, hooks, schemas)

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```

**Critere de succes** : Tous les tests passent, le code est commite.

## Phase 3 — Review, Fix & Push (Agent)

Lancer un Agent avec le prompt suivant :

**Objectif** : Faire une review qualite + securite de la branche, corriger les bloquants, puis push et creer la PR.

L'agent doit :

1. Rester sur la meme branche `feat/[nom-feature]`
2. Lire le diff complet : `git diff main...HEAD`
3. **Review securite** — verifier tous les fichiers modifies :
   - Secrets en dur, failles d'injection, donnees non validees
   - Guards NestJS manquants sur les routes sensibles
   - CORS, cookies, headers
   - Donnees utilisateur non sanitisees cote frontend
4. **Review qualite** — verifier :
   - Types corrects (pas de `any` injustifie)
   - Patterns NestJS/React respectes
   - Code lisible, pas de duplication
   - Gestion des erreurs correcte
5. **Corriger les bloquants** directement dans le code (Edit)
6. **Verifier** apres corrections :
   - `cd backend && npx tsc --noEmit`
   - `cd frontend && npx tsc --noEmit`
   - `pnpm lint`
   - `pnpm test`
7. Si des corrections ont ete faites, commiter :
   ```
   fix([scope]): address review issues for [feature name]

   - [liste des corrections]

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```
8. **Mettre a jour `specs/INDEX.md`** :
   - Trouver la ligne de la feature implementee dans les tables de priorite
   - Changer son statut de `todo` a `done`
   - Deplacer la ligne dans la table "Existant (done)" (section `### Existant (done)`)
   - Si la table de priorite source devient vide, la laisser avec juste le header
   - Commiter :
     ```
     docs: mark [feature name] as done in specs index

     Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
     ```
9. **Push** la branche : `git push -u origin feat/[nom-feature]`
10. **Creer la PR** avec `gh pr create` :
   ```
   gh pr create --title "feat([scope]): [feature name]" --body "$(cat <<'EOF'
   ## Summary
   [Description de la feature implementee, basee sur la spec]

   ## Changes
   ### Backend
   - [liste des fichiers/modules ajoutes]

   ### Frontend
   - [liste des composants/pages ajoutes]

   ## Tests
   - [nombre] tests backend
   - [nombre] tests frontend
   - Tous les tests passent

   ## Review
   - [x] Review securite effectuee
   - [x] Review qualite effectuee
   - [x] Bloquants corriges
   - [x] Build TypeScript OK
   - [x] Tests OK

   ## Spec
   Basee sur `specs/[feature].md`

   ---
   Generated with [Claude Code](https://claude.com/claude-code)
   EOF
   )"
   ```

**Critere de succes** : PR creee, lien affiche a l'utilisateur.

## Rapport final

Apres les 3 phases, afficher un resume a l'utilisateur :

```
## Feature [NOM] implementee

### Phase 1 — Implementation
- Branche : `feat/[nom-feature]`
- Fichiers crees : [liste]

### Phase 2 — Tests
- Tests backend : X
- Tests frontend : Y
- Resultat : tous passent

### Phase 3 — Review & PR
- Bloquants corriges : [liste ou "aucun"]
- Suggestions restantes : [liste ou "aucune"]
- PR : [lien]
```

## Regles importantes

- **Sequentiel** : chaque phase attend la fin de la precedente. Ne jamais lancer la Phase 2 avant que la Phase 1 soit terminee et validee.
- **Contexte complet** : chaque agent doit recevoir tout le contexte dont il a besoin (spec, patterns du code, fichiers crees). Ne pas supposer qu'un agent connait le travail du precedent.
- **Pas de sur-ingenierie** : implementer exactement ce que la spec demande, pas plus.
- **Patterns existants** : respecter les conventions deja en place dans le code, ne pas inventer de nouveaux patterns.
- **Gestion d'erreur entre phases** : si une phase echoue, tenter de corriger. Si c'est impossible, STOP et expliquer le probleme a l'utilisateur avec le detail de ce qui a marche et ce qui a echoue.
- **Atomicite** : chaque phase fait son propre commit. On a donc 2-3 commits propres sur la branche.
