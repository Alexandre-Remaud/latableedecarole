import {
  Controller,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus
} from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { UploadService } from "./upload.service.js"
import { CurrentUser } from "../auth/decorators/current-user.decorator.js"
import type { JwtPayload } from "../auth/auth.service.js"

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post("image")
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"]
        if (allowed.includes(file.mimetype)) {
          cb(null, true)
        } else {
          cb(
            new BadRequestException(
              "Format de fichier non supporté. Utilisez JPEG, PNG ou WebP."
            ),
            false
          )
        }
      }
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload
  ) {
    if (!file) {
      throw new BadRequestException("Aucun fichier fourni.")
    }

    const image = await this.uploadService.upload(file, user.sub)

    return {
      originalUrl: image.originalUrl,
      thumbnailUrl: image.thumbnailUrl,
      mediumUrl: image.mediumUrl,
      publicId: image.publicId
    }
  }

  @Delete("image/:publicId")
  @HttpCode(HttpStatus.OK)
  async deleteImage(
    @Param("publicId") publicId: string,
    @CurrentUser() user: JwtPayload
  ) {
    await this.uploadService.delete(publicId, user.sub)
    return { message: "Image supprimée." }
  }
}
