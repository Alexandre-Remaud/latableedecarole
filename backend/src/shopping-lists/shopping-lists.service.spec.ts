import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import { NotFoundException, ForbiddenException } from "@nestjs/common"
import { Types } from "mongoose"
import { ShoppingListsService } from "./shopping-lists.service"
import { ShoppingList } from "./entities/shopping-list.entity"
import { Recipe } from "../recipes/entities/recipe.entity"

const USER_ID = "507f1f77bcf86cd799439011"
const LIST_ID = "507f1f77bcf86cd799439012"
const RECIPE_ID = "507f1f77bcf86cd799439013"
const ITEM_ID = new Types.ObjectId()

const mockRecipe = {
  _id: new Types.ObjectId(RECIPE_ID),
  title: "Tarte aux pommes",
  servings: 4,
  ingredients: [
    { name: "Farine", quantity: 200, unit: "g" },
    { name: "Sucre", quantity: 100, unit: "g" },
    { name: "Sel", quantity: 0, unit: "" }
  ]
}

const mockList = {
  _id: new Types.ObjectId(LIST_ID),
  userId: new Types.ObjectId(USER_ID),
  name: "Ma liste",
  items: [
    { _id: ITEM_ID, name: "Farine", quantity: 200, unit: "g", checked: false }
  ],
  recipeIds: [new Types.ObjectId(RECIPE_ID)],
  servingsOverrides: [],
  save: jest.fn().mockResolvedValue(undefined)
}

const mockShoppingListModel = {
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  updateOne: jest.fn()
}

const mockRecipeModel = {
  find: jest.fn()
}

