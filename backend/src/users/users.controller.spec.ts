import { Test, TestingModule } from "@nestjs/testing"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { FavoritesService } from "../favorites/favorites.service"

describe("UsersController", () => {
  let controller: UsersController
  let usersService: Record<string, jest.Mock>
  let favoritesService: Record<string, jest.Mock>

  beforeEach(async () => {
    usersService = {
      getPublicProfile: jest.fn(),
      getUserRecipes: jest.fn(),
      updateProfile: jest.fn(),
      changeEmail: jest.fn(),
      changePassword: jest.fn()
    }

    favoritesService = {
      getUserFavorites: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: FavoritesService, useValue: favoritesService }
      ]
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  describe("getPublicProfile", () => {
    it("should call usersService.getPublicProfile with id", async () => {
      const profile = { id: "123", name: "Alice", recipesCount: 3 }
      usersService.getPublicProfile.mockResolvedValue(profile)

      const result = await controller.getPublicProfile("123")

      expect(usersService.getPublicProfile).toHaveBeenCalledWith("123")
      expect(result).toEqual(profile)
    })
  })

  describe("getUserRecipes", () => {
    it("should call usersService.getUserRecipes with parsed params", async () => {
      const recipes = { data: [], total: 0 }
      usersService.getUserRecipes.mockResolvedValue(recipes)

      const result = await controller.getUserRecipes("user-id", "10", "5")

      expect(usersService.getUserRecipes).toHaveBeenCalledWith("user-id", 10, 5)
      expect(result).toEqual(recipes)
    })

    it("should use default skip and limit when not provided", async () => {
      usersService.getUserRecipes.mockResolvedValue({ data: [], total: 0 })

      await controller.getUserRecipes("user-id")

      expect(usersService.getUserRecipes).toHaveBeenCalledWith("user-id", 0, 20)
    })
  })

  describe("updateProfile", () => {
    it("should call usersService.updateProfile with userId and dto", async () => {
      const dto = { name: "Bob", bio: "Hi" }
      const updated = { _id: "user-id", name: "Bob", bio: "Hi" }
      usersService.updateProfile.mockResolvedValue(updated)

      const result = await controller.updateProfile("user-id", dto)

      expect(usersService.updateProfile).toHaveBeenCalledWith("user-id", dto)
      expect(result).toEqual(updated)
    })
  })

  describe("changeEmail", () => {
    it("should call usersService.changeEmail with userId and dto", async () => {
      const dto = { newEmail: "new@example.com", password: "Password1" }
      const response = { message: "Email mis à jour avec succès" }
      usersService.changeEmail.mockResolvedValue(response)

      const result = await controller.changeEmail("user-id", dto)

      expect(usersService.changeEmail).toHaveBeenCalledWith("user-id", dto)
      expect(result).toEqual(response)
    })
  })

  describe("changePassword", () => {
    it("should call usersService.changePassword with userId and dto", async () => {
      const dto = { currentPassword: "Old1", newPassword: "New1" }
      const response = { message: "Mot de passe mis à jour avec succès" }
      usersService.changePassword.mockResolvedValue(response)

      const result = await controller.changePassword("user-id", dto)

      expect(usersService.changePassword).toHaveBeenCalledWith("user-id", dto)
      expect(result).toEqual(response)
    })
  })
})
