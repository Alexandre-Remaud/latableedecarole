import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { MulterModule } from "@nestjs/platform-express"
import { memoryStorage } from "multer"
import { UploadController } from "./upload.controller.js"
import { UploadService } from "./upload.service.js"
import { Image, ImageSchema } from "./entities/image.entity.js"
import { STORAGE_SERVICE } from "./storage/storage.interface.js"
import { LocalStorageService } from "./storage/local-storage.service.js"

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
    MulterModule.register({
      storage: memoryStorage()
    })
  ],
  controllers: [UploadController],
  providers: [
    UploadService,
    {
      provide: STORAGE_SERVICE,
      useClass: LocalStorageService
    }
  ],
  exports: [UploadService]
})
export class UploadModule {}
