import { useId, useState } from "react"

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
}

const SIZES = {
  sm: 16,
  md: 20,
  lg: 24
}

export default function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md"
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)
  const instanceId = useId()
  const pixelSize = SIZES[size]
  const displayValue = hoverValue || value

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => !readonly && setHoverValue(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = displayValue >= star
        const halfFilled = !filled && displayValue >= star - 0.5
        const gradientId = `half-${instanceId}-${star}`

        return (
          <button
            key={star}
            type="button"
            disabled={readonly || !onChange}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHoverValue(star)}
            className={`${
              readonly || !onChange
                ? "cursor-default"
                : "cursor-pointer hover:scale-110"
            } transition-transform p-0 border-0 bg-transparent`}
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            <svg
              width={pixelSize}
              height={pixelSize}
              viewBox="0 0 24 24"
              fill={
                filled ? "#f59e0b" : halfFilled ? `url(#${gradientId})` : "none"
              }
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {halfFilled && (
                <defs>
                  <linearGradient id={gradientId}>
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}
