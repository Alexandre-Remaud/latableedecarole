import { useParams } from "@tanstack/react-router"
import Form from "@recipes/Form"

export default function EditRecipeForm() {
  const { id } = useParams({ from: "/recipes/$id_/edit" })
  return <Form recipeId={id} />
}
