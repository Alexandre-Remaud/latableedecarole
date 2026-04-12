Lance les 4 scripts de vérification depuis la racine du monorepo dans cet ordre : prettier, lint, typecheck, tests.

```bash
cd /Users/alexandreremaud/Work/latableedecarole && pnpm prettier && pnpm lint && pnpm typecheck && pnpm test
```

Affiche le résultat de chaque étape. Si une étape échoue, signale-le clairement et arrête-toi.
