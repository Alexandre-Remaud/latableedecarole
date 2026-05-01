import type { Recipe } from "@recipes/contract"
import type { RecipeFormData } from "@recipes/schema"

export function recipeToFormData(recipe: Recipe): RecipeFormData {
  return {
    title: recipe.title,
    description: recipe.description,
    image: recipe.imagePublicId
      ? {
          originalUrl: recipe.imageUrl!,
          thumbnailUrl: recipe.imageThumbnailUrl!,
          mediumUrl: recipe.imageMediumUrl!,
          publicId: recipe.imagePublicId
        }
      : null,
    category: (recipe.category as RecipeFormData["category"]) ?? "main_course",
    servings: recipe.servings ?? 1,
    prepTime: recipe.prepTime ?? 0,
    difficulty: recipe.difficulty ?? "easy",
    ingredients: recipe.ingredients.map((ing) => ({
      id: crypto.randomUUID(),
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit
    })),
    steps: recipe.steps.map((step) => ({
      id: crypto.randomUUID(),
      order: step.order,
      instruction: step.instruction,
      ...(step.duration != null && { duration: step.duration }),
      ...(step.durationUnit && { durationUnit: step.durationUnit }),
      ...(step.temperature != null && { temperature: step.temperature }),
      ...(step.temperatureUnit && { temperatureUnit: step.temperatureUnit }),
      ...(step.note && { note: step.note })
    })),
    tags: recipe.tags ?? []
  }
}
