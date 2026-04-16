import { useState } from "react"
import { useMyCollections } from "@/features/collections/hooks"
import CollectionCard from "@/features/collections/components/CollectionCard"
import { collectionsApi } from "@/features/collections/api"
import toast from "react-hot-toast"

export default function Collections() {
  const { collections, loading, error, refresh } = useMyCollections()
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [submitting, setSubmitting] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setSubmitting(true)
    try {
      await collectionsApi.create({ name: newName.trim() })
      setNewName("")
      setCreating(false)
      toast.success("Collection créée")
      await refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    } finally {
      setSubmitting(false)
    }
  }

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

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="w-6 h-px bg-warm-400" />
          <h1 className="font-display text-2xl font-bold text-gray-800">
            Mes collections
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 text-sm font-medium text-warm-600 hover:text-warm-700 transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvelle collection
        </button>
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="mb-6 flex items-center gap-3 p-4 bg-warm-50 rounded-2xl"
        >
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nom de la collection"
            maxLength={100}
            autoFocus
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={submitting || !newName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Créer"}
          </button>
          <button
            type="button"
            onClick={() => setCreating(false)}
            className="px-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Annuler
          </button>
        </form>
      )}

      {collections.length === 0 ? (
        <div className="text-center py-16">
          <svg
            className="mx-auto mb-4 text-warm-200"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 text-sm mb-1">Aucune collection</p>
          <p className="text-gray-400 text-xs">
            Créez votre première collection depuis une fiche recette.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {collections.map((col) => (
            <CollectionCard key={col._id} collection={col} />
          ))}
        </div>
      )}
    </div>
  )
}
