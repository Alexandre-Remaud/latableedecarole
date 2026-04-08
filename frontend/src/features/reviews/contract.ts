export interface Review {
  _id: string
  userId: string
  recipeId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
  user?: {
    _id: string
    name: string
    avatarUrl?: string
  }
}

export interface ReviewsResponse {
  data: Review[]
  total: number
  averageRating: number
}
