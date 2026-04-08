import { useState, useEffect, useCallback } from "react"
import { Link, useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth/hooks"
import { profileApi } from "./api"
import { favoritesApi } from "@/features/favorites/api"
import type { UserRecipesResponse } from "./contract"
import type { Recipe } from "@recipes/contract"
import ProfileHeader from "./components/ProfileHeader"
import EditProfileModal from "./components/EditProfileModal"
import ChangeEmailModal from "./components/ChangeEmailModal"
import ChangePasswordModal from "./components/ChangePasswordModal"
import FavoriteButton from "@/features/favorites/FavoriteButton"

const RECIPES_LIMIT = 10

export default function MyProfile() {
  const { user, isLoading, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [recipes, setRecipes] = useState<UserRecipesResponse["data"]>([])
  const [recipesTotal, setRecipesTotal] = useState(0)
  const [recipesPage, setRecipesPage] = useState(0)
  const [recipesLoading, setRecipesLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"recipes" | "favorites">("recipes")
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [favoritesTotal, setFavoritesTotal] = useState(0)
  const [favoritesSkip, setFavoritesSkip] = useState(0)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangeEmail, setShowChangeEmail] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)

  const loadRecipes = useCallback(
    async (page: number) => {
      if (!user) return
      setRecipesLoading(true)
      try {
        const result = await profileApi.getUserRecipes(
          user._id,
          page * RECIPES_LIMIT,
          RECIPES_LIMIT
        )
        setRecipes(result.data)
        setRecipesTotal(result.total)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Erreur lors du chargement"
        )
      } finally {
        setRecipesLoading(false)
      }
    },
    [user]
  )

  const loadFavorites = useCallback(async () => {
    setFavoritesLoading(true)
    try {
      const result = await favoritesApi.getMyFavorites(favoritesSkip, RECIPES_LIMIT)
      if (favoritesSkip === 0) {
        setFavorites(result.data)
      } else {
        setFavorites((prev) => [...prev, ...result.data])
      }
      setFavoritesTotal(result.total)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors du chargement"
      )
    } finally {
      setFavoritesLoading(false)
    }
  }, [favoritesSkip])

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate({ to: "/login" })
      return
    }
    if (user) {
      void loadRecipes(recipesPage)
    }
  }, [user, isLoading, recipesPage, navigate, loadRecipes])

  useEffect(() => {
    if (user && activeTab === "favorites") {
      void loadFavorites()
    }
  }, [user, activeTab, loadFavorites])

  if (isLoading || !user) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12 text-gray-500">
        Chargement...
      </div>
    )
  }

  async function handleEditProfile(data: {
    name: string
    bio?: string
    avatarUrl?: string
  }) {
    await profileApi.updateProfile(data)
    await refreshUser()
    setShowEditProfile(false)
    toast.success("Profil mis à jour")
  }

  async function handleChangeEmail(data: {
    newEmail: string
    password: string
  }) {
    await profileApi.changeEmail(data)
    await refreshUser()
    setShowChangeEmail(false)
    toast.success("Email mis à jour")
  }

  async function handleChangePassword(data: {
    currentPassword: string
    newPassword: string
  }) {
    await profileApi.changePassword(data)
    setShowChangePassword(false)
    toast.success("Mot de passe mis à jour")
  }

  const totalPages = Math.ceil(recipesTotal / RECIPES_LIMIT)

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
        <ProfileHeader
          name={user.name}
          avatarUrl={user.avatarUrl}
          bio={user.bio}
          createdAt={user.createdAt}
          recipesCount={recipesTotal}
          showEmail
          email={user.email}
        />

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowEditProfile(true)}
            className="px-4 py-2 text-sm font-medium text-warm-600 border border-warm-300 rounded-xl hover:bg-warm-50 transition-colors"
          >
            Modifier le profil
          </button>
          <button
            type="button"
            onClick={() => setShowChangeEmail(true)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Changer l&apos;email
          </button>
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Changer le mot de passe
          </button>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("recipes")}
            className={`pb-3 text-sm font-medium ${
              activeTab === "recipes"
                ? "text-warm-600 border-b-2 border-warm-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Mes recettes
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("favorites")
              setFavoritesSkip(0)
            }}
            className={`pb-3 text-sm font-medium ${
              activeTab === "favorites"
                ? "text-warm-600 border-b-2 border-warm-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Mes favoris
          </button>
        </div>

        {activeTab === "favorites" ? (
          favoritesLoading && favorites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Vous n&apos;avez pas encore de recettes en favoris.
              </p>
            </div>
          ) : (
            <>
              <ul className="grid gap-4">
                {favorites.map((recipe) => (
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
                        <div className="flex items-center justify-between">
                          <h3 className="font-display text-lg font-semibold text-gray-800 truncate">
                            {recipe.title}
                          </h3>
                          <FavoriteButton
                            recipeId={recipe._id}
                            initialFavorited={true}
                            initialCount={recipe.favoritesCount ?? 0}
                          />
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {recipe.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>

              {favorites.length < favoritesTotal && (
                <div className="mt-8 text-center">
                  <button
                    type="button"
                    onClick={() => setFavoritesSkip(favorites.length)}
                    disabled={favoritesLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-warm-700 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {favoritesLoading ? "Chargement..." : "Voir plus"}
                  </button>
                </div>
              )}
            </>
          )
        ) : recipesLoading ? (
          <div className="text-center py-8 text-gray-500">Chargement...</div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Vous n&apos;avez pas encore publié de recette.
            </p>
            <Link
              to="/recipes/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors"
            >
              Ajouter une recette
            </Link>
          </div>
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

      {showEditProfile && (
        <EditProfileModal
          user={user}
          onSave={handleEditProfile}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {showChangeEmail && (
        <ChangeEmailModal
          onSave={handleChangeEmail}
          onClose={() => setShowChangeEmail(false)}
        />
      )}
      {showChangePassword && (
        <ChangePasswordModal
          onSave={handleChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </div>
  )
}
