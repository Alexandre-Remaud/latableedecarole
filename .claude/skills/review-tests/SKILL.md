---
name: review-tests
description: "Agent autonome de tests. Scanne tout le code (backend et frontend), identifie tout ce qui n'est pas teste, ecrit les tests manquants, vise un maximum de couverture. Cree une branche dediee, commit et pousse une PR. Utilise ce skill quand l'utilisateur demande un audit des tests, veut ameliorer la couverture, cherche des cas de test manquants, ou veut tester le projet. Aussi quand il mentionne : couverture, coverage, test unitaire, test e2e, test d'integration, mock, fixture, Jest, Vitest, TDD."
---

# Agent Autonome de Tests

Tu es un expert en testing specialise dans Jest (backend NestJS) et Vitest (frontend React). Ton role est de scanner TOUT le code du projet, d'identifier tout ce qui n'est pas teste, d'ecrire les tests manquants pour maximiser la couverture, puis de livrer une PR avec tous les nouveaux tests.

## Workflow complet

### Phase 1 — Preparation Git

1. S'assurer que le working tree est propre (`git status`). S'il y a des changements non commites, STOP et prevenir l'utilisateur.
2. Depuis la branche courante, creer et basculer sur une nouvelle branche : `git checkout -b tests/coverage-YYYY-MM-DD` (date du jour).

### Phase 2 — Inventaire du code et des tests

1. **Lister tous les fichiers source** avec Glob :
   - Backend : `backend/src/**/*.ts` (exclure `*.spec.ts`, `*.test.ts`, `*.module.ts`)
   - Frontend : `frontend/src/**/*.{ts,tsx}` (exclure `*.test.ts`, `*.test.tsx`, `*.gen.ts`)
2. **Lister tous les fichiers de test existants** :
   - Backend : `backend/src/**/*.spec.ts`
   - Frontend : `frontend/src/**/*.test.{ts,tsx}`
3. **Croiser les deux listes** pour identifier :
   - Fichiers source SANS test correspondant
   - Fichiers de test existants avec une couverture partielle (fonctions/branches non testees)
4. **Lire chaque fichier source** pour comprendre les fonctions publiques, les branches conditionnelles et les cas limites a couvrir.
5. **Lire chaque fichier de test existant** pour voir ce qui est deja couvert.

### Phase 3 — Ecriture des tests

Pour CHAQUE fichier source qui n'est pas entierement teste :

1. **Creer ou completer le fichier de test** avec l'outil Write ou Edit.
2. **Couvrir systematiquement** :
   - Toutes les fonctions/methodes publiques
   - Le happy path (cas nominal)
   - Les cas d'erreur (exceptions, rejections, status d'erreur HTTP)
   - Les cas limites (null, undefined, tableau vide, string vide, valeurs negatives, valeurs extremes)
   - Les branches conditionnelles (if/else, switch, ternaires)
3. **Respecter les conventions du projet** :
   - Backend : Jest, fichiers `*.spec.ts` a cote du fichier source
   - Frontend : Vitest, fichiers `*.test.ts` ou `*.test.tsx` a cote du fichier source
4. **Ecrire des tests de qualite** :
   - Nommage clair : `describe('NomDuModule')` > `it('should do X when Y')`
   - Assertions precises : `toEqual(expected)` plutot que `toBeTruthy()`
   - Isolation : chaque test est independant, pas d'etat partage
   - Mocks minimaux : mocker uniquement les dependances externes (DB, API, etc.)

### Phase 4 — Verification

1. **Lancer les tests backend** : `cd backend && npx jest --coverage 2>&1`
2. **Lancer les tests frontend** : `cd frontend && npx vitest run --coverage 2>&1`
3. **Corriger les tests qui echouent** — un test qui fail n'est pas un test livre.
4. **Verifier que le build passe** : `npx tsc --noEmit` (backend et frontend).

### Phase 5 — Commit et PR

1. **Stager les fichiers** : `git add` (fichiers specifiques, PAS `git add .`).
2. **Commiter** avec un message clair :
   ```
   test: add missing tests for maximum coverage

   - Liste des fichiers de test ajoutes/completes

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```
3. **Pusher la branche** : `git push -u origin tests/coverage-YYYY-MM-DD`
4. **Creer la PR** avec `gh pr create` en incluant le rapport dans le body :

```
gh pr create --title "test: add missing tests for maximum coverage" --body "$(cat <<'EOF'
## Rapport de Couverture de Tests

### Resume
- **Tests ajoutes** : X nouveaux fichiers de test, Y tests au total
- **Tests completes** : Z fichiers de test existants enrichis
- **Couverture estimee** : avant → apres

### Tests crees

#### `chemin/vers/fichier.spec.ts` (nouveau)
- Couvre : `NomDuModule` — X tests
- Cas testes : liste des scenarios

#### `chemin/vers/fichier.test.tsx` (complete)
- Tests ajoutes : Y nouveaux tests
- Cas ajoutes : liste des scenarios

### Fichiers non testes (justification)
- `fichier.ts` — raison (ex: fichier de configuration, types uniquement, etc.)

---
🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

## Quoi tester par type de fichier

### Backend — Services (`*.service.ts`)
- Chaque methode publique avec ses cas de succes et d'erreur
- Interactions avec Mongoose (find, create, update, delete) mockees via `@nestjs/testing`
- Validation des exceptions NestJS (NotFoundException, BadRequestException, etc.)
- Cas limites : ID invalide, document non trouve, donnees dupliquees

### Backend — Controllers (`*.controller.ts`)
- Chaque endpoint avec les bons status HTTP
- Validation des DTOs (donnees invalides rejetees)
- Verification des guards/decorateurs (routes protegees vs publiques)
- Format de la reponse (structure JSON attendue)

### Backend — Guards, Pipes, Decorators
- Guards : acces autorise/refuse selon les conditions
- Decorators : extraction correcte des donnees de la requete

### Backend — DTOs et validation
- Chaque champ avec des valeurs valides et invalides
- Contraintes : min/max, format email, regex de mot de passe
- Champs optionnels vs requis

### Frontend — Composants React (`*.tsx`)
- Rendu initial avec differentes props
- Interactions utilisateur : click, saisie, soumission de formulaire
- Etats conditionnel : loading, error, empty, data
- Utiliser `@testing-library/react` et `userEvent`

### Frontend — Hooks custom (`use*.ts`)
- Tester avec `renderHook` de `@testing-library/react`
- Cas de succes et d'erreur
- Changements d'etat

### Frontend — Fonctions utilitaires (`*.ts`)
- Chaque fonction exportee avec ses cas nominaux et limites
- Types d'entree invalides ou extremes

### Frontend — Schemas Zod (`schema.ts`)
- Donnees valides acceptees
- Chaque contrainte testee avec des donnees invalides
- Messages d'erreur corrects

## Regles importantes

- **Teste TOUT ce qui est testable** — pas de priorisation, on vise la couverture maximale
- Seuls les fichiers purement declaratifs (types, enums, config, modules NestJS) peuvent etre ignores
- Chaque test doit PASSER — ne jamais livrer un test rouge
- Un test doit tester le COMPORTEMENT, pas l'implementation
- Les mocks doivent refleter le comportement reel des dependances
- Respecter les conventions de nommage et de placement du projet existant
- Si un fichier de test existe deja, le completer plutot que le reecrire
- Lancer les tests et le build AVANT de commit pour s'assurer que tout passe
