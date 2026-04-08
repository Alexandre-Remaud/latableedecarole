import { describe, it, expect, vi, beforeEach } from "vitest"
import { favoritesApi } from "./api"

vi.mock("@/lib/api-client", () => ({
  apiFetch: vi.fn()
}))

import { apiFetch } from "@/lib/api-client"

describe("favoritesApi", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("addFavorite", () => {
    it("should call apiFetch with POST and correct URL", async () => {
      const mockResponse = { favorited: true, favoritesCount: 1 }
      vi.mocked(apiFetch).mockResolvedValue(mockResponse)

      const result = await favoritesApi.addFavorite("recipe-123")

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/recipes/recipe-123/favorite"),
        expect.objectContaining({
          method: "POST",
          credentials: "include"
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("removeFavorite", () => {
    it("should call apiFetch with DELETE and correct URL", async () => {
      const mockResponse = { favorited: false, favoritesCount: 0 }
      vi.mocked(apiFetch).mockResolvedValue(mockResponse)

      const result = await favoritesApi.removeFavorite("recipe-123")

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/recipes/recipe-123/favorite"),
        expect.objectContaining({
          method: "DELETE",
          credentials: "include"
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe("getMyFavorites", () => {
    it("should call apiFetch with GET and default params", async () => {
      const mockResponse = { data: [], total: 0 }
      vi.mocked(apiFetch).mockResolvedValue(mockResponse)

      const result = await favoritesApi.getMyFavorites()

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/me/favorites?skip=0&limit=20"),
        expect.objectContaining({
          method: "GET",
          credentials: "include"
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it("should pass custom skip and limit", async () => {
      const mockResponse = { data: [], total: 0 }
      vi.mocked(apiFetch).mockResolvedValue(mockResponse)

      await favoritesApi.getMyFavorites(20, 10)

      expect(apiFetch).toHaveBeenCalledWith(
        expect.stringContaining("/users/me/favorites?skip=20&limit=10"),
        expect.objectContaining({
          method: "GET",
          credentials: "include"
        })
      )
    })
  })
})
