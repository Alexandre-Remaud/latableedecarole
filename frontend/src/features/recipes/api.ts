import type { RecipeFormData } from "@recipes/schema"
import type { Recipe, PaginatedRecipes } from "@recipes/contract"
import toCreateRecipePayload from "@recipes/mapper"
import { apiFetch } from "@/lib/api-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const recipeService = {
  async createRecipe(data: RecipeFormData) {
    const payload = toCreateRecipePayload(data)

    return apiFetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async getRecipes(category?: string, search?: string, skip = 0, limit = 20) {
    const params = new URLSearchParams()
    if (category) params.set("category", category)
    if (search) params.set("search", search)
    params.set("skip", String(skip))
    params.set("limit", String(limit))
    return apiFetch<PaginatedRecipes>(`${API_URL}/recipes?${params}`)
  },

  async getRecipe(id: string) {
    return apiFetch<Recipe>(`${API_URL}/recipes/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
  },

  async updateRecipe(id: string, data: RecipeFormData) {
    const payload = toCreateRecipePayload(data)
    return apiFetch<Recipe>(`${API_URL}/recipes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async deleteRecipe(id: string) {
    return apiFetch(`${API_URL}/recipes/${id}`, {
      method: "DELETE",
      credentials: "include"
    })
  }
}
