import { apiFetch } from "@/lib/api-client"
import type { FavoriteToggleResponse, FavoritesListResponse } from "./contract"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const favoritesApi = {
  async addFavorite(recipeId: string): Promise<FavoriteToggleResponse> {
    return apiFetch<FavoriteToggleResponse>(
      `${API_URL}/recipes/${recipeId}/favorite`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      }
    )
  },

  async removeFavorite(recipeId: string): Promise<FavoriteToggleResponse> {
    return apiFetch<FavoriteToggleResponse>(
      `${API_URL}/recipes/${recipeId}/favorite`,
      {
        method: "DELETE",
        credentials: "include"
      }
    )
  },

  async getMyFavorites(skip = 0, limit = 20): Promise<FavoritesListResponse> {
    return apiFetch<FavoritesListResponse>(
      `${API_URL}/users/me/favorites?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include"
      }
    )
  }
}
