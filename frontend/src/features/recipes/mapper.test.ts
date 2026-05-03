import { describe, it, expect } from "vitest"
import toCreateRecipePayload from "./mapper"
import type { RecipeFormData } from "./schema"

const baseFormData: RecipeFormData = {
  title: "  Tarte aux pommes  ",
  description: "  Une tarte classique  ",
  category: "dessert",
  servings: 4,
  prepTime: 30,
  difficulty: "easy",
  tags: [],
  ingredients: [
    { id: "ing-1", name: "  Pommes  ", quantity: 4, unit: "pièces" },
    { id: "ing-2", name: "Pâte brisée", quantity: 1, unit: "pcs" }
  ],
  steps: [
    { id: "step-1", order: 99, instruction: "  Éplucher les pommes  " },
    { id: "step-2", order: 99, instruction: "  Cuire au four  " }
  ]
}

describe("toCreateRecipePayload", () => {
  it("should trim title and description", () => {
    const result = toCreateRecipePayload(baseFormData)

    expect(result.title).toBe("Tarte aux pommes")
    expect(result.description).toBe("Une tarte classique")
  })

  it("should map ingredients without the id field", () => {
    const result = toCreateRecipePayload(baseFormData)

    expect(result.ingredients).toEqual([
      { name: "Pommes", quantity: 4, unit: "pièces" },
      { name: "Pâte brisée", quantity: 1, unit: "pcs" }
    ])
    expect(result.ingredients[0]).not.toHaveProperty("id")
  })

  it("should set step order to index + 1", () => {
    const result = toCreateRecipePayload(baseFormData)

    expect(result.steps[0].order).toBe(1)
    expect(result.steps[1].order).toBe(2)
  })

  it("should include optional step fields when present", () => {
    const data: RecipeFormData = {
      ...baseFormData,
      steps: [
        {
          id: "step-1",
          order: 1,
          instruction: "Cuire",
          duration: 30,
          durationUnit: "min",
          temperature: 180,
          temperatureUnit: "C",
          note: "  Surveiller la cuisson  "
        }
      ]
    }

    const result = toCreateRecipePayload(data)

    expect(result.steps[0].duration).toBe(30)
    expect(result.steps[0].durationUnit).toBe("min")
    expect(result.steps[0].temperature).toBe(180)
    expect(result.steps[0].temperatureUnit).toBe("C")
    expect(result.steps[0].note).toBe("Surveiller la cuisson")
  })

  it("should exclude optional step fields when undefined", () => {
    const result = toCreateRecipePayload(baseFormData)

    expect(result.steps[0]).not.toHaveProperty("duration")
    expect(result.steps[0]).not.toHaveProperty("durationUnit")
    expect(result.steps[0]).not.toHaveProperty("temperature")
    expect(result.steps[0]).not.toHaveProperty("temperatureUnit")
    expect(result.steps[0]).not.toHaveProperty("note")
  })
})
