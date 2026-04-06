import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ChangePasswordModal from "./ChangePasswordModal"

describe("ChangePasswordModal", () => {
  it("should render form fields", () => {
    render(<ChangePasswordModal onSave={vi.fn()} onClose={vi.fn()} />)

    expect(screen.getByLabelText("Mot de passe actuel")).toBeInTheDocument()
    expect(screen.getByLabelText("Nouveau mot de passe")).toBeInTheDocument()
    expect(
      screen.getByLabelText("Confirmer le nouveau mot de passe")
    ).toBeInTheDocument()
  })

  it("should call onSave with passwords on valid submit", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<ChangePasswordModal onSave={onSave} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "OldPassword1" }
    })
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NewPassword1" }
    })
    fireEvent.change(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      { target: { value: "NewPassword1" } }
    )
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        currentPassword: "OldPassword1",
        newPassword: "NewPassword1"
      })
    })
  })

  it("should call onClose when Annuler is clicked", () => {
    const onClose = vi.fn()
    render(<ChangePasswordModal onSave={vi.fn()} onClose={onClose} />)

    fireEvent.click(screen.getByText("Annuler"))

    expect(onClose).toHaveBeenCalled()
  })

  it("should show error when passwords do not match", async () => {
    render(<ChangePasswordModal onSave={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "OldPassword1" }
    })
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "NewPassword1" }
    })
    fireEvent.change(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      { target: { value: "DifferentPassword1" } }
    )
    fireEvent.click(screen.getByRole("button", { name: "Changer le mot de passe" }))

    await waitFor(() => {
      expect(
        screen.getByText(/mots de passe ne correspondent pas/)
      ).toBeInTheDocument()
    })
  })

  it("should show error for weak new password", async () => {
    render(<ChangePasswordModal onSave={vi.fn()} onClose={vi.fn()} />)

    fireEvent.change(screen.getByLabelText("Mot de passe actuel"), {
      target: { value: "OldPassword1" }
    })
    fireEvent.change(screen.getByLabelText("Nouveau mot de passe"), {
      target: { value: "weak" }
    })
    fireEvent.change(
      screen.getByLabelText("Confirmer le nouveau mot de passe"),
      { target: { value: "weak" } }
    )
    fireEvent.submit(screen.getByRole("button", { name: "Changer le mot de passe" }))

    await waitFor(() => {
      expect(screen.getByText(/majuscule.*minuscule.*chiffre|8 caractères/)).toBeInTheDocument()
    })
  })
})
