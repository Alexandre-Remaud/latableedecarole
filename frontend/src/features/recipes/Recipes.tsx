import { useEffect, useState } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { recipeService } from "@recipes/api"
import { CATEGORIES } from "@recipes/constants/categories"
import RecipeBadges from "@recipes/RecipeBadges"
import ConfirmDialog from "@/components/ConfirmDialog"
import type { Recipe } from "@recipes/contract"
import { Route } from "@/routes/recipes/index"
import { useAuth } from "@/features/auth/hooks"
import FavoriteButton from "@/features/favorites/FavoriteButton"
import ReviewSummary from "@/features/reviews/ReviewSummary"
import { usePopularTags } from "@/features/tags/hooks"

const LIMIT = 21

function getPageTitle(category?: string, search?: string) {
  if (search) return `Résultats pour "${search}"`
  if (!category) return "Recettes"
  return CATEGORIES.find((c) => c.value === category)?.label ?? "Recettes"
}

export default function Recipes() {
  const { category, search, tags: tagsParam } = Route.useSearch()
  const navigate = useNavigate()
  const selectedTags = tagsParam ? tagsParam.split(",").filter(Boolean) : []
  const { data: popularTagsData = [] } = usePopularTags()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    setLoading(true)
    setRecipes([])
    setSkip(0)
    setTotal(0)
    recipeService
      .getRecipes(
        category,
        search,
        0,
        LIMIT,
        tagsParam ? tagsParam.split(",").filter(Boolean) : undefined
      )
      .then(({ data, total }) => {
        setRecipes(data)
        setTotal(total)
        setSkip(LIMIT)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, search, tagsParam])

  async function handleLoadMore() {
    setLoadingMore(true)
    try {
      const { data, total: newTotal } = await recipeService.getRecipes(
        category,
        search,
        skip,
        LIMIT,
        selectedTags.length ? selectedTags : undefined
      )
      setRecipes((prev) => [...prev, ...data])
      setTotal(newTotal)
      setSkip((prev) => prev + LIMIT)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      )
    } finally {
      setLoadingMore(false)
    }
  }

  function handleTagClick(tag: string) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag]
    navigate({
      to: "/recipes",
      search: (prev) => ({
        ...prev,
        tags: next.length ? next.join(",") : undefined
      })
    })
  }

  async function handleDelete() {
    if (!deletingId) return

    try {
      await recipeService.deleteRecipe(deletingId)
      setRecipes((prev) => prev.filter((r) => r._id !== deletingId))
      setTotal((prev) => prev - 1)
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

  if (recipes.length === 0) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12">
        <p className="text-gray-500 mb-4">
          {search
            ? `Aucune recette trouvée pour "${search}".`
            : "Aucune recette pour le moment."}
        </p>
        {!search && (
          <Link
            to="/recipes/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors"
          >
            Ajouter une recette
          </Link>
        )}
      </div>
    )
  }

  const hasMore = recipes.length < total

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-6 h-px bg-warm-400" />
        <h1 className="font-display text-2xl font-bold text-gray-800">
          {getPageTitle(category, search)}
        </h1>
      </div>

      {popularTagsData.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {popularTagsData.map(({ name }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleTagClick(name)}
              className={`text-sm px-3 py-1 rounded-full border transition-colors ${
                selectedTags.includes(name)
                  ? "bg-warm-600 text-white border-warm-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-warm-400"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}

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
                <h2 className="font-display text-base font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug">
                  {recipe.title}
                </h2>
                <p className="text-sm text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <RecipeBadges recipe={recipe} onTagClick={handleTagClick} />
                  {(recipe.averageRating ?? 0) > 0 && (
                    <ReviewSummary
                      averageRating={recipe.averageRating ?? 0}
                      ratingsCount={recipe.ratingsCount ?? 0}
                      compact
                    />
                  )}
                </div>
              </div>
            </Link>

            <div className="absolute top-2.5 right-2.5 flex items-center bg-white/90 rounded-full px-2 py-1 shadow-sm">
              <FavoriteButton
                recipeId={recipe._id}
                initialFavorited={recipe.isFavorited ?? false}
                initialCount={recipe.favoritesCount ?? 0}
              />
            </div>

            {user && (user._id === recipe.userId || user.role === "admin") && (
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

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-warm-700 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? "Chargement..." : "Voir plus"}
          </button>
        </div>
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
