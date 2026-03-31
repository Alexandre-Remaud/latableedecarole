import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth/hooks"
import { loginSchema, type LoginFormData } from "@/features/auth/schema"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      await login(data.email, data.password)
      toast.success("Connexion réussie")
      navigate({ to: "/" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Connexion</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Connexion..." : "Se connecter"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Pas encore de compte ?{" "}
        <Link to="/register" className="font-medium text-orange-600 hover:text-orange-500">
          S&apos;inscrire
        </Link>
      </p>
    </div>
  )
}
