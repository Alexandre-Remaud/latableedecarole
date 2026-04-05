export interface StorageResult {
  originalUrl: string
  thumbnailUrl: string
  mediumUrl: string
  publicId: string
}

export interface StorageService {
  upload(
    buffer: Buffer,
    filename: string,
    mimetype: string
  ): Promise<StorageResult>
  delete(publicId: string): Promise<void>
}

export const STORAGE_SERVICE = "STORAGE_SERVICE"
