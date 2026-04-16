import { useParams } from "@tanstack/react-router"
import { useCollection } from "@/features/collections/hooks"
import { useAuth } from "@/features/auth/hooks"
import { Link } from "@tanstack/react-router"
import toast from "react-hot-toast"

export default function CollectionDetail() {
  const { collectionId } = useParams({ from: "/collections/$collectionId" })
  const { collection, loading, error, removeRecipe, updateCollection } =
    useCollection(collectionId)
  const { user } = useAuth()

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-gray-400 text-sm">
        Chargement...
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12 text-red-500 text-sm">
        {error}
      </div>
    )
  }

  if (!collection) return null

  const isOwner = user?._id === collection.userId

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href)
    toast.success("Lien copié !")
  }

  async function handleTogglePublic() {
    try {
      await updateCollection({ isPublic: !collection!.isPublic })
      toast.success(
        collection!.isPublic
          ? "Collection rendue privée"
          : "Collection rendue publique"
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    }
  }

  async function handleRemoveRecipe(recipeId: string) {
    try {
      await removeRecipe(recipeId)
      toast.success("Recette retirée de la collection")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover image */}
      {collection.coverImage && (
        <div className="aspect-[3/1] rounded-2xl overflow-hidden mb-6">
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-6 h-px bg-warm-400" />
            <h1 className="font-display text-2xl font-bold text-gray-800">
              {collection.name}
            </h1>
            {collection.isPublic && (
              <span className="text-xs font-medium text-warm-700 bg-warm-100 px-2 py-0.5 rounded-full">
                Publique
              </span>
            )}
          </div>
          {collection.description && (
            <p className="text-sm text-gray-500 ml-9">
              {collection.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              type="button"
              onClick={handleTogglePublic}
              className="text-xs text-gray-400 hover:text-warm-600 transition-colors"
            >
              {collection.isPublic ? "Rendre privée" : "Rendre publique"}
            </button>
          )}
          {collection.isPublic && (
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-warm-600 transition-colors"
              aria-label="Partager"
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
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" x2="12" y1="2" y2="15" />
              </svg>
              Partager
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 ml-9 mb-6">
        {collection.recipes.length} recette
        {collection.recipes.length !== 1 ? "s" : ""}
      </p>

      {/* Recipe grid */}
      {collection.recipes.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Aucune recette dans cette collection.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {collection.recipes.map((recipe) => (
            <div key={recipe._id} className="relative group">
              <Link
                to="/recipes/$id"
                params={{ id: recipe._id }}
                className="block rounded-2xl overflow-hidden border border-gray-100 hover:border-warm-300 transition-all duration-150 bg-white"
              >
                <div className="aspect-[4/3] bg-warm-50 overflow-hidden">
                  {recipe.thumbnailUrl || recipe.imageUrl ? (
                    <img
                      src={recipe.thumbnailUrl ?? recipe.imageUrl}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-warm-200">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />
                        <path d="M12 8v4l3 3" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {recipe.title}
                  </p>
                </div>
              </Link>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleRemoveRecipe(recipe._id)}
                  className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Retirer de la collection"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
