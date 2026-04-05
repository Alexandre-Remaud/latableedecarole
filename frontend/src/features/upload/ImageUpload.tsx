import { useState, useRef, useCallback } from "react"
import toast from "react-hot-toast"
import { uploadService } from "./api"
import type { UploadResult } from "./contract"

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

interface ImageUploadProps {
  value?: UploadResult | null
  onChange: (result: UploadResult | null) => void
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [progress, setProgress] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const isUploading = progress !== null

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Format non supporté. Utilisez JPEG, PNG ou WebP."
    }
    if (file.size > MAX_SIZE) {
      return "Le fichier dépasse 5 Mo."
    }
    return null
  }, [])

  const handleUpload = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error) {
        toast.error(error)
        return
      }

      setPreview(URL.createObjectURL(file))
      setProgress(0)

      try {
        const result = await uploadService.uploadImage(file, setProgress)
        onChange(result)
        toast.success("Image uploadée !")
      } catch (err) {
        setPreview(null)
        onChange(null)
        toast.error(
          err instanceof Error ? err.message : "Erreur lors de l'upload."
        )
      } finally {
        setProgress(null)
      }
    },
    [onChange, validateFile]
  )

  const handleDelete = useCallback(async () => {
    if (!value) return

    try {
      await uploadService.deleteImage(value.publicId)
      onChange(null)
      setPreview(null)
      toast.success("Image supprimée.")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de la suppression."
      )
    }
  }, [value, onChange])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
      e.target.value = ""
    },
    [handleUpload]
  )

  const displayUrl = value?.mediumUrl ?? preview

  if (displayUrl) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
        <img
          src={displayUrl}
          alt="Aperçu"
          className="w-full h-48 object-cover"
        />

        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-3/4 bg-white/30 rounded-full h-2.5">
              <div
                className="bg-white h-2.5 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {!isUploading && (
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
            title="Supprimer l'image"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
        isDragging
          ? "border-warm-500 bg-warm-50"
          : "border-gray-300 hover:border-warm-400 hover:bg-gray-50"
      }`}
    >
      <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-gray-400"
      >
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="text-sm text-gray-500">
        Glissez une image ici ou{" "}
        <span className="text-warm-600 font-medium">cliquez pour choisir</span>
      </p>
      <p className="text-xs text-gray-400">JPEG, PNG ou WebP — 5 Mo max</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
