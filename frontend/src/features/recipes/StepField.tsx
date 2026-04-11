import type { Control, UseFormRegister, FieldErrors } from "react-hook-form"
import type { RecipeFormData } from "@recipes/schema"
import { useWatch } from "react-hook-form"

type StepFieldProps = {
  index: number
  stepNumber: number
  control: Control<RecipeFormData>
  register: UseFormRegister<RecipeFormData>
  errors: FieldErrors<RecipeFormData>
  onDelete: () => void
  canDelete: boolean
}

export default function StepField({
  index,
  stepNumber,
  control,
  register,
  errors,
  onDelete,
  canDelete
}: StepFieldProps) {
  const fieldErrors = errors.steps?.[index]

  const duration = useWatch({ control, name: `steps.${index}.duration` })
  const temperature = useWatch({ control, name: `steps.${index}.temperature` })

  return (
    <div className="relative bg-warm-50/50 border border-warm-100 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="inline-flex items-center justify-center w-7 h-7 bg-warm-600 text-white text-sm font-semibold rounded-full">
          {stepNumber}
        </span>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label={`Supprimer l'étape ${stepNumber}`}
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <textarea
            {...register(`steps.${index}.instruction`)}
            className="input-field resize-none"
            placeholder="Décrivez cette étape..."
            rows={3}
            aria-label={`Instruction de l'étape ${stepNumber}`}
          />
          {fieldErrors?.instruction && (
            <p className="error-message">{fieldErrors.instruction.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label htmlFor={`duration-${index}`} className="label-field">
              Durée
            </label>
            <input
              {...register(`steps.${index}.duration`, {
                setValueAs: (v) => (v === "" ? undefined : Number(v))
              })}
              id={`duration-${index}`}
              className="input-field"
              type="number"
              placeholder="--"
              min="0"
              step="1"
              aria-label={`Durée de l'étape ${stepNumber}`}
            />
            {fieldErrors?.duration && (
              <p className="error-message">{fieldErrors.duration.message}</p>
            )}
          </div>

          <div>
            <label htmlFor={`durationUnit-${index}`} className="label-field">
              Unité
            </label>
            <select
              {...register(`steps.${index}.durationUnit`)}
              id={`durationUnit-${index}`}
              disabled={!duration || duration === 0}
              className="select-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label={`Unité de durée de l'étape ${stepNumber}`}
            >
              <option value="min">min</option>
              <option value="sec">sec</option>
            </select>
          </div>

          <div>
            <label htmlFor={`temperature-${index}`} className="label-field">
              Température
            </label>
            <input
              {...register(`steps.${index}.temperature`, {
                setValueAs: (v) => (v === "" ? undefined : Number(v))
              })}
              id={`temperature-${index}`}
              className="input-field"
              type="number"
              placeholder="--"
              min="0"
              step="1"
              aria-label={`Température de l'étape ${stepNumber}`}
            />
            {fieldErrors?.temperature && (
              <p className="error-message">{fieldErrors.temperature.message}</p>
            )}
          </div>

          <div>
            <label htmlFor={`temperatureUnit-${index}`} className="label-field">
              Unité
            </label>
            <select
              {...register(`steps.${index}.temperatureUnit`)}
              id={`temperatureUnit-${index}`}
              disabled={!temperature || temperature === 0}
              className="select-field disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
              aria-label={`Unité de température de l'étape ${stepNumber}`}
            >
              <option value="C">°C</option>
              <option value="F">°F</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor={`note-${index}`} className="label-field">
            Note (optionnel)
          </label>
          <input
            {...register(`steps.${index}.note`)}
            id={`note-${index}`}
            className="input-field"
            type="text"
            placeholder="Astuce ou conseil..."
            aria-label={`Note pour l'étape ${stepNumber}`}
          />
          {fieldErrors?.note && (
            <p className="error-message">{fieldErrors.note.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
