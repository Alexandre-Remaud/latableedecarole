import { useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { recipeService } from "@recipes/api"
import { getUnitLabel } from "@recipes/constants/labels"
import RecipeBadges from "@recipes/RecipeBadges"
import ConfirmDialog from "@/components/ConfirmDialog"
import type { Recipe } from "@recipes/contract"

export default function RecipeDetail() {
  const { id } = useParams({ from: "/recipes/$id" })
  const navigate = useNavigate()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    recipeService
      .getRecipe(id)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function handleDelete() {
    try {
      await recipeService.deleteRecipe(id)
      toast.success("Recette supprimée")
      navigate({ to: "/recipes" })
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      )
      setShowDeleteDialog(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-gray-500">
        Chargement de la recette...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-red-500">
        {error}
      </div>
    )
  }

  if (!recipe) return null

  const sortedSteps = [...recipe.steps].sort((a, b) => a.order - b.order)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/recipes"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-warm-600 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          Retour aux recettes
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/recipes/$id/edit"
            params={{ id }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-warm-600 hover:text-white hover:bg-warm-600 border border-warm-200 rounded-xl transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Modifier
          </Link>

          <button
            type="button"
            onClick={() => setShowDeleteDialog(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded-xl transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      <h1 className="font-display text-2xl font-bold text-gray-800 mb-2">
        {recipe.title}
      </h1>

      <p className="text-gray-500 mb-6">{recipe.description}</p>

      <RecipeBadges recipe={recipe} className="mb-8" />

      <section className="mb-8">
        <h2 className="font-display text-lg font-semibold text-gray-800 mb-3">
          Ingrédients
        </h2>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="text-sm text-gray-700">
              <span className="font-medium">{ing.quantity}</span>{" "}
              {getUnitLabel(ing.unit)} — {ing.name}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-gray-800 mb-3">
          Étapes
        </h2>
        <ol className="space-y-4">
          {sortedSteps.map((step) => (
            <li
              key={step.order}
              className="bg-white border border-gray-100 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-warm-50 text-warm-700 text-sm font-semibold">
                  {step.order}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-700">{step.instruction}</p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {step.duration != null && step.duration > 0 && (
                      <span className="text-xs text-gray-500">
                        {step.duration} {step.durationUnit ?? "min"}
                      </span>
                    )}
                    {step.temperature != null && step.temperature > 0 && (
                      <span className="text-xs text-gray-500">
                        {step.temperature}°{step.temperatureUnit ?? "C"}
                      </span>
                    )}
                  </div>

                  {step.note && (
                    <p className="text-xs text-gray-400 italic mt-1">
                      {step.note}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {showDeleteDialog && (
        <ConfirmDialog
          title="Supprimer la recette"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer cette recette ?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  )
}
