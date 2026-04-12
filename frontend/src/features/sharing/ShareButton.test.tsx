import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ShareButton from "./ShareButton"

const mockShare = vi.fn()

vi.mock("./useShare", () => ({
  useShare: vi.fn()
}))

import { useShare } from "./useShare"

describe("ShareButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockShare.mockReset()
    vi.mocked(useShare).mockReturnValue({
      share: mockShare,
      canNativeShare: false
    })
  })

  it("should render with correct aria-label", () => {
    render(
      <ShareButton
        recipeTitle="Tarte aux pommes"
        recipeDescription="Une tarte classique"
        recipeId="recipe-1"
      />
    )

    expect(screen.getByLabelText("Partager la recette")).toBeInTheDocument()
  })

  it("should call share on click", () => {
    render(
      <ShareButton
        recipeTitle="Tarte aux pommes"
        recipeDescription="Une tarte classique"
        recipeId="recipe-1"
      />
    )

    fireEvent.click(screen.getByRole("button"))

    expect(mockShare).toHaveBeenCalledOnce()
  })

  it("should render the share icon", () => {
    render(
      <ShareButton
        recipeTitle="Tarte aux pommes"
        recipeDescription="Une tarte classique"
        recipeId="recipe-1"
      />
    )

    const button = screen.getByRole("button")
    const svg = button.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })
})
