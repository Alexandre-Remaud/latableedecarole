# Seed de données de développement — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un script `pnpm seed` qui remet à zéro la base MongoDB de dev et insère 4 users, 21 recettes, ~50 reviews, 21 favoris et 8 listes de courses avec des données réalistes en français.

**Architecture:** Un fichier standalone `backend/src/seed.ts` qui se connecte à MongoDB via Mongoose (sans NestJS), vide les collections dans le bon ordre puis insère toutes les données. Un `tsconfig.seed.json` override le module en CommonJS pour que `ts-node` puisse exécuter le script.

**Tech Stack:** ts-node, Mongoose (direct, sans NestJS), bcrypt, dotenv

---

## Files

| Opération | Fichier |
|-----------|---------|
| Créer | `backend/tsconfig.seed.json` |
| Créer | `backend/src/seed.ts` |
| Modifier | `backend/package.json` — ajouter script `seed` |

---

## Task 1 : Setup — tsconfig, dotenv, script pnpm

**Files:**
- Créer : `backend/tsconfig.seed.json`
- Modifier : `backend/package.json`

- [ ] **Step 1 : Installer dotenv comme devDependency**

Depuis `backend/` :
```bash
pnpm add -D dotenv
```

Expected output : `devDependencies` dans `backend/package.json` contient `"dotenv": "..."`.

- [ ] **Step 2 : Créer `backend/tsconfig.seed.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "CommonJS",
    "moduleResolution": "node"
  }
}
```

Ce fichier override le `module: nodenext` du tsconfig principal, incompatible avec ts-node sans flag `--esm`.

- [ ] **Step 3 : Ajouter le script `seed` dans `backend/package.json`**

Dans la section `"scripts"`, ajouter après `"typecheck"` :
```json
"seed": "ts-node --project tsconfig.seed.json src/seed.ts"
```

- [ ] **Step 4 : Vérifier que ts-node est disponible**

```bash
cd backend && ./node_modules/.bin/ts-node --version
```

Expected : une version s'affiche (ex. `v10.9.2`). Sinon : `pnpm add -D ts-node`.

- [ ] **Step 5 : Commit**

```bash
git add backend/tsconfig.seed.json backend/package.json
git commit -m "chore(backend): ajouter tsconfig.seed.json et script pnpm seed"
```

---

## Task 2 : Créer le script `backend/src/seed.ts` complet

**Files:**
- Créer : `backend/src/seed.ts`

- [ ] **Step 1 : Créer le fichier `backend/src/seed.ts` avec le contenu complet ci-dessous**

