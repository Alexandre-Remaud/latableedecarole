import { useEffect, useState } from "react"
import { Link } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { recipeService } from "@recipes/api"
import RecipeBadges from "@recipes/RecipeBadges"
import ConfirmDialog from "@/components/ConfirmDialog"
import type { Recipe } from "@recipes/contract"
import { useAuth } from "@/features/auth/hooks"
import FavoriteButton from "@/features/favorites/FavoriteButton"

const HOME_LIMIT = 10

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    recipeService
      .getRecipes(undefined, undefined, 0, HOME_LIMIT)
      .then(({ data, total }) => {
        setTotal(total)
        setRecipes(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!deletingId) return

    try {
      await recipeService.deleteRecipe(deletingId)
      setRecipes((prev) => prev.filter((r) => r._id !== deletingId))
      toast.success("Recette supprimée")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      )
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12 text-gray-500">
        Chargement des recettes...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center py-10 mb-6">
        <h1 className="font-display text-4xl font-bold text-gray-800 mb-2">
          Bienvenue chez Carole
        </h1>
        <p className="text-gray-500 text-lg">
          Retrouvez toutes vos recettes au même endroit.
        </p>
      </div>

      {recipes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucune recette pour le moment.</p>
          {user && (
            <Link
              to="/recipes/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors"
            >
              Ajouter une recette
            </Link>
          )}
        </div>
      ) : (
        <>
          <h2 className="font-display text-xl font-semibold text-gray-800 mb-4">
            Dernières recettes
          </h2>

          <ul className="grid gap-4">
            {recipes.map((recipe) => (
              <li
                key={recipe._id}
                className="relative bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <Link
                  to="/recipes/$id"
                  params={{ id: recipe._id }}
                  className="block"
                >
                  <div className="flex items-start justify-between gap-4">
                    {recipe.imageThumbnailUrl && (
                      <img
                        src={recipe.imageThumbnailUrl}
                        alt={recipe.title}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-lg font-semibold text-gray-800 truncate">
                        {recipe.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {recipe.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <RecipeBadges recipe={recipe} />
                    <FavoriteButton
                      recipeId={recipe._id}
                      initialFavorited={recipe.isFavorited ?? false}
                      initialCount={recipe.favoritesCount ?? 0}
                    />
                  </div>
                </Link>

                {user && (user._id === recipe.userId || user.role === "admin") && (
                  <button
                    type="button"
                    onClick={() => setDeletingId(recipe._id)}
                    className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label={`Supprimer ${recipe.title}`}
                  >
                    <svg
                      width="18"
                      height="18"
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
                  </button>
                )}
              </li>
            ))}
          </ul>

          {total > HOME_LIMIT && (
            <div className="text-center mt-6">
              <Link
                to="/recipes"
                className="text-sm font-medium text-warm-600 hover:text-warm-700 transition-colors"
              >
                Voir toutes les recettes ({total})
              </Link>
            </div>
          )}
        </>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Supprimer la recette"
          message="Cette action est irréversible. Voulez-vous vraiment supprimer cette recette ?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
