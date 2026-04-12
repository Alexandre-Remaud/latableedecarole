import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ShoppingListsService } from "./shopping-lists.service"
import { ShoppingListsController } from "./shopping-lists.controller"
import {
  ShoppingList,
  ShoppingListSchema
} from "./entities/shopping-list.entity"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShoppingList.name, schema: ShoppingListSchema },
      { name: Recipe.name, schema: RecipeSchema }
    ])
  ],
  controllers: [ShoppingListsController],
  providers: [ShoppingListsService]
})
export class ShoppingListsModule {}
