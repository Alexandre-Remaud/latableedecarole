import { describe, it, expect, vi, beforeEach } from "vitest"
import { recipeService } from "./api"
import type { Recipe } from "./contract"

const mockRecipe: Recipe = {
  _id: "abc123",
  title: "Tarte aux pommes",
  description: "Une tarte classique",
  ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
  steps: [{ order: 1, instruction: "Éplucher les pommes" }],
  servings: 4,
  prepTime: 30,
  difficulty: "easy",
  category: "dessert"
}

describe("recipeService.updateRecipe", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should call PATCH /recipes/:id with the mapped payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockRecipe), { status: 200 })
    )

    const formData = {
      title: "Tarte aux pommes",
      description: "Une tarte classique",
      category: "dessert" as const,
      servings: 4,
      prepTime: 30,
      difficulty: "easy" as const,
      ingredients: [{ id: "ing-1", name: "Pommes", quantity: 4, unit: "pièces" }],
      steps: [{ id: "step-1", order: 1, instruction: "Éplucher les pommes" }]
    }

    await recipeService.updateRecipe("abc123", formData)

    const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("/recipes/abc123")
    expect(options.method).toBe("PATCH")
    expect(options.headers["Content-Type"]).toBe("application/json")

    const body = JSON.parse(options.body as string)
    expect(body.title).toBe("Tarte aux pommes")
    expect(body.ingredients[0]).not.toHaveProperty("id")
    expect(body.steps[0].order).toBe(1)
  })

  it("should return the updated recipe", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockRecipe), { status: 200 })
    )

    const formData = {
      title: "Tarte aux pommes",
      description: "Une tarte classique",
      category: "dessert" as const,
      servings: 4,
      prepTime: 30,
      difficulty: "easy" as const,
      ingredients: [{ id: "ing-1", name: "Pommes", quantity: 4, unit: "pièces" }],
      steps: [{ id: "step-1", order: 1, instruction: "Éplucher les pommes" }]
    }

    const result = await recipeService.updateRecipe("abc123", formData)

    expect(result).toEqual(mockRecipe)
  })

  it("should strip the id field from ingredients in the payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockRecipe), { status: 200 })
    )

    const formData = {
      title: "Test",
      description: "Test",
      category: "dessert" as const,
      servings: 2,
      prepTime: 10,
      difficulty: "easy" as const,
      ingredients: [{ id: "ing-uuid", name: "Farine", quantity: 200, unit: "g" }],
      steps: [{ id: "step-uuid", order: 1, instruction: "Mélanger" }]
    }

    await recipeService.updateRecipe("abc123", formData)

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(options.body as string)
    expect(body.ingredients[0]).not.toHaveProperty("id")
    expect(body.steps[0]).not.toHaveProperty("id")
  })

  it("should recompute step order from array index", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockRecipe), { status: 200 })
    )

    const formData = {
      title: "Test",
      description: "Test",
      category: "dessert" as const,
      servings: 2,
      prepTime: 10,
      difficulty: "easy" as const,
      ingredients: [{ id: "ing-1", name: "Farine", quantity: 200, unit: "g" }],
      steps: [
        { id: "step-1", order: 99, instruction: "Première étape" },
        { id: "step-2", order: 99, instruction: "Deuxième étape" }
      ]
    }

    await recipeService.updateRecipe("abc123", formData)

    const [, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(options.body as string)
    expect(body.steps[0].order).toBe(1)
    expect(body.steps[1].order).toBe(2)
  })
})
