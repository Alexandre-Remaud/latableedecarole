import type { CreateRecipeContract } from "@recipes/contract"
import type { RecipeFormData } from "@recipes/schema"

function toCreateRecipePayload(formData: RecipeFormData): CreateRecipeContract {
  return {
    title: formData.title.trim(),
    description: formData.description.trim(),

    ingredients: formData.ingredients.map((i) => ({
      name: i.name.trim(),
      quantity: i.quantity,
      unit: i.unit
    })),

    steps: formData.steps.map((s, index) => ({
      order: index + 1,
      instruction: s.instruction.trim(),

      ...(s.duration != undefined && { duration: s.duration }),
      ...(s.durationUnit &&
        s.duration != undefined && { durationUnit: s.durationUnit }),
      ...(s.temperature != undefined && { temperature: s.temperature }),
      ...(s.temperatureUnit &&
        s.temperature != undefined && { temperatureUnit: s.temperatureUnit }),
      ...(s.note?.trim() && { note: s.note.trim() })
    })),

    ...(formData.image && {
      imageUrl: formData.image.originalUrl,
      imageThumbnailUrl: formData.image.thumbnailUrl,
      imageMediumUrl: formData.image.mediumUrl,
      imagePublicId: formData.image.publicId
    }),

    ...(formData.servings && { servings: formData.servings }),
    ...(formData.difficulty && { difficulty: formData.difficulty }),
    ...(formData.category?.length && { category: formData.category }),
    ...(formData.prepTime && { prepTime: formData.prepTime })
  }
}

export default toCreateRecipePayload
