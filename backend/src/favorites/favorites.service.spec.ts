import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { NotFoundException, ConflictException } from "@nestjs/common"
import { Types } from "mongoose"
import { FavoritesService } from "./favorites.service"
import { Favorite } from "./entities/favorite.entity"
import { Recipe } from "../recipes/entities/recipe.entity"

const USER_ID = "507f1f77bcf86cd799439011"
const RECIPE_ID = "507f1f77bcf86cd799439012"
const OTHER_RECIPE_ID = "507f1f77bcf86cd799439013"

const mockRecipe = {
  _id: new Types.ObjectId(RECIPE_ID),
  title: "Tarte aux pommes"
}

const mockFavorite = {
  _id: new Types.ObjectId(),
  userId: new Types.ObjectId(USER_ID),
  recipeId: new Types.ObjectId(RECIPE_ID),
  createdAt: new Date()
}

const mockFavoriteModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),
  countDocuments: jest.fn(),
  find: jest.fn(),
  deleteMany: jest.fn()
}

const mockRecipeModel = {
  findById: jest.fn(),
  find: jest.fn()
}

describe("FavoritesService", () => {
  let service: FavoritesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel
        },
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel
        }
      ]
    }).compile()

    service = module.get<FavoritesService>(FavoritesService)
    jest.clearAllMocks()
  })

  describe("addFavorite", () => {
    it("should add a favorite and return result", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoriteModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })
      mockFavoriteModel.create.mockResolvedValue(mockFavorite)
      mockFavoriteModel.countDocuments.mockResolvedValue(1)

      const result = await service.addFavorite(USER_ID, RECIPE_ID)

      expect(result).toEqual({ favorited: true, favoritesCount: 1 })
      expect(mockRecipeModel.findById).toHaveBeenCalledWith(RECIPE_ID)
      expect(mockFavoriteModel.create).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        recipeId: expect.any(Types.ObjectId)
      })
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.addFavorite(USER_ID, RECIPE_ID)).rejects.toThrow(
        NotFoundException
      )
    })

    it("should throw ConflictException if already favorited", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoriteModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFavorite)
      })

      await expect(service.addFavorite(USER_ID, RECIPE_ID)).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe("removeFavorite", () => {
    it("should remove a favorite and return result", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoriteModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFavorite)
      })
      mockFavoriteModel.countDocuments.mockResolvedValue(0)

      const result = await service.removeFavorite(USER_ID, RECIPE_ID)

      expect(result).toEqual({ favorited: false, favoritesCount: 0 })
      expect(mockFavoriteModel.findOneAndDelete).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId),
        recipeId: expect.any(Types.ObjectId)
      })
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.removeFavorite(USER_ID, RECIPE_ID)
      ).rejects.toThrow(NotFoundException)
    })

    it("should throw NotFoundException if favorite not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoriteModel.findOneAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.removeFavorite(USER_ID, RECIPE_ID)
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("getUserFavorites", () => {
    it("should return paginated results with recipes", async () => {
      const favorites = [mockFavorite]
      const mockSortFn = jest.fn()
      const mockSkipFn = jest.fn()
      const mockLimitFn = jest.fn()

      mockLimitFn.mockReturnValue({
        exec: jest.fn().mockResolvedValue(favorites)
      })
      mockSkipFn.mockReturnValue({ limit: mockLimitFn })
      mockSortFn.mockReturnValue({ skip: mockSkipFn })
      mockFavoriteModel.find.mockReturnValue({ sort: mockSortFn })
      mockFavoriteModel.countDocuments.mockResolvedValue(1)
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe])
      })

      const result = await service.getUserFavorites(USER_ID, 0, 20)

      expect(result).toEqual({ data: [mockRecipe], total: 1 })
      expect(mockSortFn).toHaveBeenCalledWith({ createdAt: -1 })
      expect(mockSkipFn).toHaveBeenCalledWith(0)
      expect(mockLimitFn).toHaveBeenCalledWith(20)
    })

    it("should return empty results when no favorites", async () => {
      const mockSortFn = jest.fn()
      const mockSkipFn = jest.fn()
      const mockLimitFn = jest.fn()

      mockLimitFn.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      mockSkipFn.mockReturnValue({ limit: mockLimitFn })
      mockSortFn.mockReturnValue({ skip: mockSkipFn })
      mockFavoriteModel.find.mockReturnValue({ sort: mockSortFn })
      mockFavoriteModel.countDocuments.mockResolvedValue(0)
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })

      const result = await service.getUserFavorites(USER_ID)

      expect(result).toEqual({ data: [], total: 0 })
    })

    it("should clamp skip to minimum 0", async () => {
      const mockSortFn = jest.fn()
      const mockSkipFn = jest.fn()
      const mockLimitFn = jest.fn()

      mockLimitFn.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      mockSkipFn.mockReturnValue({ limit: mockLimitFn })
      mockSortFn.mockReturnValue({ skip: mockSkipFn })
      mockFavoriteModel.find.mockReturnValue({ sort: mockSortFn })
      mockFavoriteModel.countDocuments.mockResolvedValue(0)
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })

      await service.getUserFavorites(USER_ID, -5, 20)

      expect(mockSkipFn).toHaveBeenCalledWith(0)
    })

    it("should clamp limit to maximum 100", async () => {
      const mockSortFn = jest.fn()
      const mockSkipFn = jest.fn()
      const mockLimitFn = jest.fn()

      mockLimitFn.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      mockSkipFn.mockReturnValue({ limit: mockLimitFn })
      mockSortFn.mockReturnValue({ skip: mockSkipFn })
      mockFavoriteModel.find.mockReturnValue({ sort: mockSortFn })
      mockFavoriteModel.countDocuments.mockResolvedValue(0)
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })

      await service.getUserFavorites(USER_ID, 0, 200)

      expect(mockLimitFn).toHaveBeenCalledWith(100)
    })
  })

  describe("getFavoritesCount", () => {
    it("should return the count of favorites for a recipe", async () => {
      mockFavoriteModel.countDocuments.mockResolvedValue(5)

      const result = await service.getFavoritesCount(RECIPE_ID)

      expect(result).toBe(5)
      expect(mockFavoriteModel.countDocuments).toHaveBeenCalledWith({
        recipeId: expect.any(Types.ObjectId)
      })
    })

    it("should return 0 when no favorites exist", async () => {
      mockFavoriteModel.countDocuments.mockResolvedValue(0)

      const result = await service.getFavoritesCount(RECIPE_ID)

      expect(result).toBe(0)
    })
  })

  describe("isFavorited", () => {
    it("should return true when favorite exists", async () => {
      mockFavoriteModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockFavorite)
      })

      const result = await service.isFavorited(USER_ID, RECIPE_ID)

      expect(result).toBe(true)
    })

    it("should return false when favorite does not exist", async () => {
      mockFavoriteModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      const result = await service.isFavorited(USER_ID, RECIPE_ID)

      expect(result).toBe(false)
    })
  })

  describe("deleteByRecipeId", () => {
    it("should delete all favorites for a recipe", async () => {
      mockFavoriteModel.deleteMany.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 3 })
      })

      await service.deleteByRecipeId(RECIPE_ID)

      expect(mockFavoriteModel.deleteMany).toHaveBeenCalledWith({
        recipeId: expect.any(Types.ObjectId)
      })
    })
  })
})
