export interface Collection {
  _id: string
  userId: string
  name: string
  description?: string
  isPublic: boolean
  recipeIds: string[]
  coverImage?: string
  createdAt: string
  updatedAt: string
}

export interface CollectionDetail extends Collection {
  recipes: CollectionRecipe[]
}

export interface CollectionRecipe {
  _id: string
  title: string
  imageUrl?: string
  thumbnailUrl?: string
  category?: string
  servings?: number
}

export interface CollectionsResponse {
  data: Collection[]
  total: number
}

export interface CreateCollectionPayload {
  name: string
  description?: string
  isPublic?: boolean
}

export interface UpdateCollectionPayload {
  name?: string
  description?: string
  isPublic?: boolean
  coverImage?: string
}
