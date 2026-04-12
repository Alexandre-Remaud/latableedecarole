import { useState, useEffect, useCallback } from "react"
import toast from "react-hot-toast"
import { reviewsApi } from "./api"
import type { Review } from "./contract"

const LIMIT = 10

export function useRecipeReviews(recipeId: string) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [averageRating, setAverageRating] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [skip, setSkip] = useState(0)

  const fetchReviews = useCallback(
    async (offset = 0, append = false) => {
      try {
        const res = await reviewsApi.getRecipeReviews(recipeId, offset, LIMIT)
        if (append) {
          setReviews((prev) => [...prev, ...res.data])
        } else {
          setReviews(res.data)
        }
        setTotal(res.total)
        setAverageRating(res.averageRating)
        setSkip(offset + LIMIT)
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des avis"
        )
      }
    },
    [recipeId]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await reviewsApi.getRecipeReviews(recipeId, 0, LIMIT)
        if (cancelled) return
        setReviews(res.data)
        setTotal(res.total)
        setAverageRating(res.averageRating)
        setSkip(LIMIT)
      } catch (err) {
        if (cancelled) return
        toast.error(
          err instanceof Error
            ? err.message
            : "Erreur lors du chargement des avis"
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [recipeId])

  async function loadMore() {
    setLoadingMore(true)
    await fetchReviews(skip, true)
    setLoadingMore(false)
  }

  async function refresh() {
    setSkip(0)
    await fetchReviews(0)
  }

  const hasMore = reviews.length < total

  return {
    reviews,
    total,
    averageRating,
    loading,
    loadingMore,
    hasMore,
    loadMore,
    refresh
  }
}

export function useSubmitReview(recipeId: string, onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false)

  async function submitReview(data: { rating: number; comment?: string }) {
    setIsLoading(true)
    try {
      await reviewsApi.createReview(recipeId, data)
      toast.success("Avis publié !")
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la publication"
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string }
  ) {
    setIsLoading(true)
    try {
      await reviewsApi.updateReview(reviewId, data)
      toast.success("Avis mis à jour !")
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la mise à jour"
      )
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteReview(reviewId: string) {
    setIsLoading(true)
    try {
      await reviewsApi.deleteReview(reviewId)
      toast.success("Avis supprimé")
      onSuccess()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { submitReview, updateReview, deleteReview, isLoading }
}
