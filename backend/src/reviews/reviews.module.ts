import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { ReviewsService } from "./reviews.service"
import { ReviewsController } from "./reviews.controller"
import { Review, ReviewSchema } from "./entities/review.entity"
import { Recipe, RecipeSchema } from "../recipes/entities/recipe.entity"
import { User, UserSchema } from "../users/entities/user.entity"

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Recipe.name, schema: RecipeSchema },
      { name: User.name, schema: UserSchema }
    ])
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
