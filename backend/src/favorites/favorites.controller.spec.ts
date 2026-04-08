import { Test, TestingModule } from "@nestjs/testing"
import { FavoritesController } from "./favorites.controller"
import { FavoritesService } from "./favorites.service"

const RECIPE_ID = "507f1f77bcf86cd799439012"
const USER_ID = "507f1f77bcf86cd799439011"

const mockFavoritesService = {
  addFavorite: jest.fn(),
  removeFavorite: jest.fn()
}

describe("FavoritesController", () => {
  let controller: FavoritesController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: mockFavoritesService
        }
      ]
    }).compile()

    controller = module.get<FavoritesController>(FavoritesController)
    jest.clearAllMocks()
  })

  describe("addFavorite", () => {
    it("should delegate to service.addFavorite with correct params", async () => {
      const expectedResult = { favorited: true, favoritesCount: 1 }
      mockFavoritesService.addFavorite.mockResolvedValue(expectedResult)

      const result = await controller.addFavorite(RECIPE_ID, USER_ID)

      expect(mockFavoritesService.addFavorite).toHaveBeenCalledWith(
        USER_ID,
        RECIPE_ID
      )
      expect(result).toEqual(expectedResult)
    })
  })

  describe("removeFavorite", () => {
    it("should delegate to service.removeFavorite with correct params", async () => {
      const expectedResult = { favorited: false, favoritesCount: 0 }
      mockFavoritesService.removeFavorite.mockResolvedValue(expectedResult)

      const result = await controller.removeFavorite(RECIPE_ID, USER_ID)

      expect(mockFavoritesService.removeFavorite).toHaveBeenCalledWith(
        USER_ID,
        RECIPE_ID
      )
      expect(result).toEqual(expectedResult)
    })
  })
})
