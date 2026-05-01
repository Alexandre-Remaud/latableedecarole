import { useQuery } from "@tanstack/react-query"
import { tagsService } from "./api"

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => tagsService.getTags(100),
    staleTime: 5 * 60 * 1000
  })
}

export function usePopularTags() {
  return useQuery({
    queryKey: ["tags", "popular"],
    queryFn: () => tagsService.getPopularTags(),
    staleTime: 5 * 60 * 1000
  })
}
