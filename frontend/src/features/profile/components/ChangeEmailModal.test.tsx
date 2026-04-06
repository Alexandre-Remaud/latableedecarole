import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ChangeEmailModal from "./ChangeEmailModal"

describe("ChangeEmailModal", () => {
  it("should render form fields", () => {
    render(<ChangeEmailModal onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByLabelText("Nouvel email")).toBeInTheDocument()
    expect(screen.getByLabelText("Mot de passe actuel")).toBeInTheDocument()
  })

  it("should call onSave with email and password on submit", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ChangeEmailModal onSave={onSave} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Nouvel email"), {
      target: { value: "new@example.com" }
    })
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "Password1" }
    })
    fireEvent.click(screen.getByRole("button", { name: "Changer l'email" }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        newEmail: "new@example.com",
        password: "Password1"
      })
    })
  })

  it("should call onClose when Annuler is clicked", () => {
    const onClose = vi.fn()
    render(<ChangeEmailModal onSave={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getByText("Annuler"))

    expect(onClose).toHaveBeenCalled()
  })

  it("should show validation error for invalid email", async () => {
    render(<ChangeEmailModal onSave={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Nouvel email"), {
      target: { value: "not-email" }
    })
    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "Password1" }
    })
    fireEvent.submit(screen.getByRole("button", { name: "Changer l'email" }))

    await waitFor(() => {
      expect(screen.getByText(/Email invalide/)).toBeInTheDocument()
    })
  })
})
