import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useMyCollections } from "../hooks"

interface Props {
  recipeId: string
  recipeTitle: string
  onClose: () => void
}

export default function AddToCollectionModal({
  recipeId,
  recipeTitle,
  onClose
}: Props) {
  const { collections, loading, createCollection, addRecipeToCollection } =
    useMyCollections()
  const [view, setView] = useState<"select" | "create">("select")
  const [newName, setNewName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && collections.length === 0) setView("create")
  }, [loading, collections.length])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [onClose])

  async function handleAddToExisting(collectionId: string) {
    setSubmitting(true)
    try {
      await addRecipeToCollection(collectionId, recipeId)
      const name =
        collections.find((c) => c._id === collectionId)?.name ?? "la collection"
      toast.success(`Ajouté à ${name}`)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      const created = await createCollection(newName.trim())
      await addRecipeToCollection(created._id, recipeId)
      toast.success(`Collection "${newName.trim()}" créée`)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-to-collection-title"
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm mx-0 sm:mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2
            id="add-to-collection-title"
            className="font-display text-lg font-semibold text-gray-800"
          >
            Collections
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fermer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4 truncate">
          <span className="font-medium text-gray-700">{recipeTitle}</span>
        </p>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Chargement...
          </p>
        ) : view === "select" ? (
          <div className="space-y-2">
            {collections.map((col) => {
              const alreadyIn = col.recipeIds.includes(recipeId)
              return (
                <button
                  key={col._id}
                  type="button"
                  onClick={() => !alreadyIn && handleAddToExisting(col._id)}
                  disabled={submitting || alreadyIn}
                  className="w-full text-left px-4 py-3 rounded-xl border border-gray-100 hover:border-warm-300 hover:bg-warm-50 transition-all duration-150 disabled:opacity-50 disabled:cursor-default"
                >
                  <p className="text-sm font-medium text-gray-800">
                    {col.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {alreadyIn
                      ? "Déjà dans cette collection"
                      : `${col.recipeIds.length} recette${col.recipeIds.length !== 1 ? "s" : ""}`}
                  </p>
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setView("create")}
              className="w-full text-left px-4 py-3 rounded-xl border border-dashed border-gray-200 hover:border-warm-400 hover:bg-warm-50 transition-all duration-150 text-sm text-gray-500 hover:text-warm-600 flex items-center gap-2"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Créer une nouvelle collection
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            {collections.length > 0 && (
              <button
                type="button"
                onClick={() => setView("select")}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-1"
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
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Retour
              </button>
            )}
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nom de la collection"
              maxLength={100}
              autoFocus
              className="input-field"
            />
            <button
              type="submit"
              disabled={submitting || !newName.trim()}
              className="w-full py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Création..." : "Créer et ajouter"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
