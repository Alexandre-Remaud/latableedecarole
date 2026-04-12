import { useState, useEffect, useCallback } from "react"
import { Link, useParams } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { profileApi } from "./api"
import type {
  PublicProfile as PublicProfileType,
  UserRecipesResponse
} from "./contract"
import ProfileHeader from "./components/ProfileHeader"

const RECIPES_LIMIT = 10

export default function PublicProfile() {
  const { id } = useParams({ strict: false }) as { id: string }
  const [profile, setProfile] = useState<PublicProfileType | null>(null)
  const [recipes, setRecipes] = useState<UserRecipesResponse["data"]>([])
  const [recipesTotal, setRecipesTotal] = useState(0)
  const [recipesPage, setRecipesPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await profileApi.getPublicProfile(id)
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Utilisateur non trouvé")
      } finally {
        setLoading(false)
      }
    }
    void loadProfile()
  }, [id])

  const loadRecipes = useCallback(
    async (page: number) => {
      try {
        const result = await profileApi.getUserRecipes(
          id,
          page * RECIPES_LIMIT,
          RECIPES_LIMIT
        )
        setRecipes(result.data)
        setRecipesTotal(result.total)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors du chargement"
        )
      }
    },
    [id]
  )

  useEffect(() => {
    if (profile) {
      void loadRecipes(recipesPage)
    }
  }, [profile, recipesPage, loadRecipes])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-gray-500">
        Chargement...
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-red-500">
        {error || "Utilisateur non trouvé"}
      </div>
    )
  }

  const totalPages = Math.ceil(recipesTotal / RECIPES_LIMIT)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <ProfileHeader
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          bio={profile.bio}
          createdAt={profile.createdAt}
          recipesCount={profile.recipesCount}
        />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold text-gray-800 mb-4">
          Recettes publiées
        </h2>

        {recipes.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            Aucune recette publiée.
          </p>
        ) : (
          <>
            <ul className="grid gap-4">
              {recipes.map((recipe) => (
                <li
                  key={recipe._id}
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow"
                >
                  <Link
                    to="/recipes/$id"
                    params={{ id: recipe._id }}
                    className="flex items-start gap-4"
                  >
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
                  </Link>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  type="button"
                  disabled={recipesPage === 0}
                  onClick={() => setRecipesPage((p) => p - 1)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Précédent
                </button>
                <span className="px-3 py-1.5 text-sm text-gray-500">
                  {recipesPage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={recipesPage >= totalPages - 1}
                  onClick={() => setRecipesPage((p) => p + 1)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
