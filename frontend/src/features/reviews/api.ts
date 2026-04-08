import { apiFetch } from "@/lib/api-client"
import type { Review, ReviewsResponse } from "./contract"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const reviewsApi = {
  async getRecipeReviews(
    recipeId: string,
    skip = 0,
    limit = 20
  ): Promise<ReviewsResponse> {
    return apiFetch<ReviewsResponse>(
      `${API_URL}/recipes/${recipeId}/reviews?skip=${skip}&limit=${limit}`,
      {
        method: "GET",
        credentials: "include"
      }
    )
  },

  async createReview(
    recipeId: string,
    data: { rating: number; comment?: string }
  ): Promise<Review> {
    return apiFetch<Review>(
      `${API_URL}/recipes/${recipeId}/reviews`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      }
    )
  },

  async updateReview(
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<Review> {
    return apiFetch<Review>(
      `${API_URL}/reviews/${reviewId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data)
      }
    )
  },

  async deleteReview(reviewId: string): Promise<{ deleted: boolean }> {
    return apiFetch<{ deleted: boolean }>(
      `${API_URL}/reviews/${reviewId}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    )
  }
}
