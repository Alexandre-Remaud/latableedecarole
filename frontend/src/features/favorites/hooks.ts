import { useState, useCallback } from "react"
import toast from "react-hot-toast"
import { favoritesApi } from "./api"

export function useFavoriteToggle(
  recipeId: string,
  initialFavorited: boolean,
  initialCount: number
) {
  const [favorited, setFavorited] = useState(initialFavorited)
  const [count, setCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  const toggleFavorite = useCallback(async () => {
    if (isLoading) return

    const previousFavorited = favorited
    const previousCount = count

    setFavorited(!favorited)
    setCount(favorited ? count - 1 : count + 1)
    setIsLoading(true)

    try {
      const result = favorited
        ? await favoritesApi.removeFavorite(recipeId)
        : await favoritesApi.addFavorite(recipeId)

      setFavorited(result.favorited)
      setCount(result.favoritesCount)
    } catch {
      setFavorited(previousFavorited)
      setCount(previousCount)
      toast.error("Erreur lors de la mise à jour du favori")
    } finally {
      setIsLoading(false)
    }
  }, [recipeId, favorited, count, isLoading])

  return { favorited, count, toggleFavorite, isLoading }
}
