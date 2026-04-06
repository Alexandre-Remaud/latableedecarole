import { describe, it, expect } from "vitest"
import {
  editProfileSchema,
  changeEmailSchema,
  changePasswordSchema
} from "./schema"

describe("editProfileSchema", () => {
  it("should accept valid profile data", () => {
    const result = editProfileSchema.safeParse({
      name: "Alice",
      bio: "Hello world",
      avatarUrl: "https://example.com/avatar.jpg"
    })
    expect(result.success).toBe(true)
  })

  it("should accept name only", () => {
    const result = editProfileSchema.safeParse({ name: "Alice" })
    expect(result.success).toBe(true)
  })

  it("should accept empty bio and avatarUrl", () => {
    const result = editProfileSchema.safeParse({
      name: "Alice",
      bio: "",
      avatarUrl: ""
    })
    expect(result.success).toBe(true)
  })

  it("should reject name shorter than 2 characters", () => {
    const result = editProfileSchema.safeParse({ name: "A" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("2 caractères")
    }
  })

  it("should reject name longer than 100 characters", () => {
    const result = editProfileSchema.safeParse({ name: "A".repeat(101) })
    expect(result.success).toBe(false)
  })

  it("should reject bio longer than 500 characters", () => {
    const result = editProfileSchema.safeParse({
      name: "Alice",
      bio: "A".repeat(501)
    })
    expect(result.success).toBe(false)
  })

  it("should reject invalid avatar URL", () => {
    const result = editProfileSchema.safeParse({
      name: "Alice",
      avatarUrl: "not-a-url"
    })
    expect(result.success).toBe(false)
  })

  it("should reject missing name", () => {
    const result = editProfileSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("changeEmailSchema", () => {
  it("should accept valid data", () => {
    const result = changeEmailSchema.safeParse({
      newEmail: "new@example.com",
      password: "Password1"
    })
    expect(result.success).toBe(true)
  })

  it("should reject invalid email", () => {
    const result = changeEmailSchema.safeParse({
      newEmail: "not-email",
      password: "Password1"
    })
    expect(result.success).toBe(false)
  })

  it("should reject empty password", () => {
    const result = changeEmailSchema.safeParse({
      newEmail: "new@example.com",
      password: ""
    })
    expect(result.success).toBe(false)
  })

  it("should reject missing fields", () => {
    const result = changeEmailSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe("changePasswordSchema", () => {
  it("should accept valid data", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "NewPassword1",
      confirmPassword: "NewPassword1"
    })
    expect(result.success).toBe(true)
  })

  it("should reject empty current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewPassword1",
      confirmPassword: "NewPassword1"
    })
    expect(result.success).toBe(false)
  })

  it("should reject new password shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "Short1",
      confirmPassword: "Short1"
    })
    expect(result.success).toBe(false)
  })

  it("should reject new password without uppercase", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "newpassword1",
      confirmPassword: "newpassword1"
    })
    expect(result.success).toBe(false)
  })

  it("should reject new password without lowercase", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "NEWPASSWORD1",
      confirmPassword: "NEWPASSWORD1"
    })
    expect(result.success).toBe(false)
  })

  it("should reject new password without digit", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "NewPassword",
      confirmPassword: "NewPassword"
    })
    expect(result.success).toBe(false)
  })

  it("should reject password confirmation mismatch", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword1",
      newPassword: "NewPassword1",
      confirmPassword: "DifferentPassword1"
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes("confirmPassword")
      )
      expect(confirmError).toBeDefined()
    }
  })

  it("should reject missing fields", () => {
    const result = changePasswordSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
