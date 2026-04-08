import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus
} from "@nestjs/common"
import { ReviewsService } from "./reviews.service"
import { CreateReviewDto } from "./dto/create-review.dto"
import { UpdateReviewDto } from "./dto/update-review.dto"
import { GetReviewsDto } from "./dto/get-reviews.dto"
import { CurrentUser } from "../auth/decorators/current-user.decorator"
import { Public } from "../auth/decorators/public.decorator"

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post("recipes/:id/reviews")
  createReview(
    @Param("id") recipeId: string,
    @CurrentUser("sub") userId: string,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewsService.createReview(userId, recipeId, dto)
  }

  @Patch("reviews/:id")
  updateReview(
    @Param("id") reviewId: string,
    @CurrentUser("sub") userId: string,
    @Body() dto: UpdateReviewDto
  ) {
    return this.reviewsService.updateReview(userId, reviewId, dto)
  }

  @Delete("reviews/:id")
  @HttpCode(HttpStatus.OK)
  deleteReview(
    @Param("id") reviewId: string,
    @CurrentUser("sub") userId: string,
    @CurrentUser("role") role: string
  ) {
    return this.reviewsService.deleteReview(userId, role, reviewId)
  }

  @Public()
  @Get("recipes/:id/reviews")
  getRecipeReviews(
    @Param("id") recipeId: string,
    @Query() query: GetReviewsDto
  ) {
    const skip = query.skip ? parseInt(query.skip) : 0
    const limit = query.limit ? parseInt(query.limit) : 20
    return this.reviewsService.getRecipeReviews(recipeId, skip, limit)
  }
}
