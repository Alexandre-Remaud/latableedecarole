import { Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectsCommand
} from "@aws-sdk/client-s3"
import * as crypto from "node:crypto"
import sharp from "sharp"
import type { StorageService, StorageResult } from "./storage.interface.js"

sharp.concurrency(1)

const THUMBNAIL_SIZE = { width: 300, height: 300 }
const MEDIUM_SIZE = { width: 800, height: 600 }
const MAX_ORIGINAL_WIDTH = 1920

@Injectable()
export class S3StorageService implements StorageService {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly publicUrl: string

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>("S3_BUCKET")
    this.publicUrl = this.configService.getOrThrow<string>("S3_PUBLIC_URL")

    this.s3 = new S3Client({
      region: this.configService.get<string>("S3_REGION", "auto"),
      endpoint: this.configService.getOrThrow<string>("S3_ENDPOINT"),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("S3_ACCESS_KEY_ID"),
        secretAccessKey: this.configService.getOrThrow<string>(
          "S3_SECRET_ACCESS_KEY"
        )
      }
    })
  }

  async upload(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<StorageResult> {
    const ext = this.getExtension(mimetype)
    const publicId = crypto.randomUUID()

    const keys = {
      original: `${publicId}-original${ext}`,
      thumbnail: `${publicId}-thumbnail${ext}`,
      medium: `${publicId}-medium${ext}`
    }

    // Process and upload sequentially to limit memory usage
    const originalBuf = await sharp(buffer)
      .rotate()
      .resize(MAX_ORIGINAL_WIDTH, undefined, {
        fit: "inside",
        withoutEnlargement: true
      })
      .toBuffer()

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keys.original,
        Body: originalBuf,
        ContentType: mimetype
      })
    )

    const thumbnailBuf = await sharp(buffer)
      .rotate()
      .resize(THUMBNAIL_SIZE.width, THUMBNAIL_SIZE.height, { fit: "cover" })
      .toBuffer()

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keys.thumbnail,
        Body: thumbnailBuf,
        ContentType: mimetype
      })
    )

    const mediumBuf = await sharp(buffer)
      .rotate()
      .resize(MEDIUM_SIZE.width, MEDIUM_SIZE.height, { fit: "inside" })
      .toBuffer()

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: keys.medium,
        Body: mediumBuf,
        ContentType: mimetype
      })
    )

    return {
      originalUrl: `${this.publicUrl}/${keys.original}`,
      thumbnailUrl: `${this.publicUrl}/${keys.thumbnail}`,
      mediumUrl: `${this.publicUrl}/${keys.medium}`,
      publicId
    }
  }

  async delete(publicId: string): Promise<void> {
    if (!this.isValidUuid(publicId)) return

    const suffixes = ["-original", "-thumbnail", "-medium"]
    const extensions = [".jpg", ".png", ".webp"]

    const objects = suffixes.flatMap((suffix) =>
      extensions.map((ext) => ({ Key: `${publicId}${suffix}${ext}` }))
    )

    await this.s3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: objects, Quiet: true }
      })
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
