import { createFileRoute } from "@tanstack/react-router"
import ShoppingListDetail from "@/features/shopping-lists/ShoppingListDetail"

function ShoppingListDetailPage() {
  const { id } = Route.useParams()
  return <ShoppingListDetail listId={id} />
}

export const Route = createFileRoute("/shopping-lists/$id")({
  component: ShoppingListDetailPage
})
