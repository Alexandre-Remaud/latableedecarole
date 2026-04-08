import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { FavoritesService } from "./favorites.service"
import { FavoritesController } from "./favorites.controller"
import { Favorite, FavoriteSchema } from "./entities/favorite.entity"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favorite.name, schema: FavoriteSchema },
      { name: Recipe.name, schema: RecipeSchema }
    ])
  ],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService]
})
export class FavoritesModule {}
