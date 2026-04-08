import { Test, TestingModule } from "@nestjs/testing"
import { ReviewsController } from "./reviews.controller"
import { ReviewsService } from "./reviews.service"

const mockReviewsService = {
  createReview: jest.fn(),
  updateReview: jest.fn(),
  deleteReview: jest.fn(),
  getRecipeReviews: jest.fn()
}

describe("ReviewsController", () => {
  let controller: ReviewsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService
        }
      ]
    }).compile()

    controller = module.get<ReviewsController>(ReviewsController)
    jest.clearAllMocks()
  })

  describe("createReview", () => {
    it("should delegate to service with correct arguments", async () => {
      const dto = { rating: 4, comment: "Great" }
      const expected = { _id: "review-1", ...dto }
      mockReviewsService.createReview.mockResolvedValue(expected)

      const result = await controller.createReview("recipe-1", "user-1", dto)

      expect(mockReviewsService.createReview).toHaveBeenCalledWith(
        "user-1",
        "recipe-1",
        dto
      )
      expect(result).toEqual(expected)
    })
  })

  describe("updateReview", () => {
    it("should delegate to service with correct arguments", async () => {
      const dto = { rating: 5 }
      const expected = { _id: "review-1", rating: 5 }
      mockReviewsService.updateReview.mockResolvedValue(expected)

      const result = await controller.updateReview("review-1", "user-1", dto)

      expect(mockReviewsService.updateReview).toHaveBeenCalledWith(
        "user-1",
        "review-1",
        dto
      )
      expect(result).toEqual(expected)
    })
  })

  describe("deleteReview", () => {
    it("should delegate to service with userId and role", async () => {
      mockReviewsService.deleteReview.mockResolvedValue({ deleted: true })

      const result = await controller.deleteReview(
        "review-1",
        "user-1",
        "user"
      )

      expect(mockReviewsService.deleteReview).toHaveBeenCalledWith(
        "user-1",
        "user",
        "review-1"
      )
      expect(result).toEqual({ deleted: true })
    })
  })

  describe("getRecipeReviews", () => {
    it("should delegate to service with parsed skip and limit", async () => {
      const expected = { data: [], total: 0, averageRating: 0 }
      mockReviewsService.getRecipeReviews.mockResolvedValue(expected)

      const result = await controller.getRecipeReviews("recipe-1", {
        skip: "10",
        limit: "5"
      })

      expect(mockReviewsService.getRecipeReviews).toHaveBeenCalledWith(
        "recipe-1",
        10,
        5
      )
      expect(result).toEqual(expected)
    })

    it("should use defaults when skip and limit are not provided", async () => {
      const expected = { data: [], total: 0, averageRating: 0 }
      mockReviewsService.getRecipeReviews.mockResolvedValue(expected)

      await controller.getRecipeReviews("recipe-1", {})

      expect(mockReviewsService.getRecipeReviews).toHaveBeenCalledWith(
        "recipe-1",
        0,
        20
      )
    })
  })
})