```typescript
import "dotenv/config"
import mongoose, { Types } from "mongoose"
import * as bcrypt from "bcrypt"
import { UserSchema } from "./users/entities/user.entity"
import { RecipeSchema } from "./recipes/entities/recipe.entity"
import { ReviewSchema } from "./reviews/entities/review.entity"
import { FavoriteSchema } from "./favorites/entities/favorite.entity"
import { ShoppingListSchema } from "./shopping-lists/entities/shopping-list.entity"
import { Role } from "./auth/role.enum"

// ─── Models ──────────────────────────────────────────────────────────────────

const UserModel = mongoose.model("User", UserSchema)
const RecipeModel = mongoose.model("Recipe", RecipeSchema)
const ReviewModel = mongoose.model("Review", ReviewSchema)
const FavoriteModel = mongoose.model("Favorite", FavoriteSchema)
const ShoppingListModel = mongoose.model("ShoppingList", ShoppingListSchema)

// ─── User fixtures ────────────────────────────────────────────────────────────

async function buildUsers() {
  const hash = await bcrypt.hash("Password123!", 10)
  return [
    {
      email: "carole@admin.fr",
      password: hash,
      name: "Carole Dupont",
      role: Role.ADMIN,
      bio: "Fondatrice de La Tablée de Carole. Passionnée de cuisine française depuis toujours.",
      avatarUrl: "https://i.pravatar.cc/150?img=1",
    },
    {
      email: "sophie@example.fr",
      password: hash,
      name: "Sophie Martin",
      role: Role.USER,
      bio: "Amatrice de cuisine provençale et méditerranéenne.",
      avatarUrl: "https://i.pravatar.cc/150?img=2",
    },
    {
      email: "lucas@example.fr",
      password: hash,
      name: "Lucas Bernard",
      role: Role.USER,
      bio: "Cuisinier du dimanche, spécialiste des plats mijotés.",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
    },
    {
      email: "emma@example.fr",
      password: hash,
      name: "Emma Petit",
      role: Role.USER,
      bio: "Végétarienne convaincue, je prouve que manger sans viande c'est délicieux.",
      avatarUrl: "https://i.pravatar.cc/150?img=4",
    },
  ]
}

// ─── Recipe fixtures ──────────────────────────────────────────────────────────

const IMG = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
const THUMB = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200"
const MEDIUM = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"

function buildRecipes(userIds: Types.ObjectId[]) {
  const [caroleId, sophieId, lucasId, emmaId] = userIds

  return [
    // ── Carole (index 0-4) ────────────────────────────────────────────────
    {
      title: "Quiche Lorraine",
      description:
        "La quiche lorraine classique avec une pâte brisée maison, des lardons fumés et un appareil onctueux à base de crème fraîche et d'œufs.",
      userId: caroleId,
      category: "main_course",
      difficulty: "medium",
      servings: 6,
      prepTime: 20,
      cookTime: 40,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Lardons fumés", quantity: 200, unit: "g" },
        { name: "Crème fraîche épaisse", quantity: 200, unit: "ml" },
        { name: "Œufs", quantity: 3, unit: "pièce(s)" },
        { name: "Gruyère râpé", quantity: 100, unit: "g" },
        { name: "Pâte brisée", quantity: 1, unit: "pièce(s)" },
        { name: "Noix de muscade", quantity: 1, unit: "pincée" },
      ],
      steps: [
        { order: 1, instruction: "Préchauffer le four.", temperature: 180, temperatureUnit: "C" },
        {
          order: 2,
          instruction: "Battre les œufs avec la crème fraîche et assaisonner.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction:
            "Disposer les lardons sur la pâte, verser l'appareil, parsemer de gruyère et enfourner.",
          duration: 40,
          durationUnit: "min",
          note: "Vérifier la cuisson avec la pointe d'un couteau — elle doit ressortir propre.",
        },
      ],
    },
    {
      title: "Tarte Tatin aux Pommes",
      description:
        "La célèbre tarte renversée aux pommes caramélisées. Croustillante dessous, fondante dessus.",
      userId: caroleId,
      category: "dessert",
      difficulty: "medium",
      servings: 6,
      prepTime: 30,
      cookTime: 35,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Pommes Golden", quantity: 1.2, unit: "kg" },
        { name: "Beurre doux", quantity: 80, unit: "g" },
        { name: "Sucre en poudre", quantity: 150, unit: "g" },
        { name: "Pâte feuilletée", quantity: 1, unit: "pièce(s)" },
        { name: "Cannelle moulue", quantity: 1, unit: "cc" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Éplucher et couper les pommes en quartiers.",
          duration: 15,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Caraméliser le sucre avec le beurre dans une poêle allant au four.",
          duration: 10,
          durationUnit: "min",
          note: "Remuer en permanence pour éviter de brûler le caramel.",
        },
        {
          order: 3,
          instruction: "Disposer les pommes sur le caramel, couvrir de pâte et cuire au four.",
          temperature: 190,
          temperatureUnit: "C",
          duration: 25,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Crème Brûlée à la Vanille",
      description:
        "Un grand classique de la pâtisserie française : crème onctueuse à la vanille, caramel craquant.",
      userId: caroleId,
      category: "dessert",
      difficulty: "hard",
      servings: 4,
      prepTime: 20,
      cookTime: 45,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Crème liquide entière", quantity: 500, unit: "ml" },
        { name: "Jaunes d'œufs", quantity: 5, unit: "pièce(s)" },
        { name: "Sucre en poudre", quantity: 80, unit: "g" },
        { name: "Sucre roux", quantity: 4, unit: "cs" },
        { name: "Gousse de vanille", quantity: 1, unit: "pièce(s)" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Fendre la gousse de vanille et infuser dans la crème chauffée.",
          duration: 15,
          durationUnit: "min",
          note: "Ne pas faire bouillir — la crème doit frémir légèrement.",
        },
        {
          order: 2,
          instruction: "Blanchir les jaunes avec le sucre puis incorporer la crème filtrée.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Cuire au bain-marie au four.",
          temperature: 150,
          temperatureUnit: "C",
          duration: 45,
          durationUnit: "min",
        },
        {
          order: 4,
          instruction:
            "Réfrigérer 4 h puis caraméliser le sucre roux au chalumeau avant de servir.",
        },
      ],
    },
    {
      title: "Soupe à l'Oignon Gratinée",
      description:
        "La soupe à l'oignon parisienne, généreuse et réconfortante, gratinée au gruyère fondant.",
      userId: caroleId,
      category: "starter",
      difficulty: "easy",
      servings: 4,
      prepTime: 15,
      cookTime: 45,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Oignons jaunes", quantity: 800, unit: "g" },
        { name: "Beurre doux", quantity: 40, unit: "g" },
        { name: "Farine T45", quantity: 2, unit: "cs" },
        { name: "Vin blanc sec", quantity: 15, unit: "cl" },
        { name: "Bouillon de bœuf", quantity: 1, unit: "l" },
        { name: "Pain de campagne", quantity: 4, unit: "pièce(s)" },
        { name: "Gruyère râpé", quantity: 80, unit: "g" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Émincer finement les oignons et les faire fondre lentement dans le beurre.",
          duration: 25,
          durationUnit: "min",
          note: "Les oignons doivent être bien dorés, presque caramélisés — c'est le secret de la saveur.",
        },
        {
          order: 2,
          instruction:
            "Ajouter la farine, mélanger 1 min, déglacer au vin blanc puis mouiller avec le bouillon.",
          duration: 20,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction:
            "Verser dans des bols, poser les croûtons, parsemer de gruyère et passer sous le gril.",
          temperature: 220,
          temperatureUnit: "C",
          duration: 5,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Vinaigrette à la Moutarde de Dijon",
      description:
        "La vinaigrette incontournable pour toutes les salades. Simple, équilibrée, avec la pointe de piquant de la moutarde.",
      userId: caroleId,
      category: "sauce",
      difficulty: "easy",
      servings: 6,
      prepTime: 5,
      cookTime: 0,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Huile d'olive extra vierge", quantity: 6, unit: "cs" },
        { name: "Vinaigre de vin rouge", quantity: 2, unit: "cs" },
        { name: "Moutarde de Dijon", quantity: 1, unit: "cc" },
        { name: "Sel fin", quantity: 1, unit: "pincée" },
        { name: "Poivre noir moulu", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Mettre la moutarde et le vinaigre dans un bol, mélanger.",
          duration: 1,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Ajouter l'huile en filet en fouettant pour émulsionner.",
          duration: 2,
          durationUnit: "min",
          note: "Fouetter vigoureusement et sans s'arrêter pour obtenir une émulsion stable.",
        },
        {
          order: 3,
          instruction: "Assaisonner et conserver au réfrigérateur jusqu'à une semaine.",
        },
      ],
    },
    // ── Sophie (index 5-9) ────────────────────────────────────────────────
    {
      title: "Ratatouille Provençale",
      description:
        "Le grand classique de la cuisine du Soleil. Légumes d'été mijotés aux herbes de Provence, encore meilleurs le lendemain.",
      userId: sophieId,
      category: "main_course",
      difficulty: "medium",
      servings: 6,
      prepTime: 30,
      cookTime: 60,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Aubergines", quantity: 500, unit: "g" },
        { name: "Courgettes", quantity: 400, unit: "g" },
        { name: "Poivrons rouges", quantity: 2, unit: "pièce(s)" },
        { name: "Tomates mûres", quantity: 600, unit: "g" },
        { name: "Oignons", quantity: 200, unit: "g" },
        { name: "Huile d'olive", quantity: 8, unit: "cs" },
        { name: "Herbes de Provence", quantity: 1, unit: "cs" },
        { name: "Sel fin", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction:
            "Couper tous les légumes en dés de 2 cm et les faire suer séparément dans l'huile.",
          duration: 20,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction:
            "Assembler dans une cocotte avec les herbes et laisser mijoter à feu doux.",
          duration: 40,
          durationUnit: "min",
          note: "Mélanger délicatement pour ne pas réduire les légumes en purée.",
        },
        {
          order: 3,
          instruction:
            "Servir chaud ou froid — le lendemain les saveurs sont encore plus développées.",
        },
      ],
    },
    {
      title: "Tapenade d'Olives Noires",
      description:
        "La tartinade provençale par excellence. Idéale à l'apéritif sur des toasts croustillants.",
      userId: sophieId,
      category: "appetizer",
      difficulty: "easy",
      servings: 8,
      prepTime: 10,
      cookTime: 0,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Olives noires dénoyautées", quantity: 200, unit: "g" },
        { name: "Câpres", quantity: 30, unit: "g" },
        { name: "Filets d'anchois à l'huile", quantity: 4, unit: "pièce(s)" },
        { name: "Gousses d'ail", quantity: 2, unit: "pièce(s)" },
        { name: "Huile d'olive", quantity: 5, unit: "cs" },
        { name: "Jus de citron", quantity: 1, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Mixer olives, câpres, anchois et ail par à-coups.",
          duration: 2,
          durationUnit: "min",
          note: "Mixer par impulsions courtes pour garder une texture légèrement grossière, pas une purée lisse.",
        },
        {
          order: 2,
          instruction: "Incorporer l'huile d'olive et le jus de citron en mixant brièvement.",
          duration: 1,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Réfrigérer 30 min avant de servir sur des toasts.",
        },
      ],
    },
    {
      title: "Bouillabaisse Marseillaise",
      description:
        "La soupe de poissons emblématique de Marseille. Technique mais spectaculaire, servie avec rouille et croûtons.",
      userId: sophieId,
      category: "main_course",
      difficulty: "hard",
      servings: 6,
      prepTime: 45,
      cookTime: 60,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Poissons variés (saint-pierre, grondin)", quantity: 1.2, unit: "kg" },
        { name: "Crevettes entières", quantity: 300, unit: "g" },
        { name: "Moules", quantity: 500, unit: "g" },
        { name: "Tomates", quantity: 400, unit: "g" },
        { name: "Safran", quantity: 1, unit: "pincée" },
        { name: "Fumet de poisson", quantity: 1.5, unit: "l" },
        { name: "Fenouil", quantity: 1, unit: "pièce(s)" },
        { name: "Pastis", quantity: 5, unit: "cl" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Préparer le fumet avec les parures de poisson, fenouil, tomates et pastis.",
          duration: 30,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Passer au chinois, remettre sur feu vif et ajouter le safran.",
          duration: 5,
          durationUnit: "min",
          note: "Le safran doit infuser au minimum 5 min pour révéler sa couleur et ses arômes.",
        },
        {
          order: 3,
          instruction: "Porter à forte ébullition puis plonger les poissons selon leur temps de cuisson.",
          temperature: 100,
          temperatureUnit: "C",
          duration: 15,
          durationUnit: "min",
        },
        {
          order: 4,
          instruction: "Ajouter moules et crevettes, cuire 5 min à couvert.",
          duration: 5,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Gratin Dauphinois",
      description:
        "Le plus réconfortant des gratins : pommes de terre fondantes dans une crème aillée, gratiné à la perfection.",
      userId: sophieId,
      category: "side_dish",
      difficulty: "easy",
      servings: 6,
      prepTime: 20,
      cookTime: 75,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Pommes de terre à chair ferme", quantity: 1, unit: "kg" },
        { name: "Crème fraîche épaisse", quantity: 300, unit: "ml" },
        { name: "Lait entier", quantity: 200, unit: "ml" },
        { name: "Gruyère râpé", quantity: 80, unit: "g" },
        { name: "Gousses d'ail", quantity: 2, unit: "pièce(s)" },
        { name: "Beurre", quantity: 20, unit: "g" },
        { name: "Noix de muscade", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Éplucher et trancher très finement les pommes de terre à la mandoline.",
          duration: 15,
          durationUnit: "min",
          note: "Épaisseur de 3 mm idéale. Ne pas rincer pour garder l'amidon qui lie le gratin.",
        },
        {
          order: 2,
          instruction:
            "Frotter le plat avec l'ail, beurrer, disposer les tranches en couches, arroser du mélange lait-crème-muscade.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Cuire à couvert au four.",
          temperature: 160,
          temperatureUnit: "C",
          duration: 60,
          durationUnit: "min",
        },
        {
          order: 4,
          instruction: "Retirer le couvercle, parsemer de gruyère et dorer.",
          temperature: 200,
          temperatureUnit: "C",
          duration: 15,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Limonade Maison à la Menthe",
      description:
        "Une limonade fraîche et légèrement sucrée, avec un sirop de citron maison et une touche de menthe.",
      userId: sophieId,
      category: "beverage",
      difficulty: "easy",
      servings: 8,
      prepTime: 15,
      cookTime: 5,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Citrons jaunes", quantity: 6, unit: "pièce(s)" },
        { name: "Sucre en poudre", quantity: 200, unit: "g" },
        { name: "Eau plate", quantity: 1, unit: "l" },
        { name: "Eau gazeuse", quantity: 500, unit: "ml" },
        { name: "Feuilles de menthe fraîche", quantity: 20, unit: "pièce(s)" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Préparer un sirop en faisant fondre le sucre dans 20 cl d'eau.",
          duration: 5,
          durationUnit: "min",
          temperature: 80,
          temperatureUnit: "C",
        },
        {
          order: 2,
          instruction: "Presser les citrons, mélanger le jus avec le sirop refroidi et l'eau plate.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Ajouter l'eau gazeuse et la menthe au moment de servir.",
          note: "Servir immédiatement bien frais — ne pas ajouter l'eau gazeuse à l'avance.",
        },
      ],
    },
    // ── Lucas (index 10-14) ───────────────────────────────────────────────
    {
      title: "Bœuf Bourguignon",
      description:
        "Le plat mijoté bourguignon par excellence. Viande fondante dans une sauce au vin rouge parfumée.",
      userId: lucasId,
      category: "main_course",
      difficulty: "hard",
      servings: 6,
      prepTime: 30,
      cookTime: 180,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Bœuf à braiser (paleron ou macreuse)", quantity: 1.2, unit: "kg" },
        { name: "Lardons allumettes fumés", quantity: 150, unit: "g" },
        { name: "Oignons grelots", quantity: 200, unit: "g" },
        { name: "Champignons de Paris", quantity: 300, unit: "g" },
        { name: "Vin rouge de Bourgogne", quantity: 750, unit: "ml" },
        { name: "Bouquet garni", quantity: 1, unit: "pièce(s)" },
        { name: "Beurre", quantity: 40, unit: "g" },
        { name: "Farine T45", quantity: 2, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Couper le bœuf en gros cubes et faire dorer en plusieurs fois dans le beurre très chaud.",
          duration: 15,
          durationUnit: "min",
          note: "Ne pas surcharger la cocotte — la viande doit saisir, pas étuver.",
        },
        {
          order: 2,
          instruction: "Singer (ajouter la farine), déglacer au vin rouge, ajouter le bouquet garni.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Laisser mijoter très lentement au four.",
          temperature: 150,
          temperatureUnit: "C",
          duration: 150,
          durationUnit: "min",
        },
        {
          order: 4,
          instruction: "Ajouter champignons et oignons grelots rissolés, poursuivre la cuisson.",
          duration: 30,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Pain Perdu à la Brioche",
      description:
        "Un pain perdu généreux et moelleux à base de brioche rassis, parfumé à la cannelle et à la vanille.",
      userId: lucasId,
      category: "snack",
      difficulty: "easy",
      servings: 4,
      prepTime: 10,
      cookTime: 10,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Tranches de brioche rassis", quantity: 4, unit: "pièce(s)" },
        { name: "Œufs", quantity: 2, unit: "pièce(s)" },
        { name: "Lait entier", quantity: 15, unit: "cl" },
        { name: "Sucre vanillé", quantity: 1, unit: "cs" },
        { name: "Beurre", quantity: 30, unit: "g" },
        { name: "Cannelle moulue", quantity: 1, unit: "cc" },
        { name: "Sucre glace", quantity: 2, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Battre les œufs avec le lait, le sucre vanillé et la cannelle dans un plat creux.",
          duration: 3,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Tremper les tranches de brioche dans l'appareil, 1 min de chaque côté.",
          duration: 2,
          durationUnit: "min",
          note: "Ne pas trop tremper : la brioche doit s'imbiber sans se désagréger.",
        },
        {
          order: 3,
          instruction: "Cuire à la poêle dans le beurre fondu jusqu'à dorure des deux côtés.",
          duration: 5,
          durationUnit: "min",
          note: "Feu moyen — trop fort et le beurre brûle avant que la brioche soit cuite à cœur.",
        },
      ],
    },
    {
      title: "Carbonnade Flamande",
      description:
        "Un ragout de bœuf à la bière brune et au pain d'épices, spécialité du Nord et de la Belgique.",
      userId: lucasId,
      category: "main_course",
      difficulty: "hard",
      servings: 4,
      prepTime: 20,
      cookTime: 150,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Bœuf à braiser", quantity: 800, unit: "g" },
        { name: "Bière brune (type Leffe ou Chimay)", quantity: 500, unit: "ml" },
        { name: "Oignons", quantity: 400, unit: "g" },
        { name: "Pain d'épices", quantity: 4, unit: "pièce(s)" },
        { name: "Moutarde forte", quantity: 2, unit: "cs" },
        { name: "Branches de thym", quantity: 3, unit: "pièce(s)" },
        { name: "Beurre", quantity: 30, unit: "g" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Faire caraméliser les oignons émincés dans le beurre à feu doux.",
          duration: 20,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Faire revenir les morceaux de viande, ajouter les oignons et déglacer à la bière.",
          duration: 10,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction:
            "Tartiner le pain d'épices de moutarde, déposer sur la viande et mijoter au four.",
          temperature: 160,
          temperatureUnit: "C",
          duration: 120,
          durationUnit: "min",
          note: "Le pain d'épices va fondre et lier la sauce — c'est le secret de la carbonnade.",
        },
      ],
    },
    {
      title: "Salade Niçoise",
      description:
        "La salade niçoise traditionnelle avec thon, œufs durs, anchois et olives. Repas complet et coloré.",
      userId: lucasId,
      category: "starter",
      difficulty: "easy",
      servings: 4,
      prepTime: 20,
      cookTime: 10,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Thon à l'huile (boîte)", quantity: 2, unit: "pièce(s)" },
        { name: "Tomates cerises", quantity: 200, unit: "g" },
        { name: "Œufs durs", quantity: 4, unit: "pièce(s)" },
        { name: "Haricots verts fins", quantity: 200, unit: "g" },
        { name: "Olives niçoises", quantity: 80, unit: "g" },
        { name: "Filets d'anchois", quantity: 8, unit: "pièce(s)" },
        { name: "Huile d'olive", quantity: 4, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Cuire les haricots verts à l'eau bouillante salée puis rafraîchir dans l'eau froide.",
          duration: 7,
          durationUnit: "min",
          note: "Ils doivent rester croquants. Le bain froid stoppe la cuisson et fixe la couleur verte.",
        },
        {
          order: 2,
          instruction: "Disposer tous les ingrédients harmonieusement dans le plat.",
          duration: 10,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Arroser d'huile d'olive, assaisonner et servir aussitôt.",
        },
      ],
    },
    {
      title: "Sauce Béchamel",
      description:
        "La sauce mère indispensable de la cuisine française. Base des lasagnes, gratins et croque-monsieur.",
      userId: lucasId,
      category: "sauce",
      difficulty: "easy",
      servings: 4,
      prepTime: 5,
      cookTime: 15,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Beurre doux", quantity: 50, unit: "g" },
        { name: "Farine T45", quantity: 50, unit: "g" },
        { name: "Lait entier", quantity: 500, unit: "ml" },
        { name: "Sel fin", quantity: 1, unit: "pincée" },
        { name: "Poivre blanc", quantity: 1, unit: "pincée" },
        { name: "Noix de muscade râpée", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Faire fondre le beurre, ajouter la farine d'un coup et fouetter pour former un roux.",
          duration: 2,
          durationUnit: "min",
          note: "Le roux doit cuire 1 min sans colorer pour éliminer le goût de farine crue.",
        },
        {
          order: 2,
          instruction: "Verser le lait chaud progressivement en fouettant vigoureusement pour éviter les grumeaux.",
          duration: 3,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Cuire à feu doux en remuant continuellement jusqu'à la consistance désirée.",
          duration: 10,
          durationUnit: "min",
          temperature: 80,
          temperatureUnit: "C",
        },
      ],
    },
    // ── Emma (index 15-20) ────────────────────────────────────────────────
    {
      title: "Buddha Bowl Végétarien",
      description:
        "Un bol nourrissant et coloré avec riz complet, pois chiches rôtis et sauce tahini citron.",
      userId: emmaId,
      category: "main_course",
      difficulty: "easy",
      servings: 2,
      prepTime: 20,
      cookTime: 25,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Riz complet", quantity: 160, unit: "g" },
        { name: "Pois chiches cuits", quantity: 150, unit: "g" },
        { name: "Avocat mûr", quantity: 1, unit: "pièce(s)" },
        { name: "Épinards frais", quantity: 80, unit: "g" },
        { name: "Carottes râpées", quantity: 100, unit: "g" },
        { name: "Tahini (purée de sésame)", quantity: 2, unit: "cs" },
        { name: "Jus de citron", quantity: 2, unit: "cs" },
        { name: "Graines de sésame", quantity: 1, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Cuire le riz complet dans 2 fois son volume d'eau salée.",
          duration: 25,
          durationUnit: "min",
          note: "Le riz complet prend plus de temps que le riz blanc — prévoir 30 min si nécessaire.",
        },
        {
          order: 2,
          instruction: "Mélanger les pois chiches avec huile, paprika et cumin, rôtir au four.",
          temperature: 200,
          temperatureUnit: "C",
          duration: 20,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction:
            "Assembler le bol en disposant chaque élément séparément. Napper de sauce tahini-citron et parsemer de sésame.",
        },
      ],
    },
    {
      title: "Smoothie Vert Détox",
      description:
        "Un smoothie revitalisant aux épinards, banane et gingembre frais. Parfait pour commencer la journée.",
      userId: emmaId,
      category: "beverage",
      difficulty: "easy",
      servings: 2,
      prepTime: 5,
      cookTime: 0,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Épinards frais", quantity: 60, unit: "g" },
        { name: "Banane congelée", quantity: 1, unit: "pièce(s)" },
        { name: "Lait d'amande non sucré", quantity: 250, unit: "ml" },
        { name: "Pomme verte", quantity: 1, unit: "pièce(s)" },
        { name: "Gingembre frais râpé", quantity: 5, unit: "g" },
        { name: "Jus de citron", quantity: 1, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Éplucher la pomme et couper en morceaux.",
          duration: 3,
          durationUnit: "min",
        },
        {
          order: 2,
          instruction: "Placer tous les ingrédients dans le blender et mixer jusqu'à texture lisse.",
          duration: 2,
          durationUnit: "min",
          note: "Commencer à vitesse lente puis accélérer pour ne pas faire déborder.",
        },
        {
          order: 3,
          instruction: "Servir immédiatement — les vitamines s'oxydent rapidement.",
        },
      ],
    },
    {
      title: "Houmous Maison",
      description:
        "Un houmous onctueux et parfumé, bien meilleur que le commerce. Servi avec huile d'olive et paprika.",
      userId: emmaId,
      category: "appetizer",
      difficulty: "easy",
      servings: 6,
      prepTime: 15,
      cookTime: 0,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Pois chiches cuits (boîte)", quantity: 400, unit: "g" },
        { name: "Tahini", quantity: 4, unit: "cs" },
        { name: "Jus de citron frais", quantity: 3, unit: "cs" },
        { name: "Gousses d'ail", quantity: 2, unit: "pièce(s)" },
        { name: "Huile d'olive", quantity: 4, unit: "cs" },
        { name: "Cumin moulu", quantity: 1, unit: "cc" },
        { name: "Sel fin", quantity: 1, unit: "pincée" },
        { name: "Paprika fumé", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Égoutter les pois chiches en gardant 3 cs de leur eau de cuisson (aquafaba).",
          duration: 2,
          durationUnit: "min",
          note: "L'aquafaba est le secret d'un houmous ultra lisse.",
        },
        {
          order: 2,
          instruction: "Mixer pois chiches, tahini, citron et ail avec l'aquafaba.",
          duration: 3,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Incorporer l'huile et le cumin, mixer encore jusqu'à texture soyeuse.",
          duration: 2,
          durationUnit: "min",
        },
      ],
    },
    {
      title: "Taboulé Oriental",
      description:
        "Un taboulé frais et généreux en herbes, parfumé au citron et à l'huile d'olive. Parfait pour les repas estivaux.",
      userId: emmaId,
      category: "side_dish",
      difficulty: "easy",
      servings: 6,
      prepTime: 20,
      cookTime: 10,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Semoule fine", quantity: 200, unit: "g" },
        { name: "Tomates mûres", quantity: 300, unit: "g" },
        { name: "Botte de persil plat", quantity: 1, unit: "pièce(s)" },
        { name: "Botte de menthe fraîche", quantity: 1, unit: "pièce(s)" },
        { name: "Concombre", quantity: 200, unit: "g" },
        { name: "Jus de citron frais", quantity: 6, unit: "cs" },
        { name: "Huile d'olive", quantity: 4, unit: "cs" },
        { name: "Sel fin", quantity: 1, unit: "pincée" },
      ],
      steps: [
        {
          order: 1,
          instruction:
            "Verser de l'eau bouillante sur la semoule (1,5 volume eau par volume de semoule), couvrir 10 min.",
          duration: 10,
          durationUnit: "min",
          note: "Égrainer la semoule à la fourchette après gonflement pour éviter les grumeaux.",
        },
        {
          order: 2,
          instruction: "Hacher très finement le persil, la menthe, les tomates et le concombre.",
          duration: 10,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction:
            "Mélanger semoule et légumes, assaisonner avec citron, huile et sel. Réfrigérer 1 h avant de servir.",
        },
      ],
    },
    {
      title: "Cheesecake Vegan aux Myrtilles",
      description:
        "Un cheesecake crémeux 100% végétal à base de noix de cajou. Surprenant et délicieux.",
      userId: emmaId,
      category: "dessert",
      difficulty: "medium",
      servings: 8,
      prepTime: 30,
      cookTime: 0,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Noix de cajou (trempées 8h)", quantity: 300, unit: "g" },
        { name: "Lait de coco entier", quantity: 200, unit: "ml" },
        { name: "Jus de citron frais", quantity: 6, unit: "cs" },
        { name: "Sirop d'agave", quantity: 80, unit: "ml" },
        { name: "Biscuits type spéculoos", quantity: 200, unit: "g" },
        { name: "Huile de coco fondue", quantity: 60, unit: "ml" },
        { name: "Myrtilles fraîches", quantity: 200, unit: "g" },
      ],
      steps: [
        {
          order: 1,
          instruction:
            "Mixer les biscuits avec l'huile de coco fondue, tasser dans le moule et réfrigérer 30 min.",
          duration: 5,
          durationUnit: "min",
          note: "La base doit tenir quand elle est pressée entre les doigts — ajouter un peu d'huile si trop sèche.",
        },
        {
          order: 2,
          instruction:
            "Rincer les cajou trempés, mixer avec lait de coco, citron et sirop d'agave jusqu'à texture parfaitement lisse.",
          duration: 5,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Verser sur la base biscuitée et réfrigérer 12 h minimum.",
          note: "Décorer avec les myrtilles fraîches au dernier moment pour qu'elles gardent leur éclat.",
        },
      ],
    },
    {
      title: "Velouté de Lentilles Corail au Lait de Coco",
      description:
        "Un velouté doux et épicé, riche en protéines végétales, parfumé au curcuma et au gingembre frais.",
      userId: emmaId,
      category: "starter",
      difficulty: "easy",
      servings: 4,
      prepTime: 10,
      cookTime: 30,
      imageUrl: IMG,
      imageThumbnailUrl: THUMB,
      imageMediumUrl: MEDIUM,
      averageRating: 0,
      ratingsCount: 0,
      ingredients: [
        { name: "Lentilles corail", quantity: 200, unit: "g" },
        { name: "Lait de coco", quantity: 200, unit: "ml" },
        { name: "Bouillon de légumes", quantity: 800, unit: "ml" },
        { name: "Oignon", quantity: 1, unit: "pièce(s)" },
        { name: "Curcuma moulu", quantity: 1, unit: "cc" },
        { name: "Curry en poudre", quantity: 1, unit: "cs" },
        { name: "Gingembre frais râpé", quantity: 10, unit: "g" },
        { name: "Huile d'olive", quantity: 2, unit: "cs" },
      ],
      steps: [
        {
          order: 1,
          instruction: "Faire revenir l'oignon émincé avec les épices dans l'huile d'olive.",
          duration: 5,
          durationUnit: "min",
          note: "Les épices doivent « bloomer » dans l'huile pour révéler tous leurs arômes.",
        },
        {
          order: 2,
          instruction: "Ajouter les lentilles rincées et le bouillon, cuire à feu moyen.",
          duration: 20,
          durationUnit: "min",
        },
        {
          order: 3,
          instruction: "Verser le lait de coco et mixer au mixeur plongeant jusqu'à texture veloutée.",
          duration: 5,
          durationUnit: "min",
          temperature: 80,
          temperatureUnit: "C",
        },
      ],
    },
  ]
}

// ─── Review fixtures ──────────────────────────────────────────────────────────

function buildReviews(userIds: Types.ObjectId[], recipeIds: Types.ObjectId[]) {
  const [caroleId, sophieId, lucasId, emmaId] = userIds
  return [
    // Recipe 0 : Quiche Lorraine (carole) → sophie, lucas
    { userId: sophieId, recipeId: recipeIds[0], rating: 4, comment: "Une quiche parfaite, j'ai adoré le croquant de la pâte !" },
    { userId: lucasId, recipeId: recipeIds[0], rating: 5, comment: "Meilleure recette de quiche lorraine que j'aie essayée." },
    // Recipe 1 : Tarte Tatin (carole) → emma, lucas
    { userId: emmaId, recipeId: recipeIds[1], rating: 5, comment: "Absolument délicieux, le caramel était parfait." },
    { userId: lucasId, recipeId: recipeIds[1], rating: 4, comment: "Très bien réussie, je referai sans hésiter." },
    // Recipe 2 : Crème Brûlée (carole) → sophie, emma
    { userId: sophieId, recipeId: recipeIds[2], rating: 5, comment: "Magnifique crème brûlée, digne d'un restaurant." },
    { userId: emmaId, recipeId: recipeIds[2], rating: 3, comment: "Un peu difficile à maîtriser mais le résultat en vaut la peine." },
    // Recipe 3 : Soupe à l'Oignon (carole) → lucas, emma
    { userId: lucasId, recipeId: recipeIds[3], rating: 4, comment: "Réconfortante et savoureuse, parfaite en hiver." },
    { userId: emmaId, recipeId: recipeIds[3], rating: 5, comment: "Parfaite pour les soirées froides, mes invités ont adoré." },
    // Recipe 4 : Vinaigrette (carole) → sophie, emma
    { userId: sophieId, recipeId: recipeIds[4], rating: 5, comment: "Simple et parfaite, je ne ferai plus jamais de vinaigrette autrement." },
    { userId: emmaId, recipeId: recipeIds[4], rating: 4, comment: "Je l'utilise maintenant pour toutes mes salades." },
    // Recipe 5 : Ratatouille (sophie) → carole, lucas, emma
    { userId: caroleId, recipeId: recipeIds[5], rating: 5, comment: "Authentique et savoureuse, les légumes étaient parfaitement cuits." },
    { userId: lucasId, recipeId: recipeIds[5], rating: 4, comment: "Les saveurs du Sud dans l'assiette, un régal." },
    { userId: emmaId, recipeId: recipeIds[5], rating: 5, comment: "Mes légumes préférés ! La meilleure ratatouille que j'aie goûtée." },
    // Recipe 6 : Tapenade (sophie) → carole, lucas
    { userId: caroleId, recipeId: recipeIds[6], rating: 4, comment: "Parfait pour l'apéro, texture idéale." },
    { userId: lucasId, recipeId: recipeIds[6], rating: 3, comment: "Un peu fort pour mes papilles mais mes amis ont adoré." },
    // Recipe 7 : Bouillabaisse (sophie) → carole, lucas, emma
    { userId: caroleId, recipeId: recipeIds[7], rating: 5, comment: "Comme à Marseille ! Impressionnant de fidélité." },
    { userId: lucasId, recipeId: recipeIds[7], rating: 4, comment: "Bluffant, je ne pensais pas réussir une bouillabaisse maison." },
    { userId: emmaId, recipeId: recipeIds[7], rating: 2, comment: "Pas pour les végétariens mais j'ai quand même goûté le bouillon." },
    // Recipe 8 : Gratin dauphinois (sophie) → carole, lucas, emma
    { userId: caroleId, recipeId: recipeIds[8], rating: 5, comment: "Fondant à souhait, exactement comme celui de ma grand-mère." },
    { userId: lucasId, recipeId: recipeIds[8], rating: 5, comment: "Le meilleur gratin que j'aie mangé de ma vie." },
    { userId: emmaId, recipeId: recipeIds[8], rating: 4, comment: "Très généreux et onctueux, j'en referai pour Noël." },
    // Recipe 9 : Limonade (sophie) → carole, lucas, emma
    { userId: caroleId, recipeId: recipeIds[9], rating: 4, comment: "Rafraîchissante et juste assez sucrée." },
    { userId: lucasId, recipeId: recipeIds[9], rating: 5, comment: "Meilleure que toutes les limonades du commerce !" },
    { userId: emmaId, recipeId: recipeIds[9], rating: 5, comment: "Parfaite pour l'été, je la fais chaque week-end." },
    // Recipe 10 : Bœuf Bourguignon (lucas) → carole, sophie
    { userId: caroleId, recipeId: recipeIds[10], rating: 5, comment: "Authentique et savoureux, la viande était fondante." },
    { userId: sophieId, recipeId: recipeIds[10], rating: 4, comment: "Long à préparer mais ça vaut vraiment le coup." },
    // Recipe 11 : Pain Perdu (lucas) → carole, sophie, emma
    { userId: caroleId, recipeId: recipeIds[11], rating: 5, comment: "Les enfants adorent, je le fais maintenant chaque dimanche." },
    { userId: sophieId, recipeId: recipeIds[11], rating: 5, comment: "Rapide et tellement délicieux !" },
    { userId: emmaId, recipeId: recipeIds[11], rating: 4, comment: "Mon brunch favori, je le fais avec du pain rassis." },
    // Recipe 12 : Carbonnade (lucas) → carole, sophie
    { userId: caroleId, recipeId: recipeIds[12], rating: 4, comment: "Le pain d'épices, c'est vraiment le secret de cette recette." },
    { userId: sophieId, recipeId: recipeIds[12], rating: 5, comment: "Un classique belge parfaitement exécuté." },
    // Recipe 13 : Salade niçoise (lucas) → carole, sophie, emma
    { userId: caroleId, recipeId: recipeIds[13], rating: 4, comment: "Fraîche et bien équilibrée." },
    { userId: sophieId, recipeId: recipeIds[13], rating: 3, comment: "Manquait un peu de sel à mon goût mais bien présentée." },
    { userId: emmaId, recipeId: recipeIds[13], rating: 5, comment: "J'adore cette version, très proche de l'originale." },
    // Recipe 14 : Béchamel (lucas) → carole, sophie, emma
    { userId: caroleId, recipeId: recipeIds[14], rating: 5, comment: "Inratable avec ces explications, texture parfaite." },
    { userId: sophieId, recipeId: recipeIds[14], rating: 4, comment: "Très bien expliqué, même un débutant peut réussir." },
    { userId: emmaId, recipeId: recipeIds[14], rating: 4, comment: "Texture parfaite, je l'utilise pour mes lasagnes végétariennes." },
    // Recipe 15 : Buddha Bowl (emma) → carole, sophie, lucas
    { userId: caroleId, recipeId: recipeIds[15], rating: 4, comment: "Coloré, sain et très bon. Une belle découverte." },
    { userId: sophieId, recipeId: recipeIds[15], rating: 4, comment: "Ma fille adore, on en fait toutes les semaines !" },
    { userId: lucasId, recipeId: recipeIds[15], rating: 3, comment: "Bon mais un peu léger pour moi, j'ai ajouté des œufs." },
    // Recipe 16 : Smoothie vert (emma) → carole, sophie
    { userId: caroleId, recipeId: recipeIds[16], rating: 5, comment: "Plein de vitamines et vraiment bon !" },
    { userId: sophieId, recipeId: recipeIds[16], rating: 5, comment: "Je le fais chaque matin maintenant." },
    // Recipe 17 : Houmous (emma) → carole, sophie, lucas
    { userId: caroleId, recipeId: recipeIds[17], rating: 5, comment: "Bien meilleur que le commerce, texture incroyable !" },
    { userId: sophieId, recipeId: recipeIds[17], rating: 4, comment: "Bien dosé en citron et en tahini." },
    { userId: lucasId, recipeId: recipeIds[17], rating: 4, comment: "Surprenant pour quelqu'un qui ne mangeait pas de houmous !" },
    // Recipe 18 : Taboulé (emma) → carole, sophie, lucas
    { userId: caroleId, recipeId: recipeIds[18], rating: 4, comment: "Parfait pour les repas d'été." },
    { userId: sophieId, recipeId: recipeIds[18], rating: 5, comment: "Mon taboulé préféré, généreux en herbes comme il se doit." },
    { userId: lucasId, recipeId: recipeIds[18], rating: 3, comment: "Pas fan du persil en grande quantité mais c'est personnel." },
    // Recipe 19 : Cheesecake vegan (emma) → carole, sophie, lucas
    { userId: caroleId, recipeId: recipeIds[19], rating: 5, comment: "Incroyable pour un dessert vegan, même mon mari a aimé !" },
    { userId: sophieId, recipeId: recipeIds[19], rating: 4, comment: "La texture crémeuse est bluffante sans produits laitiers." },
    { userId: lucasId, recipeId: recipeIds[19], rating: 4, comment: "J'ai été surpris, c'est vraiment bon." },
    // Recipe 20 : Velouté lentilles (emma) → carole, sophie, lucas
    { userId: caroleId, recipeId: recipeIds[20], rating: 5, comment: "Chaud, réconfortant et très parfumé." },
    { userId: sophieId, recipeId: recipeIds[20], rating: 4, comment: "Le lait de coco adoucit parfaitement les épices." },
    { userId: lucasId, recipeId: recipeIds[20], rating: 5, comment: "Je le refais toutes les semaines, c'est devenu mon plat favori." },
  ]
}

// ─── Favorite fixtures ────────────────────────────────────────────────────────

function buildFavorites(userIds: Types.ObjectId[], recipeIds: Types.ObjectId[]) {
  const [caroleId, sophieId, lucasId, emmaId] = userIds
  return [
    // Carole (recettes de Sophie, Lucas, Emma uniquement)
    { userId: caroleId, recipeId: recipeIds[5] },   // Ratatouille
    { userId: caroleId, recipeId: recipeIds[8] },   // Gratin dauphinois
    { userId: caroleId, recipeId: recipeIds[10] },  // Bœuf bourguignon
    { userId: caroleId, recipeId: recipeIds[19] },  // Cheesecake vegan
    { userId: caroleId, recipeId: recipeIds[17] },  // Houmous
    // Sophie (recettes de Carole, Lucas, Emma uniquement)
    { userId: sophieId, recipeId: recipeIds[0] },   // Quiche lorraine
    { userId: sophieId, recipeId: recipeIds[2] },   // Crème brûlée
    { userId: sophieId, recipeId: recipeIds[10] },  // Bœuf bourguignon
    { userId: sophieId, recipeId: recipeIds[18] },  // Taboulé
    { userId: sophieId, recipeId: recipeIds[15] },  // Buddha bowl
    // Lucas (recettes de Carole, Sophie, Emma uniquement)
    { userId: lucasId, recipeId: recipeIds[5] },    // Ratatouille
    { userId: lucasId, recipeId: recipeIds[1] },    // Tarte tatin
    { userId: lucasId, recipeId: recipeIds[18] },   // Taboulé
    { userId: lucasId, recipeId: recipeIds[16] },   // Smoothie vert
    { userId: lucasId, recipeId: recipeIds[19] },   // Cheesecake vegan
    // Emma (recettes de Carole, Sophie, Lucas uniquement — végétariennes ou polyvalentes)
    { userId: emmaId, recipeId: recipeIds[3] },     // Soupe à l'oignon
    { userId: emmaId, recipeId: recipeIds[4] },     // Vinaigrette
    { userId: emmaId, recipeId: recipeIds[9] },     // Limonade
    { userId: emmaId, recipeId: recipeIds[8] },     // Gratin dauphinois
    { userId: emmaId, recipeId: recipeIds[6] },     // Tapenade
    { userId: emmaId, recipeId: recipeIds[11] },    // Pain perdu
  ]
}

// ─── ShoppingList fixtures ────────────────────────────────────────────────────

function buildShoppingLists(userIds: Types.ObjectId[], recipeIds: Types.ObjectId[]) {
  const [caroleId, sophieId, lucasId, emmaId] = userIds
  return [
    // ─ Carole ──────────────────────────────────────────────────────────────
    {
      userId: caroleId,
      name: "Courses de la semaine",
      items: [
        { name: "Lait entier", quantity: 1, unit: "l", checked: false },
        { name: "Beurre doux", quantity: 250, unit: "g", checked: true },
        { name: "Oignons jaunes", quantity: 1, unit: "kg", checked: false },
        { name: "Farine T45", quantity: 500, unit: "g", checked: false },
        { name: "Œufs", quantity: 12, unit: "pièce(s)", checked: true },
        { name: "Crème fraîche", quantity: 20, unit: "cl", checked: false },
      ],
      recipeIds: [recipeIds[0], recipeIds[3]],
      servingsOverrides: [{ recipeId: recipeIds[0], servings: 8 }],
    },
    {
      userId: caroleId,
      name: "Dîner du dimanche",
      items: [
        { name: "Bœuf paleron", quantity: 1.5, unit: "kg", checked: false },
        { name: "Vin rouge de Bourgogne", quantity: 1, unit: "l", checked: false },
        { name: "Champignons de Paris", quantity: 400, unit: "g", checked: true },
        { name: "Lardons fumés", quantity: 200, unit: "g", checked: false },
      ],
      recipeIds: [recipeIds[10]],
      servingsOverrides: [{ recipeId: recipeIds[10], servings: 8 }],
    },
    // ─ Sophie ──────────────────────────────────────────────────────────────
    {
      userId: sophieId,
      name: "Liste provençale",
      items: [
        { name: "Aubergines", quantity: 3, unit: "pièce(s)", checked: false },
        { name: "Courgettes", quantity: 4, unit: "pièce(s)", checked: false },
        { name: "Tomates mûres", quantity: 1, unit: "kg", checked: false },
        { name: "Herbes de Provence", quantity: 50, unit: "g", checked: true },
        { name: "Huile d'olive", quantity: 500, unit: "ml", checked: true },
      ],
      recipeIds: [recipeIds[5]],
      servingsOverrides: [{ recipeId: recipeIds[5], servings: 4 }],
    },
    {
      userId: sophieId,
      name: "Apéro maison",
      items: [
        { name: "Olives noires dénoyautées", quantity: 300, unit: "g", checked: false },
        { name: "Câpres", quantity: 100, unit: "g", checked: false },
        { name: "Boîtes d'anchois", quantity: 2, unit: "pièce(s)", checked: true },
        { name: "Pain baguette", quantity: 2, unit: "pièce(s)", checked: false },
      ],
      recipeIds: [],
      servingsOverrides: [],
    },
    // ─ Lucas ───────────────────────────────────────────────────────────────
    {
      userId: lucasId,
      name: "Recette du week-end",
      items: [
        { name: "Bœuf à braiser", quantity: 1.5, unit: "kg", checked: true },
        { name: "Bière brune", quantity: 1, unit: "l", checked: false },
        { name: "Oignons", quantity: 500, unit: "g", checked: false },
        { name: "Pain d'épices", quantity: 1, unit: "pièce(s)", checked: false },
      ],
      recipeIds: [recipeIds[12]],
      servingsOverrides: [{ recipeId: recipeIds[12], servings: 6 }],
    },
    {
      userId: lucasId,
      name: "Petit-déjeuner du dimanche",
      items: [
        { name: "Brioche tranchée", quantity: 1, unit: "pièce(s)", checked: false },
        { name: "Œufs", quantity: 6, unit: "pièce(s)", checked: false },
        { name: "Lait entier", quantity: 500, unit: "ml", checked: true },
        { name: "Cannelle moulue", quantity: 1, unit: "pincée", checked: false },
        { name: "Beurre doux", quantity: 100, unit: "g", checked: false },
      ],
      recipeIds: [],
      servingsOverrides: [],
    },
    // ─ Emma ────────────────────────────────────────────────────────────────
    {
      userId: emmaId,
      name: "Semaine végane",
      items: [
        { name: "Pois chiches cuits (boîte)", quantity: 2, unit: "pièce(s)", checked: false },
        { name: "Avocats mûrs", quantity: 3, unit: "pièce(s)", checked: false },
        { name: "Épinards frais", quantity: 200, unit: "g", checked: true },
        { name: "Tahini", quantity: 200, unit: "g", checked: true },
        { name: "Riz complet", quantity: 500, unit: "g", checked: false },
      ],
      recipeIds: [recipeIds[15], recipeIds[17]],
      servingsOverrides: [{ recipeId: recipeIds[15], servings: 4 }],
    },
    {
      userId: emmaId,
      name: "Smoothies et jus de la semaine",
      items: [
        { name: "Bananes", quantity: 5, unit: "pièce(s)", checked: false },
        { name: "Épinards frais", quantity: 200, unit: "g", checked: false },
        { name: "Lait d'amande", quantity: 1, unit: "l", checked: true },
        { name: "Gingembre frais", quantity: 50, unit: "g", checked: false },
        { name: "Citrons jaunes", quantity: 4, unit: "pièce(s)", checked: false },
      ],
      recipeIds: [recipeIds[16]],
      servingsOverrides: [],
    },
  ]
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGO_URI
  const dbName = process.env.MONGO_DB_NAME
  if (!uri) throw new Error("MONGO_URI manquant dans .env")

  console.log("Connexion à MongoDB…")
  await mongoose.connect(uri, { dbName })
  console.log("Connecté\n")

  // Clear
  console.log("Vidage des collections…")
  await ReviewModel.deleteMany({})
  await FavoriteModel.deleteMany({})
  await ShoppingListModel.deleteMany({})
  await RecipeModel.deleteMany({})
  await UserModel.deleteMany({})
  console.log("Collections vidées\n")

  // Users
  console.log("Insertion des users…")
  const userData = await buildUsers()
  const users = await UserModel.insertMany(userData)
  const userIds = users.map((u) => u._id as Types.ObjectId)
  console.log(`  ${users.length} users créés`)

  // Recipes
  console.log("Insertion des recettes…")
  const recipeData = buildRecipes(userIds)
  const recipes = await RecipeModel.insertMany(recipeData)
  const recipeIds = recipes.map((r) => r._id as Types.ObjectId)
  console.log(`  ${recipes.length} recettes créées`)

  // Reviews
  console.log("Insertion des avis…")
  const reviewData = buildReviews(userIds, recipeIds)
  const reviews = await ReviewModel.insertMany(reviewData)
  console.log(`  ${reviews.length} avis créés`)

  // Update averageRating + ratingsCount on each recipe
  console.log("Mise à jour des notes moyennes…")
  const ratingMap = new Map<string, { sum: number; count: number }>()
  for (const review of reviews) {
    const key = review.recipeId.toString()
    const current = ratingMap.get(key) ?? { sum: 0, count: 0 }
    ratingMap.set(key, { sum: current.sum + review.rating, count: current.count + 1 })
  }
  await Promise.all(
    Array.from(ratingMap.entries()).map(([recipeId, { sum, count }]) =>
      RecipeModel.updateOne(
        { _id: new Types.ObjectId(recipeId) },
        {
          averageRating: Math.round((sum / count) * 10) / 10,
          ratingsCount: count,
        }
      )
    )
  )
  console.log(`  Notes mises à jour pour ${ratingMap.size} recettes`)

  // Favorites
  console.log("Insertion des favoris…")
  const favoriteData = buildFavorites(userIds, recipeIds)
  const favorites = await FavoriteModel.insertMany(favoriteData)
  console.log(`  ${favorites.length} favoris créés`)

  // Shopping lists
  console.log("Insertion des listes de courses…")
  const shoppingListData = buildShoppingLists(userIds, recipeIds)
  const shoppingLists = await ShoppingListModel.insertMany(shoppingListData)
  console.log(`  ${shoppingLists.length} listes créées`)

  await mongoose.disconnect()

  console.log("\n✅ Seed terminé !")
  console.log(`   Users          : ${users.length}`)
  console.log(`   Recettes       : ${recipes.length}`)
  console.log(`   Avis           : ${reviews.length}`)
  console.log(`   Favoris        : ${favorites.length}`)
  console.log(`   Listes courses : ${shoppingLists.length}`)
}

main().catch((err) => {
  console.error("Seed échoué :", err)
  process.exit(1)
})
```

