import { createFileRoute } from "@tanstack/react-router"
import Recipes from "@recipes/Recipes"

type RecipesSearch = {
  category?: string
  search?: string
  tags?: string
}

export const Route = createFileRoute("/recipes/")({
  validateSearch: (search: Record<string, unknown>): RecipesSearch => ({
    category: typeof search.category === "string" ? search.category : undefined,
    search: typeof search.search === "string" ? search.search : undefined,
    tags: typeof search.tags === "string" ? search.tags : undefined
  }),
  component: Recipes
})
