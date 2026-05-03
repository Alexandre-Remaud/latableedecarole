import { useController, Controller } from "react-hook-form"
import IngredientField from "./IngredientField"
import StepField from "./StepField"
import { CATEGORIES } from "@recipes/constants/categories"
import { useRecipeForm } from "@recipes/hooks/useForm"
import { ImageUpload } from "@/features/upload"
import type { RecipeFormData } from "@recipes/schema"
import TagInput from "@/features/tags/TagInput"
import { useTags } from "@/features/tags/hooks"

interface FormProps {
  recipeId?: string
}

export default function Form({ recipeId }: FormProps) {
  const {
    form,
    ingredients,
    steps,
    onSubmit,
    isLoading,
    isEditMode,
    addIngredient,
    addStep
  } = useRecipeForm(recipeId)
  const {
    register,
    control,
    formState: { errors, isSubmitting }
  } = form

  const imageField = useController<RecipeFormData, "image">({
    control,
    name: "image"
  })

  const { data: allTags = [] } = useTags()
  const tagSuggestions = allTags.map((t) => t.name)

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto text-center py-12 text-gray-500">
        Chargement de la recette...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-bold text-gray-800">
          {isEditMode ? "Modifier la recette" : "Nouvelle recette"}
        </h2>
        <p className="text-gray-500 mt-1">
          {isEditMode
            ? "Modifiez les informations ci-dessous pour mettre à jour votre recette."
            : "Remplissez les informations ci-dessous pour ajouter votre recette."}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-10">
        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Informations générales
          </h3>

          <div className="space-y-5">
            <div>
              <label className="label-field" htmlFor="title">
                Nom de la recette
              </label>
              <input
                {...register("title")}
                className="input-field"
                type="text"
                id="title"
                placeholder="Ex : Tarte aux pommes"
              />
              {errors.title && (
                <p className="error-message">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="label-field" htmlFor="description">
                Description
              </label>
              <textarea
                {...register("description")}
                className="input-field resize-none"
                id="description"
                rows={3}
                placeholder="Décrivez brièvement votre recette..."
              />
              {errors.description && (
                <p className="error-message">{errors.description.message}</p>
              )}
            </div>

            <div>
              <span className="label-field">Photo</span>
              <ImageUpload
                value={imageField.field.value}
                onChange={imageField.field.onChange}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="label-field" htmlFor="servings">
                  Personnes
                </label>
                <input
                  {...register("servings", { valueAsNumber: true })}
                  id="servings"
                  className="input-field"
                  type="number"
                  min="1"
                />
                {errors.servings && (
                  <p className="error-message">{errors.servings.message}</p>
                )}
              </div>

              <div>
                <label className="label-field" htmlFor="prepTime">
                  Préparation (min)
                </label>
                <input
                  {...register("prepTime", { valueAsNumber: true })}
                  id="prepTime"
                  className="input-field"
                  type="number"
                  min="0"
                />
                {errors.prepTime && (
                  <p className="error-message">{errors.prepTime.message}</p>
                )}
              </div>

              <div>
                <label className="label-field" htmlFor="difficulty">
                  Difficulté
                </label>
                <select
                  {...register("difficulty")}
                  id="difficulty"
                  className="select-field"
                >
                  <option value="easy">Facile</option>
                  <option value="medium">Moyen</option>
                  <option value="hard">Difficile</option>
                </select>
                {errors.difficulty && (
                  <p className="error-message">{errors.difficulty.message}</p>
                )}
              </div>

              <div>
                <label className="label-field" htmlFor="category">
                  Catégorie
                </label>
                <select
                  {...register("category")}
                  id="category"
                  className="select-field"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="error-message">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="label-field">Tags</label>
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={tagSuggestions}
                  />
                )}
              />
              <p className="text-xs text-gray-400 mt-1">
                Maximum 10 tags, 2–30 caractères chacun. Entrée ou virgule pour
                valider.
              </p>
              {errors.tags && (
                <p className="error-message">{errors.tags.message}</p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Ingrédients
          </h3>

          {errors.ingredients && (
            <p className="error-message mb-4">{errors.ingredients.message}</p>
          )}

          <div className="space-y-3">
            {ingredients.fields.map((field, index) => (
              <IngredientField
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                onDelete={() => ingredients.remove(index)}
                canDelete={ingredients.fields.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addIngredient}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-warm-700 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter un ingrédient
          </button>
        </section>

        <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Étapes de préparation
          </h3>

          {errors.steps && (
            <p className="error-message mb-4">{errors.steps.message}</p>
          )}

          <div className="space-y-4">
            {steps.fields.map((field, index) => (
              <StepField
                key={field.id}
                index={index}
                stepNumber={index + 1}
                control={control}
                register={register}
                errors={errors}
                onDelete={() => steps.remove(index)}
                canDelete={steps.fields.length > 1}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addStep}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-warm-700 bg-warm-50 border border-warm-200 rounded-xl hover:bg-warm-100 transition-colors"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            Ajouter une étape
          </button>
        </section>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-warm-600 text-white rounded-2xl hover:bg-warm-700 active:bg-warm-800 transition-colors font-semibold text-lg shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? "Enregistrement..."
            : isEditMode
              ? "Enregistrer les modifications"
              : "Enregistrer la recette"}
        </button>
      </form>
    </div>
  )
}
