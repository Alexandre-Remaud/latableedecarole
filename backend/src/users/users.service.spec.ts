import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ConflictException
} from "@nestjs/common"
import * as bcrypt from "bcrypt"
import { Types } from "mongoose"
import { UsersService } from "./users.service"
import { User } from "./entities/user.entity"
import { Recipe } from "../recipes/entities/recipe.entity"

jest.mock("bcrypt")

describe("UsersService", () => {
  let service: UsersService
  let userModel: Record<string, jest.Mock>
  let recipeModel: Record<string, jest.Mock>

  const mockUserId = new Types.ObjectId()
  const mockUser = {
    _id: mockUserId,
    name: "Alice",
    email: "alice@example.com",
    password: "hashedPassword",
    avatarUrl: "https://example.com/avatar.jpg",
    bio: "Hello world",
    createdAt: new Date("2024-01-01"),
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: mockUserId,
      name: "Alice",
      email: "alice@example.com",
      password: "hashedPassword",
      avatarUrl: "https://example.com/avatar.jpg",
      bio: "Hello world",
      createdAt: new Date("2024-01-01"),
      __v: 0
    })
  }

  beforeEach(async () => {
    userModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      exists: jest.fn()
    }
    recipeModel = {
      countDocuments: jest.fn(),
      find: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Recipe.name), useValue: recipeModel }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  describe("getPublicProfile", () => {
    it("should return public profile with recipesCount", async () => {
      const leanUser = {
        _id: mockUserId,
        name: "Alice",
        avatarUrl: "https://example.com/avatar.jpg",
        bio: "Hello world",
        createdAt: new Date("2024-01-01")
      }

      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(leanUser)
          })
        })
      })
      recipeModel.countDocuments.mockResolvedValue(5)

      const result = await service.getPublicProfile(mockUserId.toString())

      expect(result).toEqual({
        id: mockUserId,
        name: "Alice",
        avatarUrl: "https://example.com/avatar.jpg",
        bio: "Hello world",
        createdAt: new Date("2024-01-01"),
        recipesCount: 5
      })
    })

    it("should throw BadRequestException for invalid ObjectId", async () => {
      await expect(service.getPublicProfile("invalid-id")).rejects.toThrow(
        BadRequestException
      )
    })

    it("should throw NotFoundException when user not found", async () => {
      userModel.findById.mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null)
          })
        })
      })

      await expect(
        service.getPublicProfile(mockUserId.toString())
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("updateProfile", () => {
    it("should update name, bio, and avatarUrl", async () => {
      const updatedUser = { ...mockUser, name: "Bob", bio: "New bio" }
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedUser)
        })
      })

      const result = await service.updateProfile(mockUserId.toString(), {
        name: " Bob ",
        bio: " New bio ",
        avatarUrl: "https://example.com/new.jpg"
      })

      expect(result).toEqual(updatedUser)
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId.toString(),
        {
          $set: {
            name: "Bob",
            bio: "New bio",
            avatarUrl: "https://example.com/new.jpg"
          }
        },
        { new: true }
      )
    })

    it("should throw NotFoundException when user not found", async () => {
      userModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null)
        })
      })

      await expect(
        service.updateProfile(mockUserId.toString(), { name: "Test" })
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("changeEmail", () => {
    it("should update email when password is valid and email is unique", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      userModel.exists.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      })
      mockUser.save.mockResolvedValue(mockUser)

      const result = await service.changeEmail(mockUserId.toString(), {
        newEmail: "NEW@example.com",
        password: "Password1"
      })

      expect(result.message).toBe("Email mis à jour avec succès")
      expect(mockUser.email).toBe("new@example.com")
    })

    it("should throw UnauthorizedException for wrong password", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.changeEmail(mockUserId.toString(), {
          newEmail: "new@example.com",
          password: "WrongPass1"
        })
      ).rejects.toThrow(UnauthorizedException)
    })

    it("should throw ConflictException for duplicate email", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      userModel.exists.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: "other" })
      })

      await expect(
        service.changeEmail(mockUserId.toString(), {
          newEmail: "taken@example.com",
          password: "Password1"
        })
      ).rejects.toThrow(ConflictException)
    })

    it("should throw NotFoundException when user not found", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.changeEmail(mockUserId.toString(), {
          newEmail: "x@x.com",
          password: "Password1"
        })
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("changePassword", () => {
    it("should hash and save new password when current password is valid", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
      ;(bcrypt.hash as jest.Mock).mockResolvedValue("newHashedPassword")
      mockUser.save.mockResolvedValue(mockUser)

      const result = await service.changePassword(mockUserId.toString(), {
        currentPassword: "Password1",
        newPassword: "NewPassword1"
      })

      expect(result.message).toBe("Mot de passe mis à jour avec succès")
      expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword1", 10)
      expect(mockUser.save).toHaveBeenCalled()
    })

    it("should throw UnauthorizedException for wrong current password", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser)
      })
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.changePassword(mockUserId.toString(), {
          currentPassword: "WrongPass1",
          newPassword: "NewPassword1"
        })
      ).rejects.toThrow(UnauthorizedException)
    })

    it("should throw NotFoundException when user not found", async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      })

      await expect(
        service.changePassword(mockUserId.toString(), {
          currentPassword: "Password1",
          newPassword: "NewPassword1"
        })
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe("getUserRecipes", () => {
    it("should return paginated recipes", async () => {
      const mockRecipes = [{ title: "Recipe 1" }, { title: "Recipe 2" }]
      recipeModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRecipes)
            })
          })
        })
      })
      recipeModel.countDocuments.mockResolvedValue(10)

      const result = await service.getUserRecipes(mockUserId.toString(), 0, 20)

      expect(result).toEqual({ data: mockRecipes, total: 10 })
    })

    it("should throw BadRequestException for invalid ObjectId", async () => {
      await expect(service.getUserRecipes("invalid-id", 0, 20)).rejects.toThrow(
        BadRequestException
      )
    })

    it("should clamp skip and limit values", async () => {
      const mockRecipes: unknown[] = []
      recipeModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockRecipes)
            })
          })
        })
      })
      recipeModel.countDocuments.mockResolvedValue(0)

      await service.getUserRecipes(mockUserId.toString(), -5, 200)

      const sortMock = recipeModel.find.mock.results[0].value as Record<
        string,
        jest.Mock
      >
      const skipMock = sortMock.sort.mock.results[0].value as Record<
        string,
        jest.Mock
      >
      expect(skipMock.skip).toHaveBeenCalledWith(0)
      const limitMock = skipMock.skip.mock.results[0].value as Record<
        string,
        jest.Mock
      >
      expect(limitMock.limit).toHaveBeenCalledWith(100)
    })
  })
})
