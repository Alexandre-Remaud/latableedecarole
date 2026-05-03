import { describe, it, expect, vi, beforeEach } from "vitest"
import { recipeService } from "./api"
import type { Recipe, PaginatedRecipes } from "./contract"

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

const mockPaginated: PaginatedRecipes = {
  data: [mockRecipe],
  total: 1
}

describe("recipeService.getRecipes", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("should call GET /recipes with default skip=0 and limit=20", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    const result = await recipeService.getRecipes()

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("skip=0")
    expect(url).toContain("limit=20")
    expect(result).toEqual(mockPaginated)
  })

  it("should include category in query params when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes("dessert")

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("category=dessert")
    expect(url).toContain("skip=0")
  })

  it("should pass skip when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes(undefined, undefined, 20)

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("skip=20")
    expect(url).not.toContain("category=")
  })

  it("should combine category and skip", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes("dessert", undefined, 40)

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("category=dessert")
    expect(url).toContain("skip=40")
    expect(url).toContain("limit=20")
  })

  it("should use custom limit when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes(undefined, undefined, 0, 10)

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("limit=10")
  })

  it("should include tags in query params when provided", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes(undefined, undefined, 0, 20, [
      "végétarien",
      "rapide"
    ])

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).toContain("tags=")
    expect(url).toContain("végétarien")
  })

  it("should not include tags param when tags array is empty", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(mockPaginated), { status: 200 })
    )

    await recipeService.getRecipes(undefined, undefined, 0, 20, [])

    const [url] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(url).not.toContain("tags=")
  })
})

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
      ingredients: [
        { id: "ing-1", name: "Pommes", quantity: 4, unit: "pièces" }
      ],
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
      ingredients: [
        { id: "ing-1", name: "Pommes", quantity: 4, unit: "pièces" }
      ],
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
      ingredients: [
        { id: "ing-uuid", name: "Farine", quantity: 200, unit: "g" }
      ],
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
