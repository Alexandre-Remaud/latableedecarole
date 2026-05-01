import { IsMongoId } from "class-validator"

export class AddRecipeDto {
  @IsMongoId()
  recipeId: string
}
