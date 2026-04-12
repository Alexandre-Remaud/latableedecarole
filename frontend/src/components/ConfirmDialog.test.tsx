import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import ConfirmDialog from "./ConfirmDialog"

describe("ConfirmDialog", () => {
  const defaultProps = {
    title: "Confirmer la suppression",
    message: "Voulez-vous vraiment supprimer ?",
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  }

  beforeEach(() => {
    defaultProps.onConfirm = vi.fn()
    defaultProps.onCancel = vi.fn()
  })

  it("should render title and message", () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText("Confirmer la suppression")).toBeInTheDocument()
    expect(
      screen.getByText("Voulez-vous vraiment supprimer ?")
    ).toBeInTheDocument()
  })

  it("should render default button labels", () => {
    render(<ConfirmDialog {...defaultProps} />)

    expect(screen.getByText("Supprimer")).toBeInTheDocument()
    expect(screen.getByText("Annuler")).toBeInTheDocument()
  })

  it("should render custom button labels", () => {
    render(
      <ConfirmDialog {...defaultProps} confirmLabel="Oui" cancelLabel="Non" />
    )

    expect(screen.getByText("Oui")).toBeInTheDocument()
    expect(screen.getByText("Non")).toBeInTheDocument()
  })

  it("should call onConfirm when confirm button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText("Supprimer"))

    expect(defaultProps.onConfirm).toHaveBeenCalledOnce()
  })

  it("should call onCancel when cancel button is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText("Annuler"))

    expect(defaultProps.onCancel).toHaveBeenCalledOnce()
  })

  it("should call onCancel when backdrop is clicked", () => {
    const { container } = render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(container.firstElementChild!)

    expect(defaultProps.onCancel).toHaveBeenCalled()
  })

  it("should not call onCancel when dialog content is clicked", () => {
    render(<ConfirmDialog {...defaultProps} />)

    fireEvent.click(screen.getByText("Confirmer la suppression"))

    expect(defaultProps.onCancel).not.toHaveBeenCalled()
  })
})
