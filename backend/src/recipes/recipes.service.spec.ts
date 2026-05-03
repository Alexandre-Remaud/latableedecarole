import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { RecipesService } from "./recipes.service"
import { Recipe } from "./entities/recipe.entity"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { UploadService } from "../upload/upload.service"
import { FavoritesService } from "../favorites/favorites.service"
import { ReviewsService } from "../reviews/reviews.service"

const VALID_ID = "507f1f77bcf86cd799439011"
const INVALID_ID = "not-a-valid-id"

const mockRecipe = {
  _id: VALID_ID,
  title: "Tarte aux pommes",
  description: "Une tarte classique",
  ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
  steps: [{ order: 1, instruction: "Éplucher les pommes" }],
  difficulty: "easy" as const,
  category: "dessert" as const
}

const mockLimitFn = jest.fn()
const mockSkipFn = jest.fn()

const mockSortFn = jest.fn()

function withToObject<T>(obj: T) {
  return { ...obj, toObject: () => obj }
}

function mockFind(results: unknown[]) {
  const docs = results.map((r) => withToObject(r))
  mockLimitFn.mockReturnValue({ exec: jest.fn().mockResolvedValue(docs) })
  mockSkipFn.mockReturnValue({ limit: mockLimitFn })
  mockSortFn.mockReturnValue({ skip: mockSkipFn })
  return { sort: mockSortFn }
}

const mockRecipeModel = {
  create: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
}

const mockUploadService = {
  upload: jest.fn(),
  delete: jest.fn(),
  deleteByPublicId: jest.fn()
}

const mockFavoritesService = {
  getFavoritesCount: jest.fn(),
  isFavorited: jest.fn(),
  deleteByRecipeId: jest.fn()
}

const mockReviewsService = {
  deleteByRecipeId: jest.fn()
}

