import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import TagInput from "./TagInput"

describe("TagInput", () => {
  it("should render existing tags as chips", () => {
    render(<TagInput value={["végétarien", "rapide"]} onChange={vi.fn()} />)
    expect(screen.getByText("végétarien")).toBeInTheDocument()
    expect(screen.getByText("rapide")).toBeInTheDocument()
  })

  it("should call onChange with new tag on Enter", () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText("Ajouter un tag...")
    fireEvent.change(input, { target: { value: "sans gluten" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onChange).toHaveBeenCalledWith(["sans gluten"])
  })

  it("should call onChange with new tag on comma", () => {
    const onChange = vi.fn()
    render(<TagInput value={[]} onChange={onChange} />)
    const input = screen.getByPlaceholderText("Ajouter un tag...")
    fireEvent.change(input, { target: { value: "rapide" } })
    fireEvent.keyDown(input, { key: "," })
    expect(onChange).toHaveBeenCalledWith(["rapide"])
  })

  it("should remove tag on X click", () => {
    const onChange = vi.fn()
    render(<TagInput value={["végétarien"]} onChange={onChange} />)
    fireEvent.click(
      screen.getByRole("button", { name: "Supprimer végétarien" })
    )
    expect(onChange).toHaveBeenCalledWith([])
  })

  it("should remove last tag on Backspace when input empty", () => {
    const onChange = vi.fn()
    render(<TagInput value={["végétarien", "rapide"]} onChange={onChange} />)
    const input = screen.getByRole("textbox")
    fireEvent.keyDown(input, { key: "Backspace" })
    expect(onChange).toHaveBeenCalledWith(["végétarien"])
  })

  it("should not add duplicate tags", () => {
    const onChange = vi.fn()
    render(<TagInput value={["rapide"]} onChange={onChange} />)
    const input = screen.getByRole("textbox")
    fireEvent.change(input, { target: { value: "rapide" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onChange).not.toHaveBeenCalled()
  })

  it("should hide input when maxTags reached", () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`)
    render(<TagInput value={tags} onChange={vi.fn()} />)
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
  })

  it("should show dropdown suggestions filtered by input", () => {
    render(
      <TagInput
        value={[]}
        onChange={vi.fn()}
        suggestions={["végétarien", "végétalien", "rapide"]}
      />
    )
    const input = screen.getByPlaceholderText("Ajouter un tag...")
    fireEvent.change(input, { target: { value: "végé" } })
    fireEvent.focus(input)
    expect(screen.getByText("végétarien")).toBeInTheDocument()
    expect(screen.getByText("végétalien")).toBeInTheDocument()
    expect(screen.queryByText("rapide")).not.toBeInTheDocument()
  })
})
