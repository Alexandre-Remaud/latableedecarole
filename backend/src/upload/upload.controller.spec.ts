import { Test, TestingModule } from "@nestjs/testing"
import { BadRequestException } from "@nestjs/common"
import { UploadController } from "./upload.controller"
import { UploadService } from "./upload.service"
import { Role } from "../auth/role.enum"

describe("UploadController", () => {
  let controller: UploadController
  let uploadService: Record<string, jest.Mock>

  const mockUser = {
    sub: "user-id",
    email: "test@test.com",
    name: "Test",
    role: Role.USER
  }

  beforeEach(async () => {
    uploadService = {
      upload: jest.fn(),
      delete: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: uploadService }]
    }).compile()

    controller = module.get<UploadController>(UploadController)
  })

  describe("uploadImage", () => {
    it("should upload and return image URLs", async () => {
      const mockImage = {
        originalUrl: "http://localhost/original.jpg",
        thumbnailUrl: "http://localhost/thumb.jpg",
        mediumUrl: "http://localhost/medium.jpg",
        publicId: "uuid-123"
      }
      uploadService.upload.mockResolvedValue(mockImage)

      const file = {
        mimetype: "image/jpeg",
        size: 1024,
        buffer: Buffer.from("fake"),
        originalname: "photo.jpg"
      } as Express.Multer.File

      const result = await controller.uploadImage(file, mockUser)

      expect(uploadService.upload).toHaveBeenCalledWith(file, "user-id")
      expect(result).toEqual({
        originalUrl: mockImage.originalUrl,
        thumbnailUrl: mockImage.thumbnailUrl,
        mediumUrl: mockImage.mediumUrl,
        publicId: mockImage.publicId
      })
    })

    it("should throw BadRequestException when no file provided", async () => {
      await expect(
        controller.uploadImage(
          undefined as unknown as Express.Multer.File,
          mockUser
        )
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe("deleteImage", () => {
    it("should delete an image", async () => {
      uploadService.delete.mockResolvedValue(undefined)

      const result = await controller.deleteImage("uuid-123", mockUser)

      expect(uploadService.delete).toHaveBeenCalledWith("uuid-123", "user-id")
      expect(result).toEqual({ message: "Image supprimée." })
    })
  })
})
