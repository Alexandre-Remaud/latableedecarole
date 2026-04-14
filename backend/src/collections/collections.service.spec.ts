import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import {
  NotFoundException,
  ConflictException,
  ForbiddenException
} from "@nestjs/common"
import { Types } from "mongoose"
import { CollectionsService } from "./collections.service"
import { Collection } from "./entities/collection.entity"
import { Recipe } from "../recipes/entities/recipe.entity"

const USER_ID = "507f1f77bcf86cd799439011"
const OTHER_ID = "507f1f77bcf86cd799439099"
const RECIPE_ID = "507f1f77bcf86cd799439012"
const COLL_ID = "507f1f77bcf86cd799439013"

const mockCollection = {
  _id: new Types.ObjectId(COLL_ID),
  userId: new Types.ObjectId(USER_ID),
  name: "Ma collection",
  description: undefined,
  isPublic: false,
  recipeIds: [],
  coverImage: undefined,
  save: jest.fn().mockResolvedValue(undefined),
  toObject: jest.fn().mockReturnThis()
}

const mockRecipe = { _id: new Types.ObjectId(RECIPE_ID) }

const mockCollectionModel = {
  create: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findByIdAndDelete: jest.fn()
}

const mockRecipeModel = {
  findById: jest.fn(),
  find: jest.fn()
}

describe("CollectionsService", () => {
  let service: CollectionsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionsService,
        {
          provide: getModelToken(Collection.name),
          useValue: mockCollectionModel
        },
        { provide: getModelToken(Recipe.name), useValue: mockRecipeModel }
      ]
    }).compile()
    service = module.get<CollectionsService>(CollectionsService)
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should create and return a collection", async () => {
      mockCollectionModel.create.mockResolvedValue(mockCollection)
      const result = await service.create(USER_ID, { name: "Ma collection" })
      expect(mockCollectionModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Ma collection" })
      )
      expect(result).toBe(mockCollection)
    })
  })

  describe("findMine", () => {
    it("should return paginated user collections", async () => {
      mockCollectionModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCollection])
      })
      mockCollectionModel.countDocuments.mockResolvedValue(1)
      const result = await service.findMine(USER_ID, 0, 20)
      expect(result).toEqual({ data: [mockCollection], total: 1 })
    })
  })

  describe("findOne", () => {
    it("should return collection if public", async () => {
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockCollection, isPublic: true })
      })
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe])
      })
      const result = await service.findOne(COLL_ID, undefined)
      expect(result).toBeDefined()
    })

    it("should throw 403 if private and not owner", async () => {
      mockCollectionModel.findById.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockCollection, isPublic: false })
      })
      await expect(service.findOne(COLL_ID, OTHER_ID)).rejects.toThrow(
        ForbiddenException
      )
    })

    it("should throw 404 if not found", async () => {
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })
      await expect(service.findOne(COLL_ID, USER_ID)).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe("update", () => {
    it("should throw 403 if not owner", async () => {
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCollection)
      })
      await expect(
        service.update(COLL_ID, OTHER_ID, { name: "X" })
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe("remove", () => {
    it("should throw 403 if not owner", async () => {
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCollection)
      })
      await expect(service.remove(COLL_ID, OTHER_ID)).rejects.toThrow(
        ForbiddenException
      )
    })
  })

  describe("addRecipe", () => {
    it("should throw 409 if recipe already in collection", async () => {
      const collWithRecipe = {
        ...mockCollection,
        recipeIds: [new Types.ObjectId(RECIPE_ID)],
        save: jest.fn()
      }
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(collWithRecipe)
      })
      mockRecipeModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockRecipe)
      })
      await expect(
        service.addRecipe(COLL_ID, USER_ID, RECIPE_ID)
      ).rejects.toThrow(ConflictException)
    })
  })

  describe("removeRecipe", () => {
    it("should remove recipe from collection", async () => {
      const collWithRecipe = {
        ...mockCollection,
        recipeIds: [new Types.ObjectId(RECIPE_ID)],
        save: jest.fn().mockResolvedValue(undefined)
      }
      mockCollectionModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(collWithRecipe)
      })
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      })
      await service.removeRecipe(COLL_ID, USER_ID, RECIPE_ID)
      expect(collWithRecipe.save).toHaveBeenCalled()
    })
  })
})
