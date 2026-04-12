export interface ShoppingItem {
  _id: string
  name: string
  quantity?: number
  unit?: string
  checked: boolean
}

export interface ShoppingList {
  _id: string
  userId: string
  name: string
  items: ShoppingItem[]
  recipeIds: string[]
  createdAt: string
  updatedAt: string
}

export interface ShoppingListsResponse {
  data: ShoppingList[]
  total: number
}

export interface CreateShoppingListPayload {
  name: string
  recipeIds: string[]
  servingsOverrides?: { recipeId: string; servings: number }[]
}

export interface AddRecipePayload {
  recipeId: string
  servings?: number
}
