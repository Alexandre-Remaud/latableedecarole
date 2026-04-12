import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import ReviewList from "./ReviewList"

vi.mock("@/features/auth/hooks", () => ({
  useAuth: vi.fn()
}))

vi.mock("./hooks", () => ({
  useSubmitReview: vi.fn()
}))

vi.mock("./ReviewForm", () => ({
  default: () => <div data-testid="review-form">ReviewForm</div>
}))

vi.mock("@/components/ConfirmDialog", () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="confirm-dialog">{title}</div>
  )
}))

import { useAuth } from "@/features/auth/hooks"
import { useSubmitReview } from "./hooks"

const mockReviews = [
  {
    _id: "review-1",
    userId: "user-1",
    recipeId: "recipe-1",
    rating: 4,
    comment: "Excellent recipe!",
    createdAt: "2026-03-15T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
    user: {
      _id: "user-1",
      name: "Alice",
      avatarUrl: "https://example.com/alice.jpg"
    }
  },
  {
    _id: "review-2",
    userId: "user-2",
    recipeId: "recipe-1",
    rating: 5,
    comment: undefined,
    createdAt: "2026-03-16T10:00:00Z",
    updatedAt: "2026-03-16T10:00:00Z",
    user: {
      _id: "user-2",
      name: "Bob"
    }
  }
]

const defaultProps = {
  recipeId: "recipe-1",
  reviews: mockReviews,
  total: 2,
  hasMore: false,
  loadingMore: false,
  loadMore: vi.fn(),
  refresh: vi.fn()
}

describe("ReviewList", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)
    vi.mocked(useSubmitReview).mockReturnValue({
      submitReview: vi.fn(),
      updateReview: vi.fn(),
      deleteReview: vi.fn(),
      isLoading: false
    })
  })

  it("should show empty state when no reviews", () => {
    render(<ReviewList {...defaultProps} reviews={[]} total={0} />)

    expect(
      screen.getByText("Aucun avis pour le moment. Soyez le premier !")
    ).toBeInTheDocument()
  })

  it("should render reviews with user info", () => {
    render(<ReviewList {...defaultProps} />)

    expect(screen.getByText("Avis (2)")).toBeInTheDocument()
    expect(screen.getByText("Alice")).toBeInTheDocument()
    expect(screen.getByText("Bob")).toBeInTheDocument()
    expect(screen.getByText("Excellent recipe!")).toBeInTheDocument()
  })

  it("should display the total count in the header", () => {
    render(<ReviewList {...defaultProps} />)

    expect(screen.getByText("Avis (2)")).toBeInTheDocument()
  })

  it("should show 'Voir plus' button when hasMore is true", () => {
    render(<ReviewList {...defaultProps} total={20} hasMore={true} />)

    expect(screen.getByText("Voir plus d'avis")).toBeInTheDocument()
  })

  it("should not show 'Voir plus' button when hasMore is false", () => {
    render(<ReviewList {...defaultProps} />)

    expect(screen.queryByText("Voir plus d'avis")).not.toBeInTheDocument()
  })

  it("should show edit and delete buttons for review owner", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "user-1",
        email: "alice@test.com",
        name: "Alice",
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

    render(<ReviewList {...defaultProps} />)

    expect(screen.getByText("Modifier")).toBeInTheDocument()
    expect(screen.getAllByText("Supprimer").length).toBeGreaterThanOrEqual(1)
  })

  it("should show only delete button for admin on others reviews", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        _id: "admin-1",
        email: "admin@test.com",
        name: "Admin",
        role: "admin",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z"
      },
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      refreshUser: vi.fn()
    } as ReturnType<typeof useAuth>)

    render(<ReviewList {...defaultProps} />)

    expect(screen.getAllByText("Supprimer")).toHaveLength(2)
    expect(screen.queryByText("Modifier")).not.toBeInTheDocument()
  })

  it("should show avatar image when user has avatarUrl", () => {
    render(<ReviewList {...defaultProps} />)

    const img = screen.getByAltText("Alice")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("src", "https://example.com/alice.jpg")
  })

  it("should show initial letter when user has no avatarUrl", () => {
    render(<ReviewList {...defaultProps} />)

    expect(screen.getByText("B")).toBeInTheDocument()
  })
})
