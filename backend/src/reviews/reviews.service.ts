import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException
} from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model, Types, isValidObjectId } from "mongoose"
import { Review } from "./entities/review.entity"
import { Recipe } from "../recipes/entities/recipe.entity"
import { User } from "../users/entities/user.entity"
import { CreateReviewDto } from "./dto/create-review.dto"
import { UpdateReviewDto } from "./dto/update-review.dto"
import { Role } from "../auth/role.enum"

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  private validateObjectId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid ID format")
    }
  }

  async createReview(userId: string, recipeId: string, dto: CreateReviewDto) {
    this.validateObjectId(recipeId)

    const recipe = await this.recipeModel.findById(recipeId).exec()
    if (!recipe) {
      throw new NotFoundException("Recipe not found")
    }

    if (recipe.userId && recipe.userId.toString() === userId) {
      throw new ForbiddenException("Cannot review your own recipe")
    }

    const existing = await this.reviewModel
      .findOne({
        userId: new Types.ObjectId(userId),
        recipeId: new Types.ObjectId(recipeId)
      })
      .exec()

    if (existing) {
      throw new ConflictException("You have already reviewed this recipe")
    }

    const review = await this.reviewModel.create({
      userId: new Types.ObjectId(userId),
      recipeId: new Types.ObjectId(recipeId),
      rating: dto.rating,
      comment: dto.comment
    })

    await this.recalculateRecipeRating(new Types.ObjectId(recipeId))

    return review
  }

  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    this.validateObjectId(reviewId)

    const review = await this.reviewModel.findById(reviewId).exec()
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    if (review.userId.toString() !== userId) {
      throw new ForbiddenException("You can only edit your own reviews")
    }

    if (dto.rating !== undefined) review.rating = dto.rating
    if (dto.comment !== undefined) review.comment = dto.comment

    await review.save()

    await this.recalculateRecipeRating(review.recipeId)

    return review
  }

  async deleteReview(userId: string, role: string, reviewId: string) {
    this.validateObjectId(reviewId)

    const review = await this.reviewModel.findById(reviewId).exec()
    if (!review) {
      throw new NotFoundException("Review not found")
    }

    if (review.userId.toString() !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException("You can only delete your own reviews")
    }

    const recipeId = review.recipeId

    await this.reviewModel.findByIdAndDelete(reviewId).exec()

    await this.recalculateRecipeRating(recipeId)

    return { deleted: true }
  }

  async getRecipeReviews(recipeId: string, skip = 0, limit = 20) {
    this.validateObjectId(recipeId)

    const safeSkip = Math.max(0, skip)
    const safeLimit = Math.min(Math.max(1, limit), 100)

    const filter = { recipeId: new Types.ObjectId(recipeId) }

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(safeSkip)
        .limit(safeLimit)
        .exec(),
      this.reviewModel.countDocuments(filter)
    ])

    const userIds = [...new Set(reviews.map((r) => r.userId.toString()))]
    const users = await this.userModel
      .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
      .select("name avatarUrl")
      .exec()

    const userMap = new Map(users.map((u) => [u._id.toString(), u]))

    const data = reviews.map((review) => {
      const reviewObj = review.toObject()
      const user = userMap.get(review.userId.toString())
      return {
        ...reviewObj,
        user: user
          ? {
              _id: user._id.toString(),
              name: user.name,
              avatarUrl: user.avatarUrl
            }
          : undefined
      }
    })

    const recipe = await this.recipeModel.findById(recipeId).exec()
    const averageRating = recipe?.averageRating ?? 0

    return { data, total, averageRating }
  }

  private async recalculateRecipeRating(
    recipeId: Types.ObjectId
  ): Promise<void> {
    const result = await this.reviewModel
      .aggregate<{ averageRating: number; ratingsCount: number }>([
        { $match: { recipeId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            ratingsCount: { $sum: 1 }
          }
        }
      ])
      .exec()

    if (result.length > 0) {
      const avg = Math.round(result[0].averageRating * 10) / 10
      await this.recipeModel
        .findByIdAndUpdate(recipeId, {
          averageRating: avg,
          ratingsCount: result[0].ratingsCount
        })
        .exec()
    } else {
      await this.recipeModel
        .findByIdAndUpdate(recipeId, {
          averageRating: 0,
          ratingsCount: 0
        })
        .exec()
    }
  }

  async deleteByRecipeId(recipeId: string): Promise<void> {
    this.validateObjectId(recipeId)
    await this.reviewModel
      .deleteMany({ recipeId: new Types.ObjectId(recipeId) })
      .exec()
  }
}
