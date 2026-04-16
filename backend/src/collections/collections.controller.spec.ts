import { Test, TestingModule } from "@nestjs/testing"
import { CollectionsController } from "./collections.controller"
import { CollectionsService } from "./collections.service"

const mockService = {
  create: jest.fn(),
  findMine: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addRecipe: jest.fn(),
  removeRecipe: jest.fn()
}

describe("CollectionsController", () => {
  let controller: CollectionsController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionsController],
      providers: [{ provide: CollectionsService, useValue: mockService }]
    }).compile()
    controller = module.get<CollectionsController>(CollectionsController)
    jest.clearAllMocks()
  })

  it("create should call service.create", async () => {
    mockService.create.mockResolvedValue({ _id: "c1", name: "Test" })
    const result = await controller.create("user1", { name: "Test" })
    expect(mockService.create).toHaveBeenCalledWith("user1", { name: "Test" })
    expect(result).toEqual({ _id: "c1", name: "Test" })
  })

  it("findMine should call service.findMine", async () => {
    mockService.findMine.mockResolvedValue({ data: [], total: 0 })
    const result = await controller.findMine("user1", {})
    expect(mockService.findMine).toHaveBeenCalledWith("user1", 0, 20)
    expect(result).toEqual({ data: [], total: 0 })
  })

  it("findOne should call service.findOne", async () => {
    mockService.findOne.mockResolvedValue({ _id: "c1" })
    await controller.findOne("c1", "user1")
    expect(mockService.findOne).toHaveBeenCalledWith("c1", "user1")
  })

  it("addRecipe should call service.addRecipe", async () => {
    mockService.addRecipe.mockResolvedValue({ _id: "c1" })
    await controller.addRecipe("c1", "user1", { recipeId: "r1" })
    expect(mockService.addRecipe).toHaveBeenCalledWith("c1", "user1", "r1")
  })
})
