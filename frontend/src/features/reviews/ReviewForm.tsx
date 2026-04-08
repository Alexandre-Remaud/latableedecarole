import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import StarRating from "./StarRating"
import { useSubmitReview } from "./hooks"
import type { Review } from "./contract"

const reviewSchema = z.object({
  rating: z.number().min(1, "Veuillez attribuer une note").max(5),
  comment: z.string().max(1000, "1000 caractères maximum").optional()
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormProps {
  recipeId: string
  existingReview?: Review
  onSuccess: () => void
}

export default function ReviewForm({
  recipeId,
  existingReview,
  onSuccess
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating ?? 0)
  const { submitReview, updateReview, isLoading } = useSubmitReview(
    recipeId,
    onSuccess
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: existingReview?.rating ?? 0,
      comment: existingReview?.comment ?? ""
    }
  })

  function handleRatingChange(value: number) {
    setRating(value)
    setValue("rating", value, { shouldValidate: true })
  }

  async function onSubmit(data: ReviewFormData) {
    const payload = {
      rating: data.rating,
      comment: data.comment || undefined
    }

    if (existingReview) {
      await updateReview(existingReview._id, payload)
    } else {
      await submitReview(payload)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white border border-gray-100 rounded-xl p-5"
    >
      <h3 className="font-display text-base font-semibold text-gray-800 mb-3">
        {existingReview ? "Modifier votre avis" : "Laisser un avis"}
      </h3>

      <div className="mb-3">
        <label className="block text-sm text-gray-600 mb-1">
          Votre note
        </label>
        <StarRating value={rating} onChange={handleRatingChange} size="lg" />
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="review-comment"
          className="block text-sm text-gray-600 mb-1"
        >
          Commentaire (optionnel)
        </label>
        <textarea
          id="review-comment"
          {...register("comment")}
          rows={3}
          maxLength={1000}
          placeholder="Partagez votre expérience..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-warm-500 focus:border-transparent resize-none"
        />
        {errors.comment && (
          <p className="text-xs text-red-500 mt-1">{errors.comment.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || rating === 0}
        className="px-5 py-2 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading
          ? "Envoi..."
          : existingReview
            ? "Mettre à jour"
            : "Publier"}
      </button>
    </form>
  )
}
