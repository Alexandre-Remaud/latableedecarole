import { describe, it, expect } from "vitest"
import { recipeToFormData } from "./recipeToFormData"
import { recipeFormSchema } from "./schema"
import type { Recipe } from "./contract"

const baseRecipe: Recipe = {
  _id: "abc123",
  title: "Tarte aux pommes",
  description: "Une tarte classique",
  ingredients: [
    { name: "Pommes", quantity: 4, unit: "pièces" },
    { name: "Farine", quantity: 200, unit: "g" }
  ],
  steps: [
    { order: 1, instruction: "Éplucher les pommes" },
    { order: 2, instruction: "Mélanger la farine" }
  ],
  servings: 4,
  prepTime: 30,
  difficulty: "easy",
  category: "dessert"
}

describe("recipeToFormData", () => {
  it("should map title and description", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.title).toBe("Tarte aux pommes")
    expect(result.description).toBe("Une tarte classique")
  })

  it("should map servings, prepTime, difficulty and category", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.servings).toBe(4)
    expect(result.prepTime).toBe(30)
    expect(result.difficulty).toBe("easy")
    expect(result.category).toBe("dessert")
  })

  it("should apply default values when optional fields are absent", () => {
    const recipe: Recipe = {
      ...baseRecipe,
      servings: undefined,
      prepTime: undefined,
      difficulty: undefined,
      category: undefined
    }

    const result = recipeToFormData(recipe)

    expect(result.servings).toBe(1)
    expect(result.prepTime).toBe(0)
    expect(result.difficulty).toBe("easy")
    expect(result.category).toBe("main_course")
  })

  it("should map ingredients with a generated id", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.ingredients).toHaveLength(2)
    expect(result.ingredients[0].name).toBe("Pommes")
    expect(result.ingredients[0].quantity).toBe(4)
    expect(result.ingredients[0].unit).toBe("pièces")
    expect(result.ingredients[0].id).toBeDefined()
    expect(typeof result.ingredients[0].id).toBe("string")
  })

  it("should generate a unique id for each ingredient", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.ingredients[0].id).not.toBe(result.ingredients[1].id)
  })

  it("should map steps preserving order and instruction", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.steps).toHaveLength(2)
    expect(result.steps[0].order).toBe(1)
    expect(result.steps[0].instruction).toBe("Éplucher les pommes")
    expect(result.steps[1].order).toBe(2)
  })

  it("should generate a unique id for each step", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.steps[0].id).toBeDefined()
    expect(result.steps[0].id).not.toBe(result.steps[1].id)
  })

  it("should include optional step fields when present", () => {
    const recipe: Recipe = {
      ...baseRecipe,
      steps: [
        {
          order: 1,
          instruction: "Cuire au four",
          duration: 45,
          durationUnit: "min",
          temperature: 180,
          temperatureUnit: "C",
          note: "Surveiller la cuisson"
        }
      ]
    }

    const result = recipeToFormData(recipe)

    expect(result.steps[0].duration).toBe(45)
    expect(result.steps[0].durationUnit).toBe("min")
    expect(result.steps[0].temperature).toBe(180)
    expect(result.steps[0].temperatureUnit).toBe("C")
    expect(result.steps[0].note).toBe("Surveiller la cuisson")
  })

  it("should exclude optional step fields when absent", () => {
    const result = recipeToFormData(baseRecipe)

    expect(result.steps[0]).not.toHaveProperty("duration")
    expect(result.steps[0]).not.toHaveProperty("durationUnit")
    expect(result.steps[0]).not.toHaveProperty("temperature")
    expect(result.steps[0]).not.toHaveProperty("temperatureUnit")
    expect(result.steps[0]).not.toHaveProperty("note")
  })

  it("should produce a schema-valid result", () => {
    const result = recipeToFormData(baseRecipe)
    const parsed = recipeFormSchema.safeParse(result)

    expect(parsed.success).toBe(true)
  })
})
