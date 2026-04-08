export type Recipe = {
  _id: string;
  title: string;
  description: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: {
    order: number;
    instruction: string;
    duration?: number;
    durationUnit?: "min" | "sec";
    temperature?: number;
    temperatureUnit?: "C" | "F";
    note?: string;
  }[];
  imageUrl?: string;
  imageThumbnailUrl?: string;
  imageMediumUrl?: string;
  imagePublicId?: string;
  servings?: number;
  prepTime?: number;
  cookTime?: number;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  favoritesCount?: number;
  isFavorited?: boolean;
  averageRating?: number;
  ratingsCount?: number;
};

export type PaginatedRecipes = {
  data: Recipe[]
  total: number
}

export type CreateRecipeContract = {
  title: string;
  description: string;
  ingredients: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  steps: {
    order: number;
    instruction: string;
    duration?: number;
    durationUnit?: "min" | "sec";
    temperature?: number;
    temperatureUnit?: "C" | "F";
    note?: string;
  }[];
  imageUrl?: string;
  imageThumbnailUrl?: string;
  imageMediumUrl?: string;
  imagePublicId?: string;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  category?: string;
};
