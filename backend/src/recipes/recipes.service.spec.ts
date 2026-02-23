import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { BadRequestException, NotFoundException } from "@nestjs/common"
import { RecipesService } from "./recipes.service"
import { Recipe } from "./entities/recipe.entity"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"

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

const mockRecipeModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn()
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
        }
      ]
    }).compile()

    service = module.get<RecipesService>(RecipesService)
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should create a recipe", async () => {
      const dto: CreateRecipeDto = {
        title: "Tarte aux pommes",
        description: "Une tarte classique",
        ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
        steps: [{ order: 1, instruction: "Éplucher les pommes" }]
      }
      mockRecipeModel.create.mockResolvedValue(mockRecipe)

      const result = await service.create(dto)

      expect(mockRecipeModel.create).toHaveBeenCalledWith(dto)
      expect(result).toEqual(mockRecipe)
    })
  })

  describe("findAll", () => {
    it("should return all recipes when no category is provided", async () => {
      const recipes = [mockRecipe]
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipes)
      })

      const result = await service.findAll()

      expect(mockRecipeModel.find).toHaveBeenCalledWith({})
      expect(result).toEqual(recipes)
    })

    it("should filter recipes by category when provided", async () => {
      const recipes = [mockRecipe]
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(recipes)
      })

      const result = await service.findAll("dessert")

      expect(mockRecipeModel.find).toHaveBeenCalledWith({
        category: "dessert"
      })
      expect(result).toEqual(recipes)
    })

    it("should return empty array when no recipes match the category", async () => {
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })

      const result = await service.findAll("beverage")

      expect(mockRecipeModel.find).toHaveBeenCalledWith({
        category: "beverage"
      })
      expect(result).toEqual([])
    })
  })

  describe("findOne", () => {
    it("should return a recipe by id", async () => {
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })

      const result = await service.findOne(VALID_ID)

      expect(mockRecipeModel.findById).toHaveBeenCalledWith(VALID_ID)
      expect(result).toEqual(mockRecipe)
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
      const updated = { ...mockRecipe, ...dto }
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updated)
      })

      const result = await service.update(VALID_ID, dto)

      expect(mockRecipeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        VALID_ID,
        dto,
        { new: true }
      )
      expect(result).toEqual(updated)
    })

    it("should throw NotFoundException if recipe not found", async () => {
      mockRecipeModel.findByIdAndUpdate.mockReturnValue({
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

      const result = await service.remove(VALID_ID)

      expect(mockRecipeModel.findByIdAndDelete).toHaveBeenCalledWith(VALID_ID)
      expect(result).toEqual(mockRecipe)
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
