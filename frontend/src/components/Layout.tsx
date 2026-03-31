import { useState, useRef, useEffect, type FormEvent } from "react"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth/hooks"

const MORE_CATEGORIES = [
  { value: "appetizer", label: "Apéritifs" },
  { value: "side_dish", label: "Accompagnements" },
  { value: "snack", label: "Collations" },
  { value: "beverage", label: "Boissons" },
  { value: "sauce", label: "Sauces" },
] as const

export default function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const moreRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, isLoading, logout } = useAuth()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    void navigate({
      to: "/recipes",
      search: searchValue.trim() ? { search: searchValue.trim() } : {}
    })
  }

  async function handleLogout() {
    try {
      await logout()
      toast.success("Déconnexion réussie")
      navigate({ to: "/" })
    } catch {
      toast.error("Erreur lors de la déconnexion")
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-6 shrink-0">
              <Link
                to="/"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <span className="text-warm-600 text-2xl" aria-hidden="true">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 11h.01" />
                    <path d="M11 15h.01" />
                    <path d="M16 16h.01" />
                    <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16" />
                    <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4" />
                  </svg>
                </span>
                <span className="font-display text-2xl font-bold text-gray-800">
                  Chez Carole
                </span>
              </Link>

              <nav className="flex items-center gap-4">
                <Link
                  to="/recipes"
                  search={{ category: "starter" }}
                  className="text-sm font-medium text-gray-600 hover:text-warm-600 transition-colors"
                >
                  Entrées
                </Link>
                <Link
                  to="/recipes"
                  search={{ category: "main_course" }}
                  className="text-sm font-medium text-gray-600 hover:text-warm-600 transition-colors"
                >
                  Plats principaux
                </Link>
                <Link
                  to="/recipes"
                  search={{ category: "dessert" }}
                  className="text-sm font-medium text-gray-600 hover:text-warm-600 transition-colors"
                >
                  Desserts
                </Link>
                <div className="relative" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((o) => !o)}
                    className="text-sm font-medium text-gray-600 hover:text-warm-600 transition-colors flex items-center gap-1"
                  >
                    Plus
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {moreOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px] z-50">
                      {MORE_CATEGORIES.map((cat) => (
                        <Link
                          key={cat.value}
                          to="/recipes"
                          search={{ category: cat.value }}
                          className="block px-4 py-2 text-sm text-gray-600 hover:bg-warm-50 hover:text-warm-600 transition-colors"
                          onClick={() => setMoreOpen(false)}
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </nav>
            </div>

            <form
              onSubmit={handleSearch}
              className="w-56 shrink-0"
            >
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Rechercher une recette"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition"
                />
              </div>
            </form>

            <div className="flex items-center gap-3">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <Link
                        to="/recipes/add"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 active:bg-warm-800 transition-colors"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Ajouter une recette
                      </Link>
                      <div className="relative" ref={userMenuRef}>
                        <button
                          type="button"
                          onClick={() => setUserMenuOpen((o) => !o)}
                          className="shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <span className="w-8 h-8 flex items-center justify-center bg-warm-500 text-white rounded-full text-sm font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-[100px] truncate">{user.name}</span>
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>
                        {userMenuOpen && (
                          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[180px] z-50">
                            <div className="px-4 py-2 border-b border-gray-100">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              Déconnexion
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        to="/login"
                        className="shrink-0 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-warm-600 transition-colors"
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 active:bg-warm-800 transition-colors"
                      >
                        S&apos;inscrire
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 px-4 sm:px-6">
          <Outlet />
        </main>

        <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-100">
          Chez Carole — Vos recettes, simplement.
        </footer>
      </div>
      <TanStackRouterDevtools />
    </>
  )
}
