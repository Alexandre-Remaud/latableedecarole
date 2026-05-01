import { z } from "zod"

const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Le nom de l'ingrédient est requis"),
  quantity: z.number().min(0, "La quantité doit être positive"),
  unit: z.string().min(1, "L'unité est requise")
})

const stepSchema = z.object({
  id: z.string(),
  order: z.number(),
  instruction: z.string().min(1, "L'étape est requise"),
  duration: z.number().optional(),
  durationUnit: z.enum(["min", "sec"]).optional(),
  temperature: z.number().optional(),
  temperatureUnit: z.enum(["C", "F"]).optional(),
  note: z.string().optional()
})

const imageSchema = z
  .object({
    originalUrl: z.string(),
    thumbnailUrl: z.string(),
    mediumUrl: z.string(),
    publicId: z.string()
  })
  .nullable()
  .optional()

export const recipeFormSchema = z.object({
  title: z.string().min(1, "Le nom de la recette est requis"),
  description: z.string().min(1, "La description est requise"),
  image: imageSchema,
  category: z.enum([
    "appetizer",
    "starter",
    "main_course",
    "side_dish",
    "dessert",
    "snack",
    "beverage",
    "sauce"
  ]),
  servings: z
    .number()
    .min(1, "Au moins 1 personne")
    .max(100, "Maximum 100 personnes"),
  prepTime: z.number().min(0, "Il faut au moins une estimation"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "Au moins un ingrédient est requis"),
  steps: z.array(stepSchema).min(1, "Au moins une étape est requise"),
  tags: z.array(z.string().min(2).max(30)).max(10).optional().default([])
})

export type RecipeFormData = z.infer<typeof recipeFormSchema>
