import { Module } from "@nestjs/common"
import { RecipesService } from "./recipes.service"
import { RecipesController } from "./recipes.controller"
import { MongooseModule } from "@nestjs/mongoose"
import { RecipeSchema } from "./entities/recipe.entity"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Recipe", schema: RecipeSchema }])
  ],
  controllers: [RecipesController],
  providers: [RecipesService]
})
export class RecipesModule {}
