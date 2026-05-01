import { apiFetch } from "@/lib/api-client"
import type {
  Collection,
  CollectionDetail,
  CollectionsResponse,
  CreateCollectionPayload,
  UpdateCollectionPayload
} from "./contract"

const BASE = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/collections`

export const collectionsApi = {
  async create(payload: CreateCollectionPayload): Promise<Collection> {
    return apiFetch<Collection>(BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async getMine(): Promise<CollectionsResponse> {
    return apiFetch<CollectionsResponse>(`${BASE}/me`, {
      method: "GET",
      credentials: "include"
    })
  },

  async getOne(collectionId: string): Promise<CollectionDetail> {
    return apiFetch<CollectionDetail>(`${BASE}/${collectionId}`, {
      method: "GET",
      credentials: "include"
    })
  },

  async update(
    collectionId: string,
    payload: UpdateCollectionPayload
  ): Promise<Collection> {
    return apiFetch<Collection>(`${BASE}/${collectionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload)
    })
  },

  async remove(collectionId: string): Promise<{ deleted: boolean }> {
    return apiFetch<{ deleted: boolean }>(`${BASE}/${collectionId}`, {
      method: "DELETE",
      credentials: "include"
    })
  },

  async addRecipe(
    collectionId: string,
    recipeId: string
  ): Promise<CollectionDetail> {
    return apiFetch<CollectionDetail>(`${BASE}/${collectionId}/recipes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ recipeId })
    })
  },

  async removeRecipe(
    collectionId: string,
    recipeId: string
  ): Promise<CollectionDetail> {
    return apiFetch<CollectionDetail>(
      `${BASE}/${collectionId}/recipes/${recipeId}`,
      {
        method: "DELETE",
        credentials: "include"
      }
    )
  }
}
