import { apiFetch } from "@/lib/api-client"
import type {
  PublicProfile,
  UpdateProfileData,
  ChangeEmailData,
  ChangePasswordData,
  UserRecipesResponse
} from "./contract"
import type { User } from "@/features/auth/contract"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const profileApi = {
  async getPublicProfile(id: string): Promise<PublicProfile> {
    return apiFetch<PublicProfile>(`${API_URL}/users/${id}/profile`, {
      method: "GET",
      credentials: "include"
    })
  },

  async updateProfile(data: UpdateProfileData): Promise<User> {
    return apiFetch<User>(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    })
  },

  async changeEmail(
    data: ChangeEmailData
  ): Promise<{ message: string; user: User }> {
    return apiFetch<{ message: string; user: User }>(
      `${API_URL}/users/me/email`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      }
    )
  },

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`${API_URL}/users/me/password`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data)
    })
  },

  async getUserRecipes(
    id: string,
    skip = 0,
    limit = 20
  ): Promise<UserRecipesResponse> {
    return apiFetch<UserRecipesResponse>(
      `${API_URL}/users/${id}/recipes?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include"
      }
    )
  }
}
