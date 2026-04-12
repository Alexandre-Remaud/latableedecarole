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
      <div className="text-center py-12 mb-10">
        <p className="text-xs font-semibold tracking-[0.25em] text-warm-500 uppercase mb-4">
          Collection de recettes
        </p>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-gray-800 mb-4 leading-tight">
          La tablée
          <br />
          <span className="italic font-display text-warm-600">de Carole</span>
        </h1>
        <p className="text-gray-400 max-w-xs mx-auto text-sm tracking-wide">
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
          <div className="flex items-center gap-3 mb-6">
            <span className="w-6 h-px bg-warm-400" />
            <h2 className="font-display text-xl font-semibold text-gray-800">
              Dernières recettes
            </h2>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe) => (
              <li
                key={recipe._id}
                className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Link
                  to="/recipes/$id"
                  params={{ id: recipe._id }}
                  className="block"
                >
                  <div className="relative aspect-4/3 bg-warm-100 overflow-hidden">
                    {recipe.imageThumbnailUrl ? (
                      <img
                        src={recipe.imageThumbnailUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          width="36"
                          height="36"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-warm-300"
                        >
                          <path d="M2 12h20" />
                          <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                          <path d="m4 8 16-4" />
                          <path d="m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-base font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                      {recipe.description}
                    </p>
                    <RecipeBadges recipe={recipe} />
                  </div>
                </Link>

                <div className="absolute top-2.5 right-2.5 flex items-center bg-white/90 rounded-full px-2 py-1 shadow-sm">
                  <FavoriteButton
                    recipeId={recipe._id}
                    initialFavorited={recipe.isFavorited ?? false}
                    initialCount={recipe.favoritesCount ?? 0}
                  />
                </div>

                {user &&
                  (user._id === recipe.userId || user.role === "admin") && (
                    <button
                      type="button"
                      onClick={() => setDeletingId(recipe._id)}
                      className="absolute top-2.5 left-2.5 flex items-center px-2 py-1 bg-white/90 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Supprimer ${recipe.title}`}
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
                    </button>
                  )}
              </li>
            ))}
          </ul>

          {total > HOME_LIMIT && (
            <div className="text-center mt-8">
              <Link
                to="/recipes"
                className="inline-flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-warm-700 transition-colors group"
              >
                Voir toutes les recettes
                <span className="text-warm-400 group-hover:translate-x-0.5 transition-transform">
                  ({total})
                </span>
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
