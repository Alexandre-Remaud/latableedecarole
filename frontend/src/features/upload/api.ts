import { ApiError, NetworkError } from "@/lib/api-client"
import type { UploadResult } from "./contract"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export const uploadService = {
  async uploadImage(
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      })

      xhr.addEventListener("load", () => {
        try {
          const body = JSON.parse(xhr.responseText)
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(body as UploadResult)
          } else {
            const message = Array.isArray(body.message)
              ? body.message[0]
              : body.message || "Erreur lors de l'upload."
            reject(new ApiError(message, xhr.status))
          }
        } catch {
          reject(new ApiError("Réponse invalide du serveur.", xhr.status))
        }
      })

      xhr.addEventListener("error", () => {
        reject(new NetworkError())
      })

      xhr.addEventListener("abort", () => {
        reject(new NetworkError("Upload annulé."))
      })

      const formData = new FormData()
      formData.append("file", file)

      xhr.open("POST", `${API_URL}/upload/image`)
      xhr.withCredentials = true
      xhr.send(formData)
    })
  },

  async deleteImage(publicId: string): Promise<void> {
    const response = await fetch(`${API_URL}/upload/image/${publicId}`, {
      method: "DELETE",
      credentials: "include"
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(
        body.message || "Erreur lors de la suppression.",
        response.status
      )
    }
  }
}
