import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import EditProfileModal from "./EditProfileModal"
import type { User } from "@/features/auth/contract"

const mockUser: User = {
  _id: "user-id",
  email: "alice@example.com",
  name: "Alice",
  role: "user",
  bio: "Hello",
  avatarUrl: "https://example.com/avatar.jpg",
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z"
}

describe("EditProfileModal", () => {
  it("should render with pre-filled user data", () => {
    render(
      <EditProfileModal user={mockUser} onSave={vi.fn()} onClose={vi.fn()} />
    )

    expect(screen.getByLabelText("Nom")).toHaveValue("Alice")
    expect(screen.getByLabelText("Bio")).toHaveValue("Hello")
    expect(screen.getByLabelText(/avatar/i)).toHaveValue(
      "https://example.com/avatar.jpg"
    )
  })

  it("should call onSave with updated data on submit", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(
      <EditProfileModal user={mockUser} onSave={onSave} onClose={vi.fn()} />
    )

    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "Bob" }
    })
    fireEvent.change(screen.getByLabelText("Bio"), {
      target: { value: "New bio" }
    })
    fireEvent.click(screen.getByText("Enregistrer"))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        name: "Bob",
        bio: "New bio",
        avatarUrl: "https://example.com/avatar.jpg"
      })
    })
  })

  it("should call onClose when Annuler is clicked", () => {
    const onClose = vi.fn()
    render(
      <EditProfileModal user={mockUser} onSave={vi.fn()} onClose={onClose} />
    )

    fireEvent.click(screen.getByText("Annuler"))

    expect(onClose).toHaveBeenCalled()
  })

  it("should show validation error for short name", async () => {
    render(
      <EditProfileModal user={mockUser} onSave={vi.fn()} onClose={vi.fn()} />
    )

    fireEvent.change(screen.getByLabelText("Nom"), {
      target: { value: "A" }
    })
    fireEvent.click(screen.getByText("Enregistrer"))

    await waitFor(() => {
      expect(screen.getByText(/2 caractères/)).toBeInTheDocument()
    })
  })
})
