import type { Recipe } from "@recipes/contract"

export interface FavoriteToggleResponse {
  favorited: boolean
  favoritesCount: number
}

export interface FavoritesListResponse {
  data: Recipe[]
  total: number
}
