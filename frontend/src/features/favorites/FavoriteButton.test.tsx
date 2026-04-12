import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import FavoriteButton from "./FavoriteButton"

const mockToggleFavorite = vi.fn()

vi.mock("@/features/auth/hooks", () => ({
  useAuth: vi.fn()
}))

vi.mock("./hooks", () => ({
  useFavoriteToggle: vi.fn()
}))

import { useAuth } from "@/features/auth/hooks"
import { useFavoriteToggle } from "./hooks"

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockToggleFavorite.mockReset()
    vi.mocked(useFavoriteToggle).mockReturnValue({
      favorited: false,
      count: 0,
      toggleFavorite: mockToggleFavorite,
      isLoading: false
    })
  })

  it("should render with correct aria-label when not favorited", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    expect(screen.getByLabelText("Ajouter aux favoris")).toBeInTheDocument()
  })

  it("should render with correct aria-label when favorited", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)
    vi.mocked(useFavoriteToggle).mockReturnValue({
      favorited: true,
      count: 3,
      toggleFavorite: mockToggleFavorite,
      isLoading: false
    })

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={true}
        initialCount={3}
      />
    )

    expect(screen.getByLabelText("Retirer des favoris")).toBeInTheDocument()
  })

  it("should display the count when greater than 0", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)
    vi.mocked(useFavoriteToggle).mockReturnValue({
      favorited: true,
      count: 5,
      toggleFavorite: mockToggleFavorite,
      isLoading: false
    })

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={true}
        initialCount={5}
      />
    )

    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("should not display count when it is 0", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    expect(screen.queryByText("0")).not.toBeInTheDocument()
  })

  it("should call toggleFavorite on click for authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(mockToggleFavorite).toHaveBeenCalledOnce()
  })

  it("should not call toggleFavorite for non-authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(mockToggleFavorite).not.toHaveBeenCalled()
  })

  it("should be disabled for non-authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should be disabled when loading", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "1",
        email: "t@t.com",
        name: "Test",
        role: "user",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)
    vi.mocked(useFavoriteToggle).mockReturnValue({
      favorited: false,
      count: 0,
      toggleFavorite: mockToggleFavorite,
      isLoading: true
    })

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("should show tooltip for non-authenticated users", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(
      <FavoriteButton
        recipeId="recipe-1"
        initialFavorited={false}
        initialCount={0}
      />
    )

    expect(screen.getByRole("button")).toHaveAttribute(
      "title",
      "Connectez-vous pour ajouter aux favoris"
    )
  })
})
