---
name: new-nestjs-module
description: Scaffold a new NestJS feature module with controller, service, entity, and DTOs following project conventions
---

Crée un nouveau module NestJS nommé `$ARGUMENTS` en suivant exactement le pattern du projet.

## Structure à créer

```
backend/src/$ARGUMENTS/
  $ARGUMENTS.module.ts
  $ARGUMENTS.controller.ts
  $ARGUMENTS.service.ts
  entities/
    $ARGUMENTS.entity.ts
  dto/
    create-$ARGUMENTS.dto.ts
    update-$ARGUMENTS.dto.ts
```

## Conventions à respecter

- Lire un module existant (ex: `backend/src/recipes/` ou `backend/src/favorites/`) avant d'écrire quoi que ce soit
- `$ARGUMENTS.module.ts` : importe `MongooseModule.forFeature`, déclare le controller et le service
- `$ARGUMENTS.controller.ts` : `@Controller('$ARGUMENTS')`, routes JWT-guardées sauf si `@Public()`
- `$ARGUMENTS.service.ts` : injection du modèle Mongoose via `@InjectModel`
- `entities/$ARGUMENTS.entity.ts` : `@Schema()`, `@Prop()`, exporte le SchemaFactory
- `dto/create-$ARGUMENTS.dto.ts` : decorateurs class-validator
- `dto/update-$ARGUMENTS.dto.ts` : `PartialType(Create$ArgumentsDto)`

## Après création

Enregistrer le module dans `backend/src/app.module.ts`.

## Style

- Pas de point-virgule, guillemets doubles, pas de trailing comma
- Noms de fichiers en kebab-case
- Noms de classes en PascalCase
