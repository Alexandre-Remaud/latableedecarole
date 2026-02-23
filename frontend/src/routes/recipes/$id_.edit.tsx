import { createFileRoute } from "@tanstack/react-router"
import EditRecipeForm from "@recipes/EditRecipeForm"

export const Route = createFileRoute("/recipes/$id_/edit")({
  component: EditRecipeForm
})
