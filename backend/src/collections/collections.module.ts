import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { CollectionsService } from "./collections.service"
import { CollectionsController } from "./collections.controller"
import { Collection, CollectionSchema } from "./entities/collection.entity"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Recipe.name, schema: RecipeSchema }
    ])
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService]
})
export class CollectionsModule {}
