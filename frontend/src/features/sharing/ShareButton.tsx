import { useShare } from "./useShare"

interface ShareButtonProps {
  recipeTitle: string
  recipeDescription: string
  recipeId: string
}

export default function ShareButton({
  recipeTitle,
  recipeDescription,
  recipeId
}: ShareButtonProps) {
  const url = `${window.location.origin}/recipes/${recipeId}`
  const { share } = useShare(recipeTitle, recipeDescription, url)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        void share()
      }}
      className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-warm-600 cursor-pointer transition-colors"
      aria-label="Partager la recette"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
      </svg>
    </button>
  )
}
