import { useState, useEffect, type FormEvent } from "react"
import { editProfileSchema } from "../schema"
import type { User } from "@/features/auth/contract"

type Props = {
  user: User
  onSave: (data: {
    name: string
    bio?: string
    avatarUrl?: string
  }) => Promise<void>
  onClose: () => void
}

export default function EditProfileModal({ user, onSave, onClose }: Props) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onClose])

  const [name, setName] = useState(user.name)
  const [bio, setBio] = useState(user.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setErrors({})

    const result = editProfileSchema.safeParse({ name, bio, avatarUrl })
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        name,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined
      })
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Une erreur est survenue"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-profile-title"
        className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="edit-profile-title"
          className="font-display text-lg font-semibold text-gray-800 mb-4"
        >
          Modifier le profil
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={500}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/500</p>
            {errors.bio && (
              <p className="mt-1 text-xs text-red-500">{errors.bio}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              URL de l&apos;avatar
            </label>
            <input
              id="avatarUrl"
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              className="input-field"
            />
            {errors.avatarUrl && (
              <p className="mt-1 text-xs text-red-500">{errors.avatarUrl}</p>
            )}
          </div>

          {errors.form && <p className="text-sm text-red-500">{errors.form}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
