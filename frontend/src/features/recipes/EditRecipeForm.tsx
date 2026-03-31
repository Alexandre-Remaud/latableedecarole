import { useParams, useNavigate } from "@tanstack/react-router"
import Form from "@recipes/Form"
import { useAuth } from "@/features/auth/hooks"
import { useEffect } from "react"

export default function EditRecipeForm() {
  const { id } = useParams({ from: "/recipes/$id_/edit" })
  const { user, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      navigate({ to: "/login" })
    }
  }, [user, isLoading, navigate])

  if (isLoading || !user) {
    return null
  }

  return <Form recipeId={id} />
}
