import { Module } from "@nestjs/common"
import { RecipesService } from "./recipes.service"
import { RecipesController } from "./recipes.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { RecipeSchema } from "./entities/recipe.entity"
import { UploadModule } from "../upload/upload.module"
import { FavoritesModule } from "../favorites/favorites.module"
import { ReviewsModule } from "../reviews/reviews.module"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Recipe", schema: RecipeSchema }]),
    UploadModule,
    FavoritesModule,
    ReviewsModule
  ],
  controllers: [RecipesController],
  providers: [RecipesService]
})
export class RecipesModule {}
