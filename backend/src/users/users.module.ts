import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { UsersService } from "./users.service"
import { UsersController } from "./users.controller"
import { User, UserSchema } from "./entities/user.entity"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"
import { FavoritesModule } from "../favorites/favorites.module"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Recipe.name, schema: RecipeSchema }
    ]),
    FavoritesModule
  ],
  controllers: [UsersController],
  providers: [UsersService]
})
export class UsersModule {}