- [ ] **Step 2 : Commit**

```bash
git add backend/src/seed.ts
git commit -m "feat(backend): ajouter le script de seed de données dev"
```

---

## Task 3 : Exécuter le seed et vérifier

**Files:** aucun (vérification uniquement)

- [ ] **Step 1 : Lancer le seed depuis `backend/`**

```bash
cd backend && pnpm seed
```

Expected output (dans l'ordre) :
```
Connexion à MongoDB…
Connecté

Vidage des collections…
Collections vidées

Insertion des users…
  4 users créés
Insertion des recettes…
  21 recettes créées
Insertion des avis…
  52 avis créés
Mise à jour des notes moyennes…
  Notes mises à jour pour 21 recettes
Insertion des favoris…
  21 favoris créés
Insertion des listes de courses…
  8 listes créées

✅ Seed terminé !
   Users          : 4
   Recettes       : 21
   Avis           : 52
   Favoris        : 21
   Listes courses : 8
```

Si le script échoue avec une erreur TypeScript liée aux imports, vérifier que `tsconfig.seed.json` est bien présent à la racine de `backend/`.

Si le script échoue avec `Cannot find module 'dotenv/config'`, relancer `pnpm install` depuis `backend/`.

- [ ] **Step 2 : Relancer le seed une deuxième fois pour vérifier l'idempotence**

```bash
pnpm seed
```

Expected : même output que ci-dessus, sans erreur de doublon.

- [ ] **Step 3 : Commit final**

```bash
cd ..
git add backend/package.json
git commit -m "chore(backend): confirmer le bon fonctionnement du script seed"
```

> Note : Si `backend/package.json` était déjà commité en Task 1, ce commit ne sera pas nécessaire.
