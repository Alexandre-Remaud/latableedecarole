---
name: new-frontend-route
description: Ajouter une nouvelle route TanStack Router et son dossier feature en suivant les conventions du projet
---

Ajoute une nouvelle route pour `$ARGUMENTS`.

## Avant d'écrire quoi que ce soit

Lire un exemple existant pour s'aligner sur les patterns actuels :
- `frontend/src/routes/index.tsx` (route simple)
- `frontend/src/routes/recipes/$id.tsx` (route avec loader et paramètre)
- `frontend/src/features/recipes/` (structure feature complète)

## Fichier de route

Créer `frontend/src/routes/$ARGUMENTS.tsx` :

```ts
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/$ARGUMENTS")({
  component: RouteComponent
})

function RouteComponent() {
  return <div>...</div>
}
```

Si la route a besoin de données, ajouter un `loader` qui appelle le service correspondant.

## Dossier feature

Créer `frontend/src/features/<nom>/` avec :
- `api.ts` : appels `apiFetch` vers le backend
- `hooks.ts` : hooks TanStack Query (`useQuery`, `useMutation`)
- `schema.ts` : schémas Zod
- `types.ts` : types TypeScript
- `components/` : composants propres à cette feature

## Règles importantes

- Ne **jamais** éditer `frontend/src/routeTree.gen.ts` — il est auto-généré par le plugin Vite au `pnpm dev`
- Le texte UI est en **français**
- Path aliases : `@/*` = `src/*`, `@recipes/*` = `src/features/recipes/*`
- Style : pas de point-virgule, guillemets doubles, pas de trailing comma