describe("ShoppingListsService", () => {
  let service: ShoppingListsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingListsService,
        {
          provide: getModelToken(ShoppingList.name),
          useValue: mockShoppingListModel
        },
        { provide: getModelToken(Recipe.name), useValue: mockRecipeModel }
      ]
    }).compile()

    service = module.get<ShoppingListsService>(ShoppingListsService)
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should aggregate ingredients and create list", async () => {
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe])
      })
      mockShoppingListModel.create.mockResolvedValue(mockList)

      const result = await service.create(USER_ID, {
        name: "Ma liste",
        recipeIds: [RECIPE_ID]
      })

      expect(mockShoppingListModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Ma liste",
          userId: expect.any(Types.ObjectId)
        })
      )
      expect(result).toBe(mockList)
    })

    it("should apply servings ratio to quantities", async () => {
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe]) // servings: 4
      })
      mockShoppingListModel.create.mockImplementation(
        (data: { items: { name: string; quantity?: number }[] }) =>
          Promise.resolve(data)
      )

      const result = (await service.create(USER_ID, {
        name: "Ma liste",
        recipeIds: [RECIPE_ID],
        servingsOverrides: [{ recipeId: RECIPE_ID, servings: 8 }] // x2
      })) as { items: { name: string; quantity?: number }[] }

      const farine = result.items.find((i) => i.name === "Farine")
      expect(farine?.quantity).toBe(400) // 200 * (8/4)
    })

    it("should deduplicate same name + unit across recipes", async () => {
      const recipe2 = {
        ...mockRecipe,
        _id: new Types.ObjectId(),
        ingredients: [{ name: "Farine", quantity: 100, unit: "g" }]
      }
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe, recipe2])
      })
      mockShoppingListModel.create.mockImplementation(
        (data: { items: { name: string; quantity?: number }[] }) =>
          Promise.resolve(data)
      )

      const result = (await service.create(USER_ID, {
        name: "Ma liste",
        recipeIds: [RECIPE_ID, recipe2._id.toString()]
      })) as { items: { name: string; quantity?: number }[] }

      const farineItems = result.items.filter(
        (i) => i.name.toLowerCase() === "farine"
      )
      expect(farineItems).toHaveLength(1)
      expect(farineItems[0].quantity).toBe(300) // 200 + 100
    })

    it("should deduplicate no-unit items without summing", async () => {
      const recipe2 = {
        ...mockRecipe,
        _id: new Types.ObjectId(),
        ingredients: [{ name: "Sel", quantity: 0, unit: "" }]
      }
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe, recipe2])
      })
      mockShoppingListModel.create.mockImplementation(
        (data: { items: { name: string; quantity?: number }[] }) =>
          Promise.resolve(data)
      )

      const result = (await service.create(USER_ID, {
        name: "Ma liste",
        recipeIds: [RECIPE_ID, recipe2._id.toString()]
      })) as { items: { name: string; quantity?: number }[] }

      const selItems = result.items.filter(
        (i) => i.name.toLowerCase() === "sel"
      )
      expect(selItems).toHaveLength(1)
    })

    it("should sort items alphabetically", async () => {
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe])
      })
      mockShoppingListModel.create.mockImplementation(
        (data: { items: { name: string }[] }) => Promise.resolve(data)
      )

      const result = (await service.create(USER_ID, {
        name: "Ma liste",
        recipeIds: [RECIPE_ID]
      })) as { items: { name: string }[] }

      const names = result.items.map((i) => i.name)
      expect(names).toEqual(
        [...names].sort((a, b) =>
          a.localeCompare(b, "fr", { sensitivity: "base" })
        )
      )
    })
  })

  describe("findAll", () => {
    it("should return lists for the user", async () => {
      const mockSortFn = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockList])
      })
      mockShoppingListModel.find.mockReturnValue({ sort: mockSortFn })

      const result = await service.findAll(USER_ID)

      expect(mockShoppingListModel.find).toHaveBeenCalledWith({
        userId: expect.any(Types.ObjectId)
      })
      expect(result).toEqual({ data: [mockList], total: 1 })
    })
  })

  describe("findOne", () => {
    it("should return the list if owner", async () => {
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockList)
      })

      const result = await service.findOne(USER_ID, LIST_ID)

      expect(result).toBe(mockList)
    })

    it("should throw NotFoundException if not found", async () => {
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(service.findOne(USER_ID, LIST_ID)).rejects.toThrow(
        NotFoundException
      )
    })

    it("should throw ForbiddenException if not owner", async () => {
      const otherList = { ...mockList, userId: new Types.ObjectId() }
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(otherList)
      })

      await expect(service.findOne(USER_ID, LIST_ID)).rejects.toThrow(
        ForbiddenException
      )
    })
  })

  describe("rename", () => {
    it("should rename the list", async () => {
      const saveMock = jest
        .fn()
        .mockResolvedValue({ ...mockList, name: "Nouveau nom" })
      const listWithSave = { ...mockList, name: "Ma liste", save: saveMock }
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(listWithSave)
      })

      const result = await service.rename(USER_ID, LIST_ID, "Nouveau nom")

      expect(saveMock).toHaveBeenCalled()
      expect(listWithSave.name).toBe("Nouveau nom")
      expect(result).toBe(listWithSave)
    })
  })

  describe("addRecipe", () => {
    it("should add recipe and re-aggregate", async () => {
      const NEW_RECIPE_ID = new Types.ObjectId().toString()
      const newRecipe = {
        _id: new Types.ObjectId(NEW_RECIPE_ID),
        servings: 2,
        ingredients: [{ name: "Beurre", quantity: 50, unit: "g" }]
      }
      const listWithSave = {
        ...mockList,
        recipeIds: [new Types.ObjectId(RECIPE_ID)],
        servingsOverrides: [],
        save: jest.fn().mockResolvedValue(undefined)
      }
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(listWithSave)
      })
      mockRecipeModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockRecipe, newRecipe])
      })

      await service.addRecipe(USER_ID, LIST_ID, { recipeId: NEW_RECIPE_ID })

      expect(listWithSave.save).toHaveBeenCalled()
      const names = (listWithSave.items as { name: string }[]).map(
        (i) => i.name
      )
      expect(names).toContain("Beurre")
    })
  })

  describe("toggleItem", () => {
    it("should toggle item checked status", async () => {
      mockShoppingListModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 })
      })
      const updatedList = { ...mockList }
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedList)
      })

      const result = await service.toggleItem(
        USER_ID,
        LIST_ID,
        ITEM_ID.toString(),
        true
      )

      expect(mockShoppingListModel.updateOne).toHaveBeenCalledWith(
        { _id: expect.any(Types.ObjectId), userId: expect.any(Types.ObjectId) },
        { $set: { "items.$[item].checked": true } },
        { arrayFilters: [{ "item._id": expect.any(Types.ObjectId) }] }
      )
      expect(result).toBe(updatedList)
    })
  })

  describe("remove", () => {
    it("should delete the list", async () => {
      const deleteMock = jest.fn().mockResolvedValue(undefined)
      const listWithDelete = { ...mockList, deleteOne: deleteMock }
      mockShoppingListModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(listWithDelete)
      })

      const result = await service.remove(USER_ID, LIST_ID)

      expect(deleteMock).toHaveBeenCalled()
      expect(result).toEqual({ message: "Liste supprimée" })
    })
  })
})
