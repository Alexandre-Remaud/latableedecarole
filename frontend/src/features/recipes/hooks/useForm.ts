import { useEffect, useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { recipeFormSchema, type RecipeFormData } from "@recipes/schema"
import { createIngredient } from "@recipes/factories/ingredient.factory"
import { createStep } from "@recipes/factories/step.factory"
import { recipeService } from "@recipes/api"
import { ApiError, NetworkError } from "@/lib/api-client"
import { recipeToFormData } from "@recipes/recipeToFormData"

export function useRecipeForm(recipeId?: string) {
  const navigate = useNavigate()
  const isEditMode = Boolean(recipeId)
  const [isLoading, setIsLoading] = useState(isEditMode)

  const form = useForm<RecipeFormData>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      title: "",
      description: "",
      image: null,
      category: "main_course",
      servings: 1,
      prepTime: 0,
      difficulty: "easy",
      ingredients: [createIngredient()],
      steps: [createStep(1)]
    }
  })

  useEffect(() => {
    if (!recipeId) return

    recipeService
      .getRecipe(recipeId)
      .then((recipe) => {
        form.reset(recipeToFormData(recipe))
      })
      .catch((err) => {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors du chargement"
        )
      })
      .finally(() => setIsLoading(false))
  }, [recipeId, form])

  const ingredients = useFieldArray({
    control: form.control,
    name: "ingredients"
  })

  const steps = useFieldArray({
    control: form.control,
    name: "steps"
  })

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      if (recipeId) {
        await recipeService.updateRecipe(recipeId, data)
        toast.success("Recette modifiée !")
        navigate({ to: "/recipes/$id", params: { id: recipeId } })
      } else {
        await recipeService.createRecipe(data)
        toast.success("Recette créée avec succès !")
        form.reset()
        navigate({ to: "/" })
      }
    } catch (error) {
      if (error instanceof NetworkError) {
        toast.error(error.message)
      } else if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error("Une erreur inattendue est survenue.")
      }
    }
  })

  return {
    form,
    ingredients,
    steps,
    onSubmit,
    isLoading,
    isEditMode,
    addIngredient: () => ingredients.append(createIngredient()),
    addStep: () => steps.append(createStep(steps.fields.length + 1))
  }
}
