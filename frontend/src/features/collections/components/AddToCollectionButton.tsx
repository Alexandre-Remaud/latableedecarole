import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/features/auth/hooks"
import AddToCollectionModal from "./AddToCollectionModal"

interface Props {
  recipe: { _id: string; title: string }
}

export default function AddToCollectionButton({ recipe }: Props) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  function handleClick() {
    if (!user) {
      void navigate({ to: "/login" })
      return
    }
    setModalOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-warm-600 cursor-pointer transition-colors"
        aria-label="Ajouter à une collection"
        title={
          !user
            ? "Connectez-vous pour utiliser les collections"
            : "Ajouter à une collection"
        }
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
          <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
        </svg>
      </button>

      {modalOpen && (
        <AddToCollectionModal
          recipeId={recipe._id}
          recipeTitle={recipe.title}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}
