type Props = {
  name: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  recipesCount: number
  showEmail?: boolean
  email?: string
}

export default function ProfileHeader({
  name,
  avatarUrl,
  bio,
  createdAt,
  recipesCount,
  showEmail,
  email
}: Props) {
  const formattedDate = new Date(createdAt).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

  return (
    <div className="flex items-start gap-6">
      <div className="shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover"
          />
        ) : (
          <span className="w-20 h-20 flex items-center justify-center bg-warm-500 text-white rounded-full text-2xl font-medium">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-2xl font-bold text-gray-800">
          {name}
        </h1>
        {bio && <p className="mt-1 text-sm text-gray-600">{bio}</p>}
        {showEmail && email && (
          <p className="mt-1 text-sm text-gray-500">{email}</p>
        )}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
          <span>Membre depuis le {formattedDate}</span>
          <span>
            {recipesCount} recette{recipesCount > 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  )
}
