import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { TagsService } from "./tags.service"
import { TagsController } from "./tags.controller"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }])
  ],
  controllers: [TagsController],
  providers: [TagsService]
})
export class TagsModule {}
