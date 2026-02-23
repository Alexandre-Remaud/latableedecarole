import type { RecipeFormData } from "@recipes/schema"
import type { Recipe } from "@recipes/contract"
import toCreateRecipePayload from "@recipes/mapper"
import { apiFetch } from "@/lib/api-client"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const recipeService = {
  async createRecipe(data: RecipeFormData) {
    const payload = toCreateRecipePayload(data)

    return apiFetch(`${API_URL}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
  },

  async getRecipes(category?: string) {
    const params = category ? `?category=${category}` : ""
    return apiFetch<Recipe[]>(`${API_URL}/recipes${params}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
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
      body: JSON.stringify(payload)
    })
  },

  async deleteRecipe(id: string) {
    return apiFetch(`${API_URL}/recipes/${id}`, {
      method: "DELETE"
    })
  }
}
