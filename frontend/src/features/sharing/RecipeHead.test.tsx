import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import { HelmetProvider } from "react-helmet-async"
import RecipeHead from "./RecipeHead"
import type { Recipe } from "@recipes/contract"

const mockRecipe: Recipe = {
  _id: "recipe-1",
  title: "Tarte aux pommes",
  description: "Une tarte classique",
  ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
  steps: [{ order: 1, instruction: "Éplucher les pommes" }]
}

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>)
}

describe("RecipeHead", () => {
  it("should render without crashing", () => {
    const { container } = renderWithHelmet(<RecipeHead recipe={mockRecipe} />)

    expect(container).toBeTruthy()
  })

  it("should render with a long description without crashing", () => {
    const longRecipe: Recipe = {
      ...mockRecipe,
      description: "A".repeat(200)
    }

    const { container } = renderWithHelmet(<RecipeHead recipe={longRecipe} />)

    expect(container).toBeTruthy()
  })
})
