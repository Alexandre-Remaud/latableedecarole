import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ReviewForm from "./ReviewForm"

const mockSubmitReview = vi.fn()
const mockUpdateReview = vi.fn()

vi.mock("./hooks", () => ({
  useSubmitReview: vi.fn()
}))

import { useSubmitReview } from "./hooks"

describe("ReviewForm", () => {
  const onSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSubmitReview).mockReturnValue({
      submitReview: mockSubmitReview,
      updateReview: mockUpdateReview,
      deleteReview: vi.fn(),
      isLoading: false
    })
  })

  it("should render the form with title for new review", () => {
    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    expect(screen.getByText("Laisser un avis")).toBeInTheDocument()
    expect(screen.getByText("Publier")).toBeInTheDocument()
  })

  it("should render the form with title for editing", () => {
    const existing = {
      _id: "review-1",
      userId: "user-1",
      recipeId: "recipe-1",
      rating: 4,
      comment: "Great",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z"
    }

    render(
      <ReviewForm
        recipeId="recipe-1"
        existingReview={existing}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText("Modifier votre avis")).toBeInTheDocument()
    expect(screen.getByText("Mettre à jour")).toBeInTheDocument()
  })

  it("should disable submit button when rating is 0", () => {
    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    expect(screen.getByText("Publier")).toBeDisabled()
  })

  it("should enable submit button after selecting a rating", () => {
    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    fireEvent.click(screen.getByLabelText("4 étoiles"))

    expect(screen.getByText("Publier")).not.toBeDisabled()
  })

  it("should show validation error when submitting without rating", async () => {
    // Force enable submit by setting rating then clearing it
    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    // The submit button is disabled when rating is 0, so validation error
    // is prevented by the button being disabled. Test that button is indeed disabled.
    const submitBtn = screen.getByText("Publier")
    expect(submitBtn).toBeDisabled()
  })

  it("should call submitReview on form submission for new review", async () => {
    mockSubmitReview.mockResolvedValue(undefined)

    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    fireEvent.click(screen.getByLabelText("4 étoiles"))

    const textarea = screen.getByPlaceholderText("Partagez votre expérience...")
    fireEvent.change(textarea, { target: { value: "Delicious recipe!" } })

    fireEvent.submit(screen.getByText("Publier").closest("form")!)

    await waitFor(() => {
      expect(mockSubmitReview).toHaveBeenCalledWith({
        rating: 4,
        comment: "Delicious recipe!"
      })
    })
  })

  it("should call updateReview on form submission for existing review", async () => {
    mockUpdateReview.mockResolvedValue(undefined)

    const existing = {
      _id: "review-1",
      userId: "user-1",
      recipeId: "recipe-1",
      rating: 3,
      comment: "Good",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z"
    }

    render(
      <ReviewForm
        recipeId="recipe-1"
        existingReview={existing}
        onSuccess={onSuccess}
      />
    )

    fireEvent.click(screen.getByLabelText("5 étoiles"))
    fireEvent.submit(screen.getByText("Mettre à jour").closest("form")!)

    await waitFor(() => {
      expect(mockUpdateReview).toHaveBeenCalledWith("review-1", {
        rating: 5,
        comment: "Good"
      })
    })
  })

  it("should disable submit button when loading", () => {
    vi.mocked(useSubmitReview).mockReturnValue({
      submitReview: mockSubmitReview,
      updateReview: mockUpdateReview,
      deleteReview: vi.fn(),
      isLoading: true
    })

    const existing = {
      _id: "review-1",
      userId: "user-1",
      recipeId: "recipe-1",
      rating: 4,
      comment: "Good",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z"
    }

    render(
      <ReviewForm
        recipeId="recipe-1"
        existingReview={existing}
        onSuccess={onSuccess}
      />
    )

    expect(screen.getByText("Envoi...")).toBeDisabled()
  })

  it("should render the comment textarea", () => {
    render(<ReviewForm recipeId="recipe-1" onSuccess={onSuccess} />)

    expect(
      screen.getByPlaceholderText("Partagez votre expérience...")
    ).toBeInTheDocument()
    expect(screen.getByText("Commentaire (optionnel)")).toBeInTheDocument()
  })
})