describe("RecipesService", () => {
  let service: RecipesService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel
        },
        {
          provide: UploadService,
          useValue: mockUploadService
        },
        {
          provide: FavoritesService,
          useValue: mockFavoritesService
        },
        {
          provide: ReviewsService,
          useValue: mockReviewsService
        }
      ]
    }).compile()

    service = module.get<RecipesService>(RecipesService)
    jest.clearAllMocks()
    mockSortFn.mockReset()
    mockSkipFn.mockReset()
    mockLimitFn.mockReset()
    mockFavoritesService.getFavoritesCount.mockResolvedValue(0)
    mockFavoritesService.isFavorited.mockResolvedValue(false)
    mockReviewsService.deleteByRecipeId.mockResolvedValue(undefined)
  })

  describe("create", () => {
    it("should create a recipe", async () => {
      const dto: CreateRecipeDto = {
        title: "Tarte aux pommes",
        description: "Une tarte classique",
        ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
        steps: [{ order: 1, instruction: "Éplucher les pommes" }]
      }
      const userId = "507f1f77bcf86cd799439012"
      const createdRecipe = { ...mockRecipe, userId }
      mockRecipeModel.create.mockResolvedValue(createdRecipe)

      const result = await service.create(dto, userId)

      expect(mockRecipeModel.create).toHaveBeenCalled()
      const calls = mockRecipeModel.create.mock.calls as unknown as Array<
        [{ title: string; description: string; userId?: unknown }]
      >
      const callArgs = calls[0][0]
      expect(callArgs.title).toBe(dto.title)
      expect(callArgs.description).toBe(dto.description)
      expect(callArgs.userId).toBeDefined()
      expect(result).toEqual(createdRecipe)
    })

    it("should normalize tags to lowercase and trimmed", async () => {
      const dto: CreateRecipeDto = {
        ...mockRecipe,
        tags: ["  Végétarien ", "RAPIDE"]
      }
      mockRecipeModel.create.mockResolvedValue({ ...dto, _id: VALID_ID })

      await service.create(dto, VALID_ID)

      expect(mockRecipeModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ tags: ["végétarien", "rapide"] })
      )
    })
  })

  describe("findAll", () => {
    it("should return paginated recipes with total when no category", async () => {
      const recipes = [mockRecipe]
      mockRecipeModel.find.mockReturnValue(mockFind(recipes))
      mockRecipeModel.countDocuments.mockResolvedValue(1)

      const result = await service.findAll()

      expect(mockRecipeModel.find).toHaveBeenCalledWith({})
      expect(mockRecipeModel.countDocuments).toHaveBeenCalledWith({})
      expect(result).toEqual({
        data: recipes.map((r) => ({
          ...r,
          favoritesCount: 0,
          isFavorited: false
        })),
        total: 1
      })
    })

    it("should filter by category and return paginated result", async () => {
      const recipes = [mockRecipe]
      mockRecipeModel.find.mockReturnValue(mockFind(recipes))
      mockRecipeModel.countDocuments.mockResolvedValue(1)

      const result = await service.findAll("dessert")

      expect(mockRecipeModel.find).toHaveBeenCalledWith({ category: "dessert" })
      expect(mockRecipeModel.countDocuments).toHaveBeenCalledWith({
        category: "dessert"
      })
      expect(result).toEqual({
        data: recipes.map((r) => ({
          ...r,
          favoritesCount: 0,
          isFavorited: false
        })),
        total: 1
      })
    })

    it("should apply skip and limit", async () => {
      mockRecipeModel.find.mockReturnValue(mockFind([]))
      mockRecipeModel.countDocuments.mockResolvedValue(50)

      await service.findAll(undefined, undefined, 20, 20)

      expect(mockSkipFn).toHaveBeenCalledWith(20)
      expect(mockLimitFn).toHaveBeenCalledWith(20)
    })

    it("should return empty data when no recipes match", async () => {
      mockRecipeModel.find.mockReturnValue(mockFind([]))
      mockRecipeModel.countDocuments.mockResolvedValue(0)

      const result = await service.findAll("beverage")

      expect(result).toEqual({ data: [], total: 0 })
    })

    it("should filter by tags using $in when tags provided", async () => {
      mockRecipeModel.find.mockReturnValue(mockFind([mockRecipe]))
      mockRecipeModel.countDocuments.mockResolvedValue(1)

      await service.findAll(undefined, undefined, 0, 20, undefined, [
        "végétarien"
      ])

      expect(mockRecipeModel.find).toHaveBeenCalledWith({
        tags: { $in: ["végétarien"] }
      })
    })

    it("should combine tags filter with category filter", async () => {
      mockRecipeModel.find.mockReturnValue(mockFind([mockRecipe]))
      mockRecipeModel.countDocuments.mockResolvedValue(1)

      await service.findAll("dessert", undefined, 0, 20, undefined, ["rapide"])

      expect(mockRecipeModel.find).toHaveBeenCalledWith({
        category: "dessert",
        tags: { $in: ["rapide"] }
      })
    })
  })

  describe("findOne", () => {
    it("should return a recipe by id with favorites data", async () => {
      const recipeWithToObject = {
        ...mockRecipe,
        toObject: jest.fn().mockReturnValue(mockRecipe)
      }
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipeWithToObject)
      })
      mockFavoritesService.getFavoritesCount.mockResolvedValue(3)
      mockFavoritesService.isFavorited.mockResolvedValue(false)

      const result = await service.findOne(VALID_ID)

      expect(mockRecipeModel.findById).toHaveBeenCalledWith(VALID_ID)
      expect(result).toEqual({
        ...mockRecipe,
        favoritesCount: 3,
        isFavorited: false
      })
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.findOne(VALID_ID)).rejects.toThrow(NotFoundException)
    })

    it("should throw BadRequestException if id is invalid", async () => {
      await expect(service.findOne(INVALID_ID)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe("update", () => {
    it("should update and return the recipe", async () => {
      const dto: UpdateRecipeDto = { title: "Tarte revisitée" }
      const mockSave = jest.fn().mockResolvedValue(undefined)
      const existingRecipe = { ...mockRecipe, save: mockSave }
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingRecipe)
      })

      const result = await service.update(VALID_ID, dto)

      expect(mockRecipeModel.findById).toHaveBeenCalledWith(VALID_ID)
      expect(mockSave).toHaveBeenCalled()
      expect(result).toMatchObject({ title: "Tarte revisitée" })
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.update(VALID_ID, { title: "Test" })).rejects.toThrow(
        NotFoundException
      )
    })

    it("should throw BadRequestException if id is invalid", async () => {
      await expect(
        service.update(INVALID_ID, { title: "Test" })
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe("remove", () => {
    it("should delete and return the recipe", async () => {
      mockRecipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoritesService.deleteByRecipeId.mockResolvedValue(undefined)

      const result = await service.remove(VALID_ID)

      expect(mockRecipeModel.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID)
      expect(mockFavoritesService.deleteByRecipeId).toHaveBeenCalledWith(
        VALID_ID
      )
      expect(result).toEqual(mockRecipe)
    })

    it("should delete associated image when recipe has imagePublicId", async () => {
      const recipeWithImage = { ...mockRecipe, imagePublicId: "some-uuid" }
      mockRecipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipeWithImage)
      })
      mockUploadService.deleteByPublicId.mockResolvedValue(undefined)
      mockFavoritesService.deleteByRecipeId.mockResolvedValue(undefined)

      await service.remove(VALID_ID)

      expect(mockUploadService.deleteByPublicId).toHaveBeenCalledWith(
        "some-uuid"
      )
    })

    it("should not call uploadService when recipe has no image", async () => {
      mockRecipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      mockFavoritesService.deleteByRecipeId.mockResolvedValue(undefined)

      await service.remove(VALID_ID)

      expect(mockUploadService.deleteByPublicId).not.toHaveBeenCalled()
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findByIdAndDelete.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException)
    })

    it("should throw BadRequestException if id is invalid", async () => {
      await expect(service.remove(INVALID_ID)).rejects.toThrow(
        BadRequestException
      )
    })
  })
})
