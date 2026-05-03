import { Test, TestingModule } from "@nestjs/testing"
import { TagsController } from "./tags.controller"
import { TagsService } from "./tags.service"

const mockTagsService = {
  findAll: jest.fn(),
  findPopular: jest.fn(),
  remove: jest.fn()
}

describe("TagsController", () => {
  let controller: TagsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [{ provide: TagsService, useValue: mockTagsService }]
    }).compile()

    controller = module.get<TagsController>(TagsController)
    jest.clearAllMocks()
  })

  describe("findAll", () => {
    it("should call service.findAll with default limit 20", async () => {
      mockTagsService.findAll.mockResolvedValue([])
      await controller.findAll(undefined)
      expect(mockTagsService.findAll).toHaveBeenCalledWith(20)
    })

    it("should call service.findAll with parsed limit when provided", async () => {
      mockTagsService.findAll.mockResolvedValue([])
      await controller.findAll("50")
      expect(mockTagsService.findAll).toHaveBeenCalledWith(50)
    })
  })

  describe("findPopular", () => {
    it("should call service.findPopular", async () => {
      mockTagsService.findPopular.mockResolvedValue([])
      await controller.findPopular()
      expect(mockTagsService.findPopular).toHaveBeenCalled()
    })
  })

  describe("remove", () => {
    it("should call service.remove with tag name", async () => {
      mockTagsService.remove.mockResolvedValue({
        message: 'Tag "végétarien" supprimé',
        affectedRecipes: 2
      })
      const result = await controller.remove("végétarien")
      expect(mockTagsService.remove).toHaveBeenCalledWith("végétarien")
      expect(result).toEqual({
        message: 'Tag "végétarien" supprimé',
        affectedRecipes: 2
      })
    })
  })
})
