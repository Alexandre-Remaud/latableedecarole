import { Test, TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"
import type { Response } from "express"
import { RecipesController } from "./recipes.controller"
import { RecipesService } from "./recipes.service"
import { CreateRecipeDto } from "./dto/create-recipe.dto"
import { UpdateRecipeDto } from "./dto/update-recipe.dto"
import { Role } from "../auth/role.enum"

const VALID_ID = "507f1f77bcf86cd799439011"
const USER_ID = "507f1f77bcf86cd799439012"

const mockRecipe = {
  _id: VALID_ID,
  title: "Tarte aux pommes",
  description: "Une tarte classique",
  ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
  steps: [{ order: 1, instruction: "Éplucher les pommes" }],
  userId: USER_ID,
  favoritesCount: 0,
  isFavorited: false
}

const paginatedResult = { data: [mockRecipe], total: 1 }

const mockRecipesService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}

const mockConfigService = {
  get: jest.fn().mockReturnValue("http://localhost:5173")
}

describe("RecipesController", () => {
  let controller: RecipesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [
        {
          provide: RecipesService,
          useValue: mockRecipesService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ]
    }).compile()

    controller = module.get<RecipesController>(RecipesController)
    jest.clearAllMocks()
  })

  describe("create", () => {
    it("should delegate to service.create with userId", async () => {
      const dto: CreateRecipeDto = {
        title: "Tarte aux pommes",
        description: "Une tarte classique",
        ingredients: [{ name: "Pommes", quantity: 4, unit: "pièces" }],
        steps: [{ order: 1, instruction: "Éplucher les pommes" }]
      }
      mockRecipesService.create.mockResolvedValue(mockRecipe)

      const result = await controller.create(dto, USER_ID)

      expect(mockRecipesService.create).toHaveBeenCalledWith(dto, USER_ID)
      expect(result).toEqual(mockRecipe)
    })
  })

  describe("findAll", () => {
    it("should call service.findAll with defaults when no params", async () => {
      mockRecipesService.findAll.mockResolvedValue(paginatedResult)

      const result = await controller.findAll()

      expect(mockRecipesService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        0,
        20,
        undefined,
        undefined
      )
      expect(result).toEqual(paginatedResult)
    })

    it("should call service.findAll with category", async () => {
      mockRecipesService.findAll.mockResolvedValue(paginatedResult)

      await controller.findAll("dessert")

      expect(mockRecipesService.findAll).toHaveBeenCalledWith(
        "dessert",
        undefined,
        0,
        20,
        undefined,
        undefined
      )
    })

    it("should call service.findAll with search", async () => {
      mockRecipesService.findAll.mockResolvedValue(paginatedResult)

      await controller.findAll(undefined, "tarte")

      expect(mockRecipesService.findAll).toHaveBeenCalledWith(
        undefined,
        "tarte",
        0,
        20,
        undefined,
        undefined
      )
    })

    it("should parse skip and limit query params", async () => {
      mockRecipesService.findAll.mockResolvedValue(paginatedResult)

      await controller.findAll(undefined, undefined, "20", "10")

      expect(mockRecipesService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
        20,
        10,
        undefined,
        undefined
      )
    })

    it("should combine category, skip and limit", async () => {
      mockRecipesService.findAll.mockResolvedValue(paginatedResult)

      await controller.findAll("starter", undefined, "40", "20")

      expect(mockRecipesService.findAll).toHaveBeenCalledWith(
        "starter",
        undefined,
        40,
        20,
        undefined,
        undefined
      )
    })
  })

  describe("findOne", () => {
    it("should delegate to service.findOne with the id", async () => {
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)

      const result = await controller.findOne(VALID_ID, undefined)

      expect(mockRecipesService.findOne).toHaveBeenCalledWith(
        VALID_ID,
        undefined
      )
      expect(result).toEqual(mockRecipe)
    })
  })

  describe("update", () => {
    it("should delegate to service.update with the id and dto when owner", async () => {
      const dto: UpdateRecipeDto = { title: "Tarte revisitée" }
      const updated = { ...mockRecipe, ...dto }
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)
      mockRecipesService.update.mockResolvedValue(updated)

      const result = await controller.update(VALID_ID, dto, USER_ID, Role.USER)

      expect(mockRecipesService.findOne).toHaveBeenCalledWith(VALID_ID)
      expect(mockRecipesService.update).toHaveBeenCalledWith(VALID_ID, dto)
      expect(result).toEqual(updated)
    })

    it("should allow admin to update any recipe", async () => {
      const dto: UpdateRecipeDto = { title: "Admin update" }
      const updated = { ...mockRecipe, ...dto }
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)
      mockRecipesService.update.mockResolvedValue(updated)

      const result = await controller.update(
        VALID_ID,
        dto,
        "other-user-id",
        Role.ADMIN
      )

      expect(mockRecipesService.update).toHaveBeenCalledWith(VALID_ID, dto)
      expect(result).toEqual(updated)
    })
  })

  describe("remove", () => {
    it("should delegate to service.remove with the id when owner", async () => {
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)
      mockRecipesService.remove.mockResolvedValue(mockRecipe)

      const result = await controller.remove(VALID_ID, USER_ID, Role.USER)

      expect(mockRecipesService.findOne).toHaveBeenCalledWith(VALID_ID)
      expect(mockRecipesService.remove).toHaveBeenCalledWith(VALID_ID)
      expect(result).toEqual(mockRecipe)
    })

    it("should allow admin to delete any recipe", async () => {
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)
      mockRecipesService.remove.mockResolvedValue(mockRecipe)

      const result = await controller.remove(
        VALID_ID,
        "other-user-id",
        Role.ADMIN
      )

      expect(mockRecipesService.remove).toHaveBeenCalledWith(VALID_ID)
      expect(result).toEqual(mockRecipe)
    })
  })

  describe("getOpenGraph", () => {
    const sendMock = jest.fn<Response, [string]>()
    const setHeaderMock = jest.fn()
    let mockRes: Response

    beforeEach(() => {
      sendMock.mockClear()
      setHeaderMock.mockClear()
      mockRes = {
        setHeader: setHeaderMock,
        send: sendMock
      } as unknown as Response
    })

    function getSentHtml(): string {
      return sendMock.mock.calls[0][0]
    }

    it("should return HTML with OG meta tags and redirect", async () => {
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)

      await controller.getOpenGraph(VALID_ID, mockRes)

      expect(setHeaderMock).toHaveBeenCalledWith(
        "Content-Type",
        "text/html; charset=utf-8"
      )
      const html = getSentHtml()
      expect(html).toContain('og:title" content="Tarte aux pommes"')
      expect(html).toContain(
        `refresh" content="0;url=http://localhost:5173/recipes/${VALID_ID}"`
      )
    })

    it("should truncate description to 160 chars in OG meta", async () => {
      const longDesc = "A".repeat(200)
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        description: longDesc
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      const truncated = "A".repeat(157) + "..."
      expect(html).toContain(`og:description" content="${truncated}"`)
    })

    it("should return full description when <= 160 chars", async () => {
      mockRecipesService.findOne.mockResolvedValue(mockRecipe)

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).toContain('og:description" content="Une tarte classique"')
    })

    it("should return empty description when recipe has none", async () => {
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        description: undefined
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).toContain('og:description" content=""')
    })

    it("should prefer imageMediumUrl over imageUrl", async () => {
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        imageMediumUrl: "http://img.test/medium.jpg",
        imageUrl: "http://img.test/full.jpg"
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).toContain('og:image" content="http://img.test/medium.jpg"')
    })

    it("should fallback to imageUrl when no imageMediumUrl", async () => {
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        imageMediumUrl: undefined,
        imageUrl: "http://img.test/full.jpg"
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).toContain('og:image" content="http://img.test/full.jpg"')
    })

    it("should not include og:image when no images", async () => {
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        imageMediumUrl: undefined,
        imageUrl: undefined
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).not.toContain("og:image")
    })

    it("should escape HTML in recipe data", async () => {
      mockRecipesService.findOne.mockResolvedValue({
        ...mockRecipe,
        title: 'Tarte "aux" <pommes>'
      })

      await controller.getOpenGraph(VALID_ID, mockRes)

      const html = getSentHtml()
      expect(html).toContain("Tarte &quot;aux&quot; &lt;pommes&gt;")
      expect(html).not.toContain("<pommes>")
    })
  })
})
