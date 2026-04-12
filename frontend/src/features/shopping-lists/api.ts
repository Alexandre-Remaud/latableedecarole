import { apiFetch } from "@/lib/api-client"
import type {
  ShoppingList,
  ShoppingListsResponse,
  CreateShoppingListPayload,
  AddRecipePayload
} from "./contract"

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/shopping-lists`

export const shoppingListsApi = {
  async create(payload: CreateShoppingListPayload): Promise<ShoppingList> {
    return apiFetch<ShoppingList>(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async getAll(): Promise<ShoppingListsResponse> {
    return apiFetch<ShoppingListsResponse>(BASE, {
      method: "GET",
      credentials: "include"
    })
  },

  async getOne(listId: string): Promise<ShoppingList> {
    return apiFetch<ShoppingList>(`${BASE}/${listId}`, {
      method: "GET",
      credentials: "include"
    })
  },

  async rename(listId: string, name: string): Promise<ShoppingList> {
    return apiFetch<ShoppingList>(`${BASE}/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name })
    })
  },

  async addRecipe(
    listId: string,
    payload: AddRecipePayload
  ): Promise<ShoppingList> {
    return apiFetch<ShoppingList>(`${BASE}/${listId}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async toggleItem(
    listId: string,
    itemId: string,
    checked: boolean
  ): Promise<ShoppingList> {
    return apiFetch<ShoppingList>(`${BASE}/${listId}/items/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ checked })
    })
  },

  async remove(listId: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`${BASE}/${listId}`, {
      method: "DELETE",
      credentials: "include"
    })
  }
}
