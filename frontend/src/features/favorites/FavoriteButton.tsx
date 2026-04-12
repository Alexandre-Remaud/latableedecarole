import { useAuth } from "@/features/auth/hooks"
import { useFavoriteToggle } from "./hooks"

interface FavoriteButtonProps {
  recipeId: string
  initialFavorited: boolean
  initialCount: number
}

export default function FavoriteButton({
  recipeId,
  initialFavorited,
  initialCount
}: FavoriteButtonProps) {
  const { user } = useAuth()
  const { favorited, count, toggleFavorite, isLoading } = useFavoriteToggle(
    recipeId,
    initialFavorited,
    initialCount
  )

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (user) {
          void toggleFavorite()
        }
      }}
      disabled={!user || isLoading}
      className={`inline-flex items-center gap-1 text-sm transition-colors ${
        user ? "hover:text-red-500 cursor-pointer" : "cursor-default"
      } ${favorited ? "text-red-500" : "text-gray-400"}`}
      aria-label={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
      title={!user ? "Connectez-vous pour ajouter aux favoris" : undefined}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && <span>{count}</span>}
    </button>
  )
}
