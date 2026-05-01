import { useState, useEffect, useCallback } from "react"
import { collectionsApi } from "./api"
import type { Collection, CollectionDetail } from "./contract"

export function useMyCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await collectionsApi.getMine()
      setCollections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  async function createCollection(name: string, description?: string) {
    const created = await collectionsApi.create({ name, description })
    setCollections((prev) => [created, ...prev])
    return created
  }

  async function removeCollection(collectionId: string) {
    await collectionsApi.remove(collectionId)
    setCollections((prev) => prev.filter((c) => c._id !== collectionId))
  }

  async function addRecipeToCollection(collectionId: string, recipeId: string) {
    return collectionsApi.addRecipe(collectionId, recipeId)
  }

  return {
    collections,
    loading,
    error,
    createCollection,
    removeCollection,
    addRecipeToCollection,
    refresh: load
  }
}

export function useCollection(collectionId: string) {
  const [collection, setCollection] = useState<CollectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await collectionsApi.getOne(collectionId)
      setCollection(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [collectionId])

  useEffect(() => {
    void load()
  }, [load])

  async function updateCollection(payload: {
    name?: string
    description?: string
    isPublic?: boolean
    coverImage?: string
  }) {
    const updated = await collectionsApi.update(collectionId, payload)
    setCollection((prev) =>
      prev ? { ...prev, ...updated, recipes: prev.recipes } : prev
    )
    return updated
  }

  async function removeRecipe(recipeId: string) {
    const updated = await collectionsApi.removeRecipe(collectionId, recipeId)
    setCollection(updated)
  }

  return {
    collection,
    loading,
    error,
    updateCollection,
    removeRecipe,
    refresh: load
  }
}
