import { useEffect, useState } from "react"
import { tagsService } from "./api"
import type { Tag } from "./types"

export function useTags() {
  const [data, setData] = useState<Tag[]>([])

  useEffect(() => {
    tagsService
      .getTags(100)
      .then(setData)
      .catch(() => {})
  }, [])

  return { data }
}

export function usePopularTags() {
  const [data, setData] = useState<Tag[]>([])

  useEffect(() => {
    tagsService
      .getPopularTags()
      .then(setData)
      .catch(() => {})
  }, [])

  return { data }
}
