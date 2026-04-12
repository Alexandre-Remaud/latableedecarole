import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import RecipeBadges from "./RecipeBadges"

describe("RecipeBadges", () => {
  it("should render category badge", () => {
    render(
      <RecipeBadges
        recipe={{
          category: "dessert",
          difficulty: undefined,
          servings: undefined,
          cookTime: undefined
        }}
      />
    )

    expect(screen.getByText("Dessert")).toBeInTheDocument()
  })

  it("should render difficulty badge", () => {
    render(
      <RecipeBadges
        recipe={{
          category: undefined,
          difficulty: "easy",
          servings: undefined,
          cookTime: undefined
        }}
      />
    )

    expect(screen.getByText("Facile")).toBeInTheDocument()
  })

  it("should render servings badge", () => {
    render(
      <RecipeBadges
        recipe={{
          category: undefined,
          difficulty: undefined,
          servings: 4,
          cookTime: undefined
        }}
      />
    )

    expect(screen.getByText("4 pers.")).toBeInTheDocument()
  })

  it("should render cookTime badge", () => {
    render(
      <RecipeBadges
        recipe={{
          category: undefined,
          difficulty: undefined,
          servings: undefined,
          cookTime: 30
        }}
      />
    )

    expect(screen.getByText("30 min")).toBeInTheDocument()
  })

  it("should not render cookTime badge when cookTime is 0", () => {
    render(
      <RecipeBadges
        recipe={{
          category: undefined,
          difficulty: undefined,
          servings: undefined,
          cookTime: 0
        }}
      />
    )

    expect(screen.queryByText("0 min")).not.toBeInTheDocument()
  })

  it("should render multiple badges", () => {
    render(
      <RecipeBadges
        recipe={{
          category: "main_course",
          difficulty: "hard",
          servings: 6,
          cookTime: 45
        }}
      />
    )

    expect(screen.getByText("Difficile")).toBeInTheDocument()
    expect(screen.getByText("6 pers.")).toBeInTheDocument()
    expect(screen.getByText("45 min")).toBeInTheDocument()
  })

  it("should render nothing when all fields are empty", () => {
    const { container } = render(
      <RecipeBadges
        recipe={{
          category: undefined,
          difficulty: undefined,
          servings: undefined,
          cookTime: undefined
        }}
      />
    )

    const badges = container.querySelectorAll("span")
    expect(badges).toHaveLength(0)
  })

  it("should apply custom className", () => {
    const { container } = render(
      <RecipeBadges
        recipe={{
          category: "dessert",
          difficulty: undefined,
          servings: undefined,
          cookTime: undefined
        }}
        className="mt-4"
      />
    )

    expect(container.firstElementChild).toHaveClass("mt-4")
  })
})
