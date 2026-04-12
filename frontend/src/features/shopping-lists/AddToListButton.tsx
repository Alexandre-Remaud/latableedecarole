import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAuth } from "@/features/auth/hooks"
import AddToListModal from "./AddToListModal"

interface Props {
  recipe: { _id: string; title: string; servings?: number }
}

export default function AddToListButton({ recipe }: Props) {
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
        aria-label="Ajouter à une liste de courses"
        title={
          !user
            ? "Connectez-vous pour utiliser la liste de courses"
            : "Ajouter à une liste de courses"
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
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </button>

      {modalOpen && (
        <AddToListModal recipe={recipe} onClose={() => setModalOpen(false)} />
      )}
    </>
  )
}
