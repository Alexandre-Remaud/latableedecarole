import { Link } from "@tanstack/react-router"
import type { Collection } from "../contract"

interface Props {
  collection: Collection
}

export default function CollectionCard({ collection }: Props) {
  const recipeCount = collection.recipeIds.length

  return (
    <Link
      to="/collections/$collectionId"
      params={{ collectionId: collection._id }}
      className="group block rounded-2xl overflow-hidden border border-gray-100 hover:border-warm-300 transition-all duration-150 bg-white"
    >
      <div className="aspect-[4/3] bg-warm-50 relative overflow-hidden">
        {collection.coverImage ? (
          <img
            src={collection.coverImage}
            alt={collection.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-warm-200">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10" />
            </svg>
          </div>
        )}
        {collection.isPublic && (
          <span className="absolute top-2 right-2 bg-white/90 text-warm-700 text-xs font-medium px-2 py-0.5 rounded-full">
            Publique
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-display font-semibold text-gray-800 truncate group-hover:text-warm-700 transition-colors">
          {collection.name}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          {recipeCount} recette{recipeCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  )
}
