import { createFileRoute } from "@tanstack/react-router"
import ShoppingLists from "@/pages/ShoppingLists"

export const Route = createFileRoute("/shopping-lists/")({
  component: ShoppingLists
})
