import { DIFFICULTY_LABELS, getCategoryLabel } from "@recipes/constants/labels"
import type { Recipe } from "@recipes/contract"

type Props = {
  recipe: Pick<
    Recipe,
    "category" | "difficulty" | "servings" | "cookTime" | "tags"
  >
  className?: string
  onTagClick?: (tag: string) => void
}

export default function RecipeBadges({
  recipe,
  className = "",
  onTagClick
}: Props) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {recipe.category && (
        <span
          className="text-xs px-2.5 py-1 bg-warm-50 text-warm-700 rounded-full"
          aria-label={`Catégorie : ${getCategoryLabel(recipe.category)}`}
        >
          {getCategoryLabel(recipe.category)}
        </span>
      )}
      {recipe.difficulty && (
        <span
          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
          aria-label={`Difficulté : ${DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}`}
        >
          {DIFFICULTY_LABELS[recipe.difficulty] ?? recipe.difficulty}
        </span>
      )}
      {recipe.servings && (
        <span
          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
          aria-label={`${recipe.servings} portion${recipe.servings > 1 ? "s" : ""}`}
        >
          {recipe.servings} pers.
        </span>
      )}
      {recipe.cookTime != null && recipe.cookTime > 0 && (
        <span
          className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full"
          aria-label={`Temps de préparation : ${recipe.cookTime} minutes`}
        >
          {recipe.cookTime} min
        </span>
      )}
      {recipe.tags?.map((tag) =>
        onTagClick ? (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick(tag)}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            {tag}
          </button>
        ) : (
          <span
            key={tag}
            className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-full"
          >
            {tag}
          </span>
        )
      )}
    </div>
  )
}
