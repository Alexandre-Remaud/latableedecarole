import { describe, it, expect, vi, beforeEach } from "vitest"
import { uploadService } from "./api"
import { ApiError, NetworkError } from "@/lib/api-client"

describe("uploadService", () => {
  describe("deleteImage", () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it("should call DELETE /upload/image/:publicId", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(null, { status: 200 })
      )

      await uploadService.deleteImage("uuid-123")

      const [url, options] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0]
      expect(url).toContain("/upload/image/uuid-123")
      expect(options.method).toBe("DELETE")
      expect(options.credentials).toBe("include")
    })

    it("should throw ApiError on failure", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ message: "Not found" }), { status: 404 })
      )

      await expect(uploadService.deleteImage("bad-id")).rejects.toThrow(
        ApiError
      )
    })

    it("should use fallback message if response has no message", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 500 })
      )

      await expect(uploadService.deleteImage("bad-id")).rejects.toThrow(
        "Erreur lors de la suppression."
      )
    })
  })

  describe("uploadImage", () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it("should resolve with upload result on success", async () => {
      const mockResult = {
        originalUrl: "http://localhost/original.jpg",
        thumbnailUrl: "http://localhost/thumb.jpg",
        mediumUrl: "http://localhost/medium.jpg",
        publicId: "uuid-123"
      }

      const mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        withCredentials: false,
        status: 200,
        responseText: JSON.stringify(mockResult),
        upload: {
          addEventListener: vi.fn()
        },
        addEventListener: vi.fn(function (
          this: typeof mockXhr,
          event: string,
          handler: () => void
        ) {
          if (event === "load") {
            setTimeout(handler, 0)
          }
        })
      }

      vi.stubGlobal("XMLHttpRequest", function (this: typeof mockXhr) {
        Object.assign(this, mockXhr)
      })

      const file = new File(["data"], "photo.jpg", { type: "image/jpeg" })
      const result = await uploadService.uploadImage(file)

      expect(result).toEqual(mockResult)
    })

    it("should reject with ApiError on HTTP error", async () => {
      const mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        withCredentials: false,
        status: 400,
        responseText: JSON.stringify({ message: "Bad file" }),
        upload: {
          addEventListener: vi.fn()
        },
        addEventListener: vi.fn(function (
          this: typeof mockXhr,
          event: string,
          handler: () => void
        ) {
          if (event === "load") {
            setTimeout(handler, 0)
          }
        })
      }

      vi.stubGlobal("XMLHttpRequest", function (this: typeof mockXhr) {
        Object.assign(this, mockXhr)
      })

      const file = new File(["data"], "photo.jpg", { type: "image/jpeg" })
      await expect(uploadService.uploadImage(file)).rejects.toThrow(ApiError)
    })

    it("should reject with NetworkError on network failure", async () => {
      const mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        withCredentials: false,
        upload: {
          addEventListener: vi.fn()
        },
        addEventListener: vi.fn(function (
          this: typeof mockXhr,
          event: string,
          handler: () => void
        ) {
          if (event === "error") {
            setTimeout(handler, 0)
          }
        })
      }

      vi.stubGlobal("XMLHttpRequest", function (this: typeof mockXhr) {
        Object.assign(this, mockXhr)
      })

      const file = new File(["data"], "photo.jpg", { type: "image/jpeg" })
      await expect(uploadService.uploadImage(file)).rejects.toThrow(
        NetworkError
      )
    })

    it("should call onProgress when progress event fires", async () => {
      const onProgress = vi.fn()
      let progressHandler: ((e: ProgressEvent) => void) | undefined

      const mockXhr = {
        open: vi.fn(),
        send: vi.fn(),
        withCredentials: false,
        status: 200,
        responseText: JSON.stringify({
          publicId: "x",
          originalUrl: "",
          thumbnailUrl: "",
          mediumUrl: ""
        }),
        upload: {
          addEventListener: vi.fn(
            (event: string, handler: (e: ProgressEvent) => void) => {
              if (event === "progress") progressHandler = handler
            }
          )
        },
        addEventListener: vi.fn(function (
          this: typeof mockXhr,
          event: string,
          handler: () => void
        ) {
          if (event === "load") {
            setTimeout(() => {
              if (progressHandler) {
                progressHandler(
                  new ProgressEvent("progress", {
                    lengthComputable: true,
                    loaded: 50,
                    total: 100
                  })
                )
              }
              handler()
            }, 0)
          }
        })
      }

      vi.stubGlobal("XMLHttpRequest", function (this: typeof mockXhr) {
        Object.assign(this, mockXhr)
      })

      const file = new File(["data"], "photo.jpg", { type: "image/jpeg" })
      await uploadService.uploadImage(file, onProgress)

      expect(mockXhr.upload.addEventListener).toHaveBeenCalledWith(
        "progress",
        expect.any(Function)
      )
    })
  })
})
