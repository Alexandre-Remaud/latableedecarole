import { Test, TestingModule } from "@nestjs/testing"
import { getModelToken } from "@nestjs/mongoose"
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException
} from "@nestjs/common"
import { Types } from "mongoose"
import { UploadService } from "./upload.service"
import { Image } from "./entities/image.entity"
import { STORAGE_SERVICE } from "./storage/storage.interface"

describe("UploadService", () => {
  let service: UploadService
  let imageModel: Record<string, jest.Mock>
  let storage: Record<string, jest.Mock>

  const userId = new Types.ObjectId().toString()

  beforeEach(async () => {
    imageModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      deleteOne: jest.fn()
    }
    storage = {
      upload: jest.fn(),
      delete: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        { provide: getModelToken(Image.name), useValue: imageModel },
        { provide: STORAGE_SERVICE, useValue: storage }
      ]
    }).compile()

    service = module.get<UploadService>(UploadService)
  })

  describe("upload", () => {
    const validFile = {
      mimetype: "image/jpeg",
      size: 1024 * 1024,
      buffer: Buffer.from("fake"),
      originalname: "photo.jpg"
    } as Express.Multer.File

    it("should upload a valid image", async () => {
      const storageResult = {
        originalUrl: "http://localhost/original.jpg",
        thumbnailUrl: "http://localhost/thumb.jpg",
        mediumUrl: "http://localhost/medium.jpg",
        publicId: "uuid-123"
      }
      storage.upload.mockResolvedValue(storageResult)
      imageModel.create.mockResolvedValue({ ...storageResult, userId })

      const result = await service.upload(validFile, userId)

      expect(storage.upload).toHaveBeenCalledWith(
        validFile.buffer,
        validFile.originalname,
        validFile.mimetype
      )
      expect(imageModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...storageResult,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          userId: expect.any(Types.ObjectId)
        })
      )
      expect(result).toBeDefined()
    })

    it("should reject unsupported mime types", async () => {
      const badFile = {
        ...validFile,
        mimetype: "image/gif"
      } as Express.Multer.File

      await expect(service.upload(badFile, userId)).rejects.toThrow(
        BadRequestException
      )
    })

    it("should reject files exceeding 5MB", async () => {
      const bigFile = {
        ...validFile,
        size: 6 * 1024 * 1024
      } as Express.Multer.File

      await expect(service.upload(bigFile, userId)).rejects.toThrow(
        BadRequestException
      )
    })
  })

  describe("delete", () => {
    it("should delete an image owned by the user", async () => {
      const image = {
        _id: new Types.ObjectId(),
        publicId: "uuid-123",
        userId: new Types.ObjectId(userId)
      }
      imageModel.findOne.mockResolvedValue(image)
      storage.delete.mockResolvedValue(undefined)
      imageModel.deleteOne.mockResolvedValue({})

      await service.delete("uuid-123", userId)

      expect(storage.delete).toHaveBeenCalledWith("uuid-123")
      expect(imageModel.deleteOne).toHaveBeenCalledWith({ _id: image._id })
    })

    it("should throw NotFoundException if image not found", async () => {
      imageModel.findOne.mockResolvedValue(null)

      await expect(service.delete("nonexistent", userId)).rejects.toThrow(
        NotFoundException
      )
    })

    it("should throw ForbiddenException if user is not the owner", async () => {
      const otherUserId = new Types.ObjectId()
      const image = {
        _id: new Types.ObjectId(),
        publicId: "uuid-123",
        userId: otherUserId
      }
      imageModel.findOne.mockResolvedValue(image)

      await expect(service.delete("uuid-123", userId)).rejects.toThrow(
        ForbiddenException
      )
    })
  })

  describe("deleteByPublicId", () => {
    it("should delete image by publicId without ownership check", async () => {
      const image = {
        _id: new Types.ObjectId(),
        publicId: "uuid-123"
      }
      imageModel.findOne.mockResolvedValue(image)
      storage.delete.mockResolvedValue(undefined)
      imageModel.deleteOne.mockResolvedValue({})

      await service.deleteByPublicId("uuid-123")

      expect(storage.delete).toHaveBeenCalledWith("uuid-123")
      expect(imageModel.deleteOne).toHaveBeenCalledWith({ _id: image._id })
    })

    it("should do nothing if image not found", async () => {
      imageModel.findOne.mockResolvedValue(null)

      await service.deleteByPublicId("nonexistent")

      expect(storage.delete).not.toHaveBeenCalled()
    })
  })
})
