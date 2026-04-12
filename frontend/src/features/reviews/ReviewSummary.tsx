import StarRating from "./StarRating"

interface ReviewSummaryProps {
  averageRating: number
  ratingsCount: number
  compact?: boolean
}

export default function ReviewSummary({
  averageRating,
  ratingsCount,
  compact = false
}: ReviewSummaryProps) {
  if (ratingsCount === 0 && compact) return null

  return (
    <div className="inline-flex items-center gap-1.5">
      <StarRating value={averageRating} readonly size={compact ? "sm" : "md"} />
      <span className={`text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>
        {ratingsCount === 0
          ? "Aucun avis"
          : `${averageRating.toFixed(1)} (${ratingsCount} avis)`}
      </span>
    </div>
  )
}
