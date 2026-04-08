import {
  Controller,
  Post,
  Delete,
  Param,
  HttpCode,
  HttpStatus
} from "@nestjs/common"
import { FavoritesService } from "./favorites.service"
import { CurrentUser } from "../auth/decorators/current-user.decorator"

@Controller("recipes")
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(":id/favorite")
  addFavorite(
    @Param("id") recipeId: string,
    @CurrentUser("sub") userId: string
  ) {
    return this.favoritesService.addFavorite(userId, recipeId)
  }

  @Delete(":id/favorite")
  @HttpCode(HttpStatus.OK)
  removeFavorite(
    @Param("id") recipeId: string,
    @CurrentUser("sub") userId: string
  ) {
    return this.favoritesService.removeFavorite(userId, recipeId)
  }
}
