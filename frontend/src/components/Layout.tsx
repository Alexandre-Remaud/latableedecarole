import { useState, useRef, useEffect, type FormEvent } from "react"
import { Link, Outlet, useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { useAuth } from "@/features/auth/hooks"

const MORE_CATEGORIES = [
  { value: "appetizer", label: "Apéritifs" },
  { value: "side_dish", label: "Accompagnements" },
  { value: "snack", label: "Collations" },
  { value: "beverage", label: "Boissons" },
  { value: "sauce", label: "Sauces" }
] as const

export default function Layout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
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
    setMobileMenuOpen(false)
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

  function closeAll() {
    setMobileMenuOpen(false)
    setMoreOpen(false)
    setUserMenuOpen(false)
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 lg:py-5 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
              onClick={closeAll}
            >
              <span className="text-warm-600" aria-hidden="true">
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
              <span className="font-display text-lg font-bold text-gray-800 leading-tight">
                La tablée de Carole
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-4">
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
                Plats
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

            {/* Desktop search */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:block w-48 xl:w-56 shrink-0"
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
                  placeholder="Rechercher"
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition"
                />
              </div>
            </form>

            {/* Desktop auth */}
            <div className="hidden lg:flex items-center gap-3">
              {!isLoading && (
                <>
                  {user ? (
                    <>
                      <Link
                        to="/shopping-lists"
                        className="shrink-0 p-2 text-gray-500 hover:text-warm-600 border border-gray-200 hover:border-warm-300 rounded-xl transition-colors"
                        aria-label="Mes listes de courses"
                        title="Mes listes de courses"
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                      </Link>
                      <Link
                        to="/recipes/add"
                        className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 active:bg-warm-800 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        Ajouter
                      </Link>
                      <div className="relative" ref={userMenuRef}>
                        <button
                          type="button"
                          onClick={() => setUserMenuOpen((o) => !o)}
                          className="shrink-0 flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <span className="w-7 h-7 flex items-center justify-center bg-warm-500 text-white rounded-full text-xs font-medium">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
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
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                            <Link
                              to="/profile"
                              onClick={() => setUserMenuOpen(false)}
                              className="block px-4 py-2 text-sm text-gray-600 hover:bg-warm-50 hover:text-warm-600 transition-colors"
                            >
                              Mon profil
                            </Link>
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
                        className="shrink-0 px-4 py-2 text-sm font-medium text-gray-700 hover:text-warm-600 transition-colors"
                      >
                        Connexion
                      </Link>
                      <Link
                        to="/register"
                        className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 active:bg-warm-800 transition-colors"
                      >
                        S&apos;inscrire
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile burger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="lg:hidden p-2 text-gray-600 hover:text-warm-600 transition-colors"
              aria-label="Menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {mobileMenuOpen ? (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 12h16M4 6h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div
              id="mobile-menu"
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 space-y-4">
                {/* Mobile search */}
                <form onSubmit={handleSearch}>
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
                      className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-warm-300 focus:border-warm-400 transition"
                    />
                  </div>
                </form>

                {/* Mobile categories */}
                <nav className="flex flex-wrap gap-2">
                  <Link
                    to="/recipes"
                    search={{ category: "starter" }}
                    onClick={closeAll}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-warm-50 hover:text-warm-600 transition-colors"
                  >
                    Entrées
                  </Link>
                  <Link
                    to="/recipes"
                    search={{ category: "main_course" }}
                    onClick={closeAll}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-warm-50 hover:text-warm-600 transition-colors"
                  >
                    Plats
                  </Link>
                  <Link
                    to="/recipes"
                    search={{ category: "dessert" }}
                    onClick={closeAll}
                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-warm-50 hover:text-warm-600 transition-colors"
                  >
                    Desserts
                  </Link>
                  {MORE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.value}
                      to="/recipes"
                      search={{ category: cat.value }}
                      onClick={closeAll}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-warm-50 hover:text-warm-600 transition-colors"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </nav>

                {/* Mobile auth */}
                {!isLoading && (
                  <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                    {user ? (
                      <>
                        <Link
                          to="/recipes/add"
                          onClick={closeAll}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
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
                        <Link
                          to="/profile"
                          onClick={closeAll}
                          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                        >
                          Mon profil
                        </Link>
                        <Link
                          to="/shopping-lists"
                          onClick={closeAll}
                          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                        >
                          Listes de courses
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            handleLogout()
                            closeAll()
                          }}
                          className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                        >
                          Déconnexion
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={closeAll}
                          className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center"
                        >
                          Connexion
                        </Link>
                        <Link
                          to="/register"
                          onClick={closeAll}
                          className="px-4 py-2.5 text-sm font-medium text-white bg-warm-600 rounded-xl hover:bg-warm-700 transition-colors text-center"
                        >
                          S&apos;inscrire
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 py-8 px-4 sm:px-6">
          <Outlet />
        </main>

        <footer className="mt-auto py-10 border-t border-gray-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-display text-sm text-gray-500 italic">
              La tablée de Carole
            </span>
            <span className="text-xs text-gray-300 tracking-wide">
              Vos recettes, simplement.
            </span>
          </div>
        </footer>
      </div>
    </>
  )
}
