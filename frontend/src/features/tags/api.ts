import { apiFetch } from "@/lib/api-client"
import type { Tag } from "./types"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const tagsService = {
  async getTags(limit = 100): Promise<Tag[]> {
    return apiFetch<Tag[]>(`${API_URL}/tags?limit=${limit}`, {
      credentials: "include"
    })
  },

  async getPopularTags(): Promise<Tag[]> {
    return apiFetch<Tag[]>(`${API_URL}/tags/popular`, {
      credentials: "include"
    })
  }
}
