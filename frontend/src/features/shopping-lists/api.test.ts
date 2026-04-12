import { describe, it, expect, vi, beforeEach } from "vitest"
import { shoppingListsApi } from "./api"

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn()
}))

import { apiFetch } from "@/lib/api-client"

const mockApiFetch = vi.mocked(apiFetch)

const mockList = {
  _id: "list1",
  userId: "user1",
  name: "Ma liste",
  items: [],
  recipeIds: [],
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01"
}

describe("shoppingListsApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("create should POST to /shopping-lists", async () => {
    mockApiFetch.mockResolvedValue(mockList)
    const payload = { name: "Ma liste", recipeIds: ["r1"] }
    await shoppingListsApi.create(payload)
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("getAll should GET /shopping-lists", async () => {
    mockApiFetch.mockResolvedValue({ data: [mockList], total: 1 })
    await shoppingListsApi.getAll()
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists"),
      expect.objectContaining({ method: "GET" })
    )
  })

  it("getOne should GET /shopping-lists/:id", async () => {
    mockApiFetch.mockResolvedValue(mockList)
    await shoppingListsApi.getOne("list1")
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists/list1"),
      expect.objectContaining({ method: "GET" })
    )
  })

  it("addRecipe should POST to /shopping-lists/:id/recipes", async () => {
    mockApiFetch.mockResolvedValue(mockList)
    await shoppingListsApi.addRecipe("list1", { recipeId: "r1" })
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists/list1/recipes"),
      expect.objectContaining({ method: "POST" })
    )
  })

  it("toggleItem should PATCH /shopping-lists/:id/items/:itemId", async () => {
    mockApiFetch.mockResolvedValue(mockList)
    await shoppingListsApi.toggleItem("list1", "item1", true)
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists/list1/items/item1"),
      expect.objectContaining({ method: "PATCH" })
    )
  })

  it("remove should DELETE /shopping-lists/:id", async () => {
    mockApiFetch.mockResolvedValue({ message: "Liste supprimée" })
    await shoppingListsApi.remove("list1")
    expect(mockApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/shopping-lists/list1"),
      expect.objectContaining({ method: "DELETE" })
    )
  })
})
