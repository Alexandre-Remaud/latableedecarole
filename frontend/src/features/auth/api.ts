import { apiFetch } from "@/lib/api-client"
import type { AuthResponse, User } from "./contract"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "AuthError"
  }
}

export const authApi = {
  async register(data: { email: string; password: string; name: string }) {
    const response = await apiFetch<AuthResponse>(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    })
    return response
  },

  async login(data: { email: string; password: string }) {
    const response = await apiFetch<AuthResponse>(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    })
    return response
  },

  async logout() {
    await apiFetch<{ message: string }>(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include"
    })
  },

  async getProfile(): Promise<User> {
    const response = await apiFetch<{ id: string; email: string; role: string }>(
      `${API_URL}/auth/me`,
      {
        method: "GET",
        credentials: "include"
      }
    )
    return response as unknown as User
  }
}
