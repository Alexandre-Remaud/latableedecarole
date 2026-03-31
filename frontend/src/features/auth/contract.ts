export const Role = {
  USER: "user",
  ADMIN: "admin"
} as const

export type Role = (typeof Role)[keyof typeof Role]

export interface User {
  _id: string
  email: string
  name: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
}
