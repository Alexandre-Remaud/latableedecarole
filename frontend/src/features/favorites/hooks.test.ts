import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useFavoriteToggle } from "./hooks"

vi.mock("react-hot-toast", () => ({
  default: {
    error: vi.fn()
  }
}))

vi.mock("./api", () => ({
  favoritesApi: {
    addFavorite: vi.fn(),
    removeFavorite: vi.fn()
  }
}))

import { favoritesApi } from "./api"
import toast from "react-hot-toast"

describe("useFavoriteToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("should return initial state", () => {
    const { result } = renderHook(() => useFavoriteToggle("recipe-1", false, 5))

    expect(result.current.favorited).toBe(false)
    expect(result.current.count).toBe(5)
    expect(result.current.isLoading).toBe(false)
  })

  it("should call addFavorite when not favorited", async () => {
    vi.mocked(favoritesApi.addFavorite).mockResolvedValue({
      favorited: true,
      favoritesCount: 6
    })

    const { result } = renderHook(() => useFavoriteToggle("recipe-1", false, 5))

    await act(async () => {
      await result.current.toggleFavorite()
    })

    expect(favoritesApi.addFavorite).toHaveBeenCalledWith("recipe-1")
    expect(result.current.favorited).toBe(true)
    expect(result.current.count).toBe(6)
  })

  it("should call removeFavorite when favorited", async () => {
    vi.mocked(favoritesApi.removeFavorite).mockResolvedValue({
      favorited: false,
      favoritesCount: 4
    })

    const { result } = renderHook(() => useFavoriteToggle("recipe-1", true, 5))

    await act(async () => {
      await result.current.toggleFavorite()
    })

    expect(favoritesApi.removeFavorite).toHaveBeenCalledWith("recipe-1")
    expect(result.current.favorited).toBe(false)
    expect(result.current.count).toBe(4)
  })

  it("should rollback on error and show toast", async () => {
    vi.mocked(favoritesApi.addFavorite).mockRejectedValue(
      new Error("Network error")
    )

    const { result } = renderHook(() => useFavoriteToggle("recipe-1", false, 5))

    await act(async () => {
      await result.current.toggleFavorite()
    })

    expect(result.current.favorited).toBe(false)
    expect(result.current.count).toBe(5)
    expect(toast.error).toHaveBeenCalledWith(
      "Erreur lors de la mise à jour du favori"
    )
  })

  it("should set isLoading to false after successful toggle", async () => {
    vi.mocked(favoritesApi.addFavorite).mockResolvedValue({
      favorited: true,
      favoritesCount: 6
    })

    const { result } = renderHook(() => useFavoriteToggle("recipe-1", false, 5))

    await act(async () => {
      await result.current.toggleFavorite()
    })

    expect(result.current.isLoading).toBe(false)
  })
})
