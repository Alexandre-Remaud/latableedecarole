import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import ProfileHeader from "./ProfileHeader"

const baseProps = {
  name: "Alice Dupont",
  createdAt: "2024-01-15T00:00:00.000Z",
  recipesCount: 5
}

describe("ProfileHeader", () => {
  it("should render name and recipe count", () => {
    render(<ProfileHeader {...baseProps} />)

    expect(screen.getByText("Alice Dupont")).toBeInTheDocument()
    expect(screen.getByText("5 recettes")).toBeInTheDocument()
  })

  it("should render bio when provided", () => {
    render(<ProfileHeader {...baseProps} bio="Hello world" />)

    expect(screen.getByText("Hello world")).toBeInTheDocument()
  })

  it("should not render bio when not provided", () => {
    render(<ProfileHeader {...baseProps} />)

    expect(screen.queryByText("Hello world")).not.toBeInTheDocument()
  })

  it("should render avatar image when avatarUrl is provided", () => {
    render(
      <ProfileHeader
        {...baseProps}
        avatarUrl="https://example.com/avatar.jpg"
      />
    )

    const img = screen.getByRole("img", { name: "Alice Dupont" })
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg")
  })

  it("should render initials when no avatarUrl", () => {
    render(<ProfileHeader {...baseProps} />)

    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("should show email when showEmail is true and email is provided", () => {
    render(
      <ProfileHeader
        {...baseProps}
        showEmail={true}
        email="alice@example.com"
      />
    )

    expect(screen.getByText("alice@example.com")).toBeInTheDocument()
  })

  it("should hide email when showEmail is false", () => {
    render(
      <ProfileHeader
        {...baseProps}
        showEmail={false}
        email="alice@example.com"
      />
    )

    expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument()
  })

  it("should hide email when showEmail is true but no email provided", () => {
    render(<ProfileHeader {...baseProps} showEmail={true} />)

    expect(screen.queryByText("alice@example.com")).not.toBeInTheDocument()
  })

  it("should show singular 'recette' for count of 1", () => {
    render(<ProfileHeader {...baseProps} recipesCount={1} />)

    expect(screen.getByText("1 recette")).toBeInTheDocument()
  })

  it("should render formatted date", () => {
    render(<ProfileHeader {...baseProps} />)

    expect(screen.getByText(/Membre depuis le/)).toBeInTheDocument()
  })
})
