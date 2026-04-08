import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException
} from "@nestjs/common"
import { Types } from "mongoose"
import { ReviewsService } from "./reviews.service"
import { Review } from "./entities/review.entity"
import { Recipe } from "../recipes/entities/recipe.entity"
import { User } from "../users/entities/user.entity"

const VALID_ID = "507f1f77bcf86cd799439011"
const VALID_ID_2 = "507f1f77bcf86cd799439012"
const VALID_ID_3 = "507f1f77bcf86cd799439013"
const INVALID_ID = "not-a-valid-id"

const mockReviewModel = {
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findByIdAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  aggregate: jest.fn(),
  deleteMany: jest.fn()
}

const mockRecipeModel = {
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn()
}

const mockUserModel = {
  find: jest.fn()
}

describe("ReviewsService", () => {
  let service: ReviewsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: getModelToken(Review.name),
          useValue: mockReviewModel
        },
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        }
      ]
    }).compile()

    service = module.get<ReviewsService>(ReviewsService)
    jest.clearAllMocks()
  })

  describe("createReview", () => {
    const dto = { rating: 4, comment: "Excellent" }

    it("should create a review and recalculate rating", async () => {
      const recipeObjId = new Types.ObjectId(VALID_ID)
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: recipeObjId,
          userId: new Types.ObjectId(VALID_ID_3)
        })
      })
      mockReviewModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })
      const createdReview = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(VALID_ID_2),
        recipeId: recipeObjId,
        rating: 4,
        comment: "Excellent"
      }
      mockReviewModel.create.mockResolvedValue(createdReview)
      mockReviewModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ averageRating: 4, ratingsCount: 1 }])
      })
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.createReview(VALID_ID_2, VALID_ID, dto)

      expect(result).toEqual(createdReview)
      expect(mockReviewModel.create).toHaveBeenCalled()
      expect(mockRecipeModel.findByIdAndUpdate).toHaveBeenCalled()
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.createReview(VALID_ID_2, VALID_ID, dto)
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw ForbiddenException when reviewing own recipe", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(VALID_ID),
          userId: new Types.ObjectId(VALID_ID_2)
        })
      })

      await expect(
        service.createReview(VALID_ID_2, VALID_ID, dto)
      ).rejects.toThrow(ForbiddenException)
    })

    it("should throw ConflictException for duplicate review", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(VALID_ID),
          userId: new Types.ObjectId(VALID_ID_3)
        })
      })
      mockReviewModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: "existing-review" })
      })

      await expect(
        service.createReview(VALID_ID_2, VALID_ID, dto)
      ).rejects.toThrow(ConflictException)
    })

    it("should throw BadRequestException for invalid recipe ID", async () => {
      await expect(
        service.createReview(VALID_ID_2, INVALID_ID, dto)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe("updateReview", () => {
    const dto = { rating: 5, comment: "Updated" }

    it("should update and return the review", async () => {
      const review = {
        _id: new Types.ObjectId(VALID_ID),
        userId: new Types.ObjectId(VALID_ID_2),
        recipeId: new Types.ObjectId(VALID_ID_3),
        rating: 4,
        comment: "Old",
        save: jest.fn().mockResolvedValue(undefined)
      }
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(review)
      })
      mockReviewModel.aggregate.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([{ averageRating: 5, ratingsCount: 1 }])
      })
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.updateReview(VALID_ID_2, VALID_ID, dto)

      expect(review.save).toHaveBeenCalled()
      expect(result.rating).toBe(5)
      expect(result.comment).toBe("Updated")
    })

    it("should throw NotFoundException if review not found", async () => {
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.updateReview(VALID_ID_2, VALID_ID, dto)
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw ForbiddenException if not the owner", async () => {
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(VALID_ID),
          userId: new Types.ObjectId(VALID_ID_3),
          recipeId: new Types.ObjectId(VALID_ID_2)
        })
      })

      await expect(
        service.updateReview(VALID_ID_2, VALID_ID, dto)
      ).rejects.toThrow(ForbiddenException)
    })

    it("should throw BadRequestException for invalid review ID", async () => {
      await expect(
        service.updateReview(VALID_ID_2, INVALID_ID, dto)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe("deleteReview", () => {
    it("should delete as owner and recalculate rating", async () => {
      const review = {
        _id: new Types.ObjectId(VALID_ID),
        userId: new Types.ObjectId(VALID_ID_2),
        recipeId: new Types.ObjectId(VALID_ID_3)
      }
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(review)
      })
      mockReviewModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(review)
      })
      mockReviewModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.deleteReview(VALID_ID_2, "user", VALID_ID)

      expect(result).toEqual({ deleted: true })
      expect(mockReviewModel.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID)
    })

    it("should delete as admin even when not owner", async () => {
      const review = {
        _id: new Types.ObjectId(VALID_ID),
        userId: new Types.ObjectId(VALID_ID_3),
        recipeId: new Types.ObjectId(VALID_ID_2)
      }
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(review)
      })
      mockReviewModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(review)
      })
      mockReviewModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.deleteReview(VALID_ID_2, "admin", VALID_ID)

      expect(result).toEqual({ deleted: true })
    })

    it("should throw NotFoundException if review not found", async () => {
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.deleteReview(VALID_ID_2, "user", VALID_ID)
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw ForbiddenException if not owner and not admin", async () => {
      mockReviewModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(VALID_ID),
          userId: new Types.ObjectId(VALID_ID_3),
          recipeId: new Types.ObjectId(VALID_ID_2)
        })
      })

      await expect(
        service.deleteReview(VALID_ID_2, "user", VALID_ID)
      ).rejects.toThrow(ForbiddenException)
    })

    it("should throw BadRequestException for invalid review ID", async () => {
      await expect(
        service.deleteReview(VALID_ID_2, "user", INVALID_ID)
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe("getRecipeReviews", () => {
    it("should return paginated reviews with user info and averageRating", async () => {
      const reviewObj = {
        _id: new Types.ObjectId(VALID_ID),
        userId: new Types.ObjectId(VALID_ID_2),
        recipeId: new Types.ObjectId(VALID_ID_3),
        rating: 4,
        comment: "Great",
        toObject: jest.fn().mockReturnValue({
          _id: new Types.ObjectId(VALID_ID),
          userId: new Types.ObjectId(VALID_ID_2),
          recipeId: new Types.ObjectId(VALID_ID_3),
          rating: 4,
          comment: "Great"
        })
      }

      const mockLimit = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([reviewObj])
      })
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip })
      mockReviewModel.find.mockReturnValue({ sort: mockSort })
      mockReviewModel.countDocuments.mockResolvedValue(1)

      const mockUserSelect = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            _id: new Types.ObjectId(VALID_ID_2),
            name: "Alice",
            avatarUrl: "https://example.com/avatar.jpg"
          }
        ])
      })
      mockUserModel.find.mockReturnValue({ select: mockUserSelect })

      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ averageRating: 4.0 })
      })

      const result = await service.getRecipeReviews(VALID_ID_3, 0, 20)

      expect(result.total).toBe(1)
      expect(result.averageRating).toBe(4.0)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].user).toEqual({
        _id: VALID_ID_2,
        name: "Alice",
        avatarUrl: "https://example.com/avatar.jpg"
      })
    })

    it("should return averageRating 0 when recipe has no rating", async () => {
      const mockLimit = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip })
      mockReviewModel.find.mockReturnValue({ sort: mockSort })
      mockReviewModel.countDocuments.mockResolvedValue(0)

      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      })

      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.getRecipeReviews(VALID_ID_3)

      expect(result.averageRating).toBe(0)
      expect(result.data).toEqual([])
      expect(result.total).toBe(0)
    })

    it("should throw BadRequestException for invalid recipe ID", async () => {
      await expect(service.getRecipeReviews(INVALID_ID)).rejects.toThrow(
        BadRequestException
      )
    })

    it("should clamp skip and limit to safe values", async () => {
      const mockLimit = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit })
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip })
      mockReviewModel.find.mockReturnValue({ sort: mockSort })
      mockReviewModel.countDocuments.mockResolvedValue(0)
      mockUserModel.find.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([])
        })
      })
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await service.getRecipeReviews(VALID_ID_3, -5, 200)

      expect(mockSkip).toHaveBeenCalledWith(0)
      expect(mockLimit).toHaveBeenCalledWith(100)
    })
  })

  describe("deleteByRecipeId", () => {
    it("should delete all reviews for a recipe", async () => {
      mockReviewModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      })

      await service.deleteByRecipeId(VALID_ID)

      expect(mockReviewModel.deleteMany).toHaveBeenCalledWith({
        recipeId: new Types.ObjectId(VALID_ID)
      })
    })

    it("should throw BadRequestException for invalid recipe ID", async () => {
      await expect(service.deleteByRecipeId(INVALID_ID)).rejects.toThrow(
        BadRequestException
      )
    })
  })
})
