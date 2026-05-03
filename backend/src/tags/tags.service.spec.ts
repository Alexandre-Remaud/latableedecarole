import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import type { PipelineStage } from "mongoose"
import { TagsService } from "./tags.service"
import { Recipe } from "../recipes/entities/recipe.entity"

const mockRecipeModel = {
  aggregate: jest.fn(),
  updateMany: jest.fn()
}

describe("TagsService", () => {
  let service: TagsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        {
          provide: getModelToken(Recipe.name),
          useValue: mockRecipeModel
        }
      ]
    }).compile()

    service = module.get<TagsService>(TagsService)
    jest.clearAllMocks()
  })

  describe("findAll", () => {
    it("should run aggregation pipeline and return tags with count", async () => {
      const mockResult = [
        { name: "végétarien", count: 5 },
        { name: "rapide", count: 3 }
      ]
      mockRecipeModel.aggregate.mockResolvedValue(mockResult)

      const result = await service.findAll(20)

      expect(mockRecipeModel.aggregate).toHaveBeenCalledWith([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
        { $project: { _id: 0, name: "$_id", count: 1 } }
      ])
      expect(result).toEqual(mockResult)
    })

    it("should cap limit at 100", async () => {
      mockRecipeModel.aggregate.mockResolvedValue([])

      await service.findAll(200)

      const pipeline = (
        mockRecipeModel.aggregate.mock.calls as unknown as [PipelineStage[]][]
      )[0][0]
      const limitStage = pipeline.find((s: PipelineStage) => "$limit" in s) as
        | { $limit: number }
        | undefined
      expect(limitStage?.$limit).toBe(100)
    })
  })

  describe("findPopular", () => {
    it("should call findAll with limit 20", async () => {
      mockRecipeModel.aggregate.mockResolvedValue([])

      await service.findPopular()

      const pipeline = (
        mockRecipeModel.aggregate.mock.calls as unknown as [PipelineStage[]][]
      )[0][0]
      const limitStage = pipeline.find((s: PipelineStage) => "$limit" in s) as
        | { $limit: number }
        | undefined
      expect(limitStage?.$limit).toBe(20)
    })
  })

  describe("remove", () => {
    it("should pull tag from all recipes and return affected count", async () => {
      mockRecipeModel.updateMany.mockResolvedValue({ modifiedCount: 3 })

      const result = await service.remove("végétarien")

      expect(mockRecipeModel.updateMany).toHaveBeenCalledWith(
        { tags: "végétarien" },
        { $pull: { tags: "végétarien" } }
      )
      expect(result).toEqual({
        message: 'Tag "végétarien" supprimé',
        affectedRecipes: 3
      })
    })
  })
})
