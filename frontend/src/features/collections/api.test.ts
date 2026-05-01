import { describe, it, expect, vi, beforeEach } from "vitest"
import { collectionsApi } from "./api"

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn()
}))

import { apiFetch } from "@/lib/api-client"

const mockFetch = vi.mocked(apiFetch)

const mockCollection = {
  _id: "c1",
  userId: "u1",
  name: "Ma collection",
  isPublic: false,
  recipeIds: [],
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
}

describe("collectionsApi", () => {
  beforeEach(() => vi.clearAllMocks())

  it("create should POST to /collections", async () => {
    mockFetch.mockResolvedValue(mockCollection)
    await collectionsApi.create({ name: "Ma collection" })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("getMine should GET /collections/me", async () => {
    mockFetch.mockResolvedValue({ data: [mockCollection], total: 1 })
    await collectionsApi.getMine()
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/me"),
      expect.objectContaining({ method: "GET" })
    )
  })

  it("getOne should GET /collections/:id", async () => {
    mockFetch.mockResolvedValue({ ...mockCollection, recipes: [] })
    await collectionsApi.getOne("c1")
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/c1"),
      expect.objectContaining({ method: "GET" })
    )
  })

  it("update should PATCH /collections/:id", async () => {
    mockFetch.mockResolvedValue(mockCollection)
    await collectionsApi.update("c1", { name: "Nouveau" })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/c1"),
      expect.objectContaining({ method: "PATCH" })
    )
  })

  it("remove should DELETE /collections/:id", async () => {
    mockFetch.mockResolvedValue({ deleted: true })
    await collectionsApi.remove("c1")
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/c1"),
      expect.objectContaining({ method: "DELETE" })
    )
  })

  it("addRecipe should POST to /collections/:id/recipes", async () => {
    mockFetch.mockResolvedValue({ ...mockCollection, recipes: [] })
    await collectionsApi.addRecipe("c1", "r1")
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/c1/recipes"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("removeRecipe should DELETE /collections/:id/recipes/:recipeId", async () => {
    mockFetch.mockResolvedValue({ ...mockCollection, recipes: [] })
    await collectionsApi.removeRecipe("c1", "r1")
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/collections/c1/recipes/r1"),
      expect.objectContaining({ method: "DELETE" })
    )
  })
})
