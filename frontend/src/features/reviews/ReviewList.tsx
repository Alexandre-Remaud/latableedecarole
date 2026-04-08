import { useState } from "react"
import { useAuth } from "@/features/auth/hooks"
import { useSubmitReview } from "./hooks"
import StarRating from "./StarRating"
import ReviewForm from "./ReviewForm"
import ConfirmDialog from "@/components/ConfirmDialog"
import type { Review } from "./contract"

interface ReviewListProps {
  recipeId: string
  reviews: Review[]
  total: number
  hasMore: boolean
  loadingMore: boolean
  loadMore: () => void
  refresh: () => void
}

export default function ReviewList({
  recipeId,
  reviews,
  total,
  hasMore,
  loadingMore,
  loadMore,
  refresh
}: ReviewListProps) {
  const { user } = useAuth()
  const { deleteReview } = useSubmitReview(recipeId, refresh)
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  function handleEditSuccess() {
    setEditingReview(null)
    refresh()
  }

  async function handleDelete() {
    if (!deletingId) return
    await deleteReview(deletingId)
    setDeletingId(null)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    })
  }

  return (
    <div>
      <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
        Avis ({total})
      </h3>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500">
          Aucun avis pour le moment. Soyez le premier !
        </p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => {
            if (editingReview && editingReview._id === review._id) {
              return (
                <li key={review._id}>
                  <ReviewForm
                    recipeId={recipeId}
                    existingReview={review}
                    onSuccess={handleEditSuccess}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="mt-2 text-xs text-gray-400 hover:text-gray-600"
                  >
                    Annuler
                  </button>
                </li>
              )
            }

            const isOwner = user && user._id === review.userId
            const isAdmin = user?.role === "admin"

            return (
              <li
                key={review._id}
                className="bg-white border border-gray-100 rounded-xl p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {review.user?.avatarUrl ? (
                      <img
                        src={review.user.avatarUrl}
                        alt={review.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-600 text-sm font-medium">
                        {review.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {review.user?.name ?? "Utilisateur"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StarRating value={review.rating} readonly size="sm" />
                    {(isOwner || isAdmin) && (
                      <div className="flex items-center gap-1 ml-2">
                        {isOwner && (
                          <button
                            type="button"
                            onClick={() => setEditingReview(review)}
                            className="text-xs text-gray-400 hover:text-warm-600 transition-colors"
                          >
                            Modifier
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeletingId(review._id)}
                          className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {review.comment && (
                  <p className="text-sm text-gray-600 mt-2">
                    {review.comment}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-warm-700 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingMore ? "Chargement..." : "Voir plus d'avis"}
          </button>
        </div>
      )}

      {deletingId && (
        <ConfirmDialog
          title="Supprimer l'avis"
          message="Voulez-vous vraiment supprimer cet avis ?"
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}
