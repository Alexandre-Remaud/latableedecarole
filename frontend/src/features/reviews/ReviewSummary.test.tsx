import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import ReviewSummary from "./ReviewSummary"

describe("ReviewSummary", () => {
  it("should display average rating and count", () => {
    render(<ReviewSummary averageRating={4.2} ratingsCount={15} />)

    expect(screen.getByText("4.2 (15 avis)")).toBeInTheDocument()
  })

  it("should display 'Aucun avis' when count is 0", () => {
    render(<ReviewSummary averageRating={0} ratingsCount={0} />)

    expect(screen.getByText("Aucun avis")).toBeInTheDocument()
  })

  it("should render nothing when compact and count is 0", () => {
    const { container } = render(
      <ReviewSummary averageRating={0} ratingsCount={0} compact />
    )

    expect(container.innerHTML).toBe("")
  })

  it("should render in compact mode with count > 0", () => {
    render(<ReviewSummary averageRating={3.5} ratingsCount={8} compact />)

    expect(screen.getByText("3.5 (8 avis)")).toBeInTheDocument()
  })

  it("should format rating to one decimal place", () => {
    render(<ReviewSummary averageRating={4} ratingsCount={1} />)

    expect(screen.getByText("4.0 (1 avis)")).toBeInTheDocument()
  })

  it("should render 5 star buttons", () => {
    render(<ReviewSummary averageRating={3} ratingsCount={5} />)

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(5)
  })
})
