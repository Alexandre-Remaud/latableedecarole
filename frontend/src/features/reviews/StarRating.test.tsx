import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import StarRating from "./StarRating"

describe("StarRating", () => {
  it("should render 5 star buttons", () => {
    render(<StarRating value={0} />)

    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(5)
  })

  it("should render correct aria-labels", () => {
    render(<StarRating value={0} />)

    expect(screen.getByLabelText("1 étoile")).toBeInTheDocument()
    expect(screen.getByLabelText("2 étoiles")).toBeInTheDocument()
    expect(screen.getByLabelText("5 étoiles")).toBeInTheDocument()
  })

  it("should disable buttons when readonly", () => {
    render(<StarRating value={3} readonly />)

    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it("should disable buttons when no onChange provided", () => {
    render(<StarRating value={3} />)

    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it("should call onChange when a star is clicked", () => {
    const onChange = vi.fn()
    render(<StarRating value={2} onChange={onChange} />)

    fireEvent.click(screen.getByLabelText("4 étoiles"))

    expect(onChange).toHaveBeenCalledWith(4)
  })

  it("should not call onChange when readonly", () => {
    const onChange = vi.fn()
    render(<StarRating value={2} onChange={onChange} readonly />)

    fireEvent.click(screen.getByLabelText("4 étoiles"))

    expect(onChange).not.toHaveBeenCalled()
  })

  it("should update hover state on mouse enter", () => {
    const onChange = vi.fn()
    render(<StarRating value={1} onChange={onChange} />)

    const star4 = screen.getByLabelText("4 étoiles")
    fireEvent.mouseEnter(star4)

    // The SVG for stars 1-4 should be filled after hover
    const svgs = document.querySelectorAll("svg")
    expect(svgs[3].getAttribute("fill")).toBe("#f59e0b")
  })

  it("should reset hover state on mouse leave", () => {
    const onChange = vi.fn()
    render(<StarRating value={1} onChange={onChange} />)

    const container = screen.getByLabelText("1 étoile").parentElement!
    const star4 = screen.getByLabelText("4 étoiles")

    fireEvent.mouseEnter(star4)
    fireEvent.mouseLeave(container)

    // Star 2 should not be filled (only star 1 from value)
    const svgs = document.querySelectorAll("svg")
    expect(svgs[1].getAttribute("fill")).toBe("none")
  })

  it("should not update hover when readonly", () => {
    render(<StarRating value={1} readonly />)

    const star4 = screen.getByLabelText("4 étoiles")
    fireEvent.mouseEnter(star4)

    // Star 4 should remain unfilled
    const svgs = document.querySelectorAll("svg")
    expect(svgs[3].getAttribute("fill")).toBe("none")
  })
})
