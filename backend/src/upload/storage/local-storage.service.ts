import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import * as fs from "node:fs/promises"
import * as path from "node:path"
import * as crypto from "node:crypto"
import sharp from "sharp"
import type { StorageService, StorageResult } from "./storage.interface.js"

sharp.concurrency(1)

const THUMBNAIL_SIZE = { width: 300, height: 300 }
const MEDIUM_SIZE = { width: 800, height: 600 }
const MAX_ORIGINAL_WIDTH = 1920

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir: string
  private readonly baseUrl: string

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.join(process.cwd(), "uploads")
    const backendUrl = this.configService.get<string>("BACKEND_URL")
    this.baseUrl = `${backendUrl}/uploads`
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<StorageResult> {
    await fs.mkdir(this.uploadDir, { recursive: true })

    const ext = this.getExtension(mimetype)
    const publicId = crypto.randomUUID()

    const originalName = `${publicId}-original${ext}`
    const thumbnailName = `${publicId}-thumbnail${ext}`
    const mediumName = `${publicId}-medium${ext}`

    // Process sequentially to limit memory usage
    await sharp(buffer)
      .rotate()
      .resize(MAX_ORIGINAL_WIDTH, undefined, {
        fit: "inside",
        withoutEnlargement: true
      })
      .toFile(path.join(this.uploadDir, originalName))

    await sharp(buffer)
      .rotate()
      .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, { fit: "cover" })
      .toFile(path.join(this.uploadDir, thumbnailName))

    await sharp(buffer)
      .rotate()
      .resize(MEDIUM_SIZE.width, MEDIUM_SIZE.height, { fit: "inside" })
      .toFile(path.join(this.uploadDir, mediumName))

    return {
      originalUrl: `${this.baseUrl}/${originalName}`,
      thumbnailUrl: `${this.baseUrl}/${thumbnailName}`,
      mediumUrl: `${this.baseUrl}/${mediumName}`,
      publicId
    }
  }

  async delete(publicId: string): Promise<void> {
    if (!this.isValidUuid(publicId)) return

    const files = await fs.readdir(this.uploadDir).catch(() => [])
    const toDelete = files.filter((f) => f.startsWith(publicId))
    await Promise.all(
      toDelete.map((f) =>
        fs.unlink(path.join(this.uploadDir, f)).catch(() => {})
      )
    )
  }

  private isValidUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value
    )
  }

  private getExtension(mimetype: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp"
    }
    return map[mimetype] ?? ".jpg"
  }
}
