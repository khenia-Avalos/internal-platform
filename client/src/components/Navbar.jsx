import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth"; 
import { useState } from "react";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white my-3 flex justify-between py-5 px-10 rounded-lg">
      <Link to={isAuthenticated ? "/tasks" : "/"}>
        <Link to="/">
          <h1 className="text-2xl font-bold text-cyan-600 hover:text-cyan-700 transition">
            AgendaPro
          </h1>
        </Link>
      </Link>

      <button
        className="md:hidden text-cyan-600 focus:outline-none"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      <ul
        className={`
        ${isMenuOpen ? "flex" : "hidden"} 
        md:flex 
        flex-col md:flex-row 
        absolute md:static 
        top-20 md:top-auto 
        left-0 md:left-auto 
        w-full md:w-auto 
        bg-white md:bg-transparent 
        shadow-lg md:shadow-none 
        rounded-lg md:rounded-none 
        py-4 md:py-0 
        px-4 md:px-0 
        z-10 
        gap-4 md:gap-x-6
        items-center
      `}
      >
        {isAuthenticated ? (
          <>
            <li className="w-full md:w-auto text-center">
              <span className="text-gray-700 font-medium py-2 block md:inline">
                Welcome <span className="text-cyan-600">{user.username}</span>
                {/* Muestra el rol del usuario si es admin */}
                {user?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    👑 Admin
                  </span>
                )}
              </span>
            </li>

            {/* 🔴 NUEVO: Botón de Admin Dashboard (solo para admins) */}
            {user?.role === 'admin' && (
              <li className="w-full md:w-auto text-center">
                <Link
                  to="/admin"
                  onClick={handleNavClick}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <span>👑</span>
                  <span>Admin Panel</span>
                </Link>
              </li>
            )}

            <li className="w-full md:w-auto text-center">
              <Link
                to="/tasks"
                onClick={handleNavClick}
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-lg font-medium transition block md:inline-block"
              >
                Tasks
              </Link>
            </li>

            <li className="w-full md:w-auto text-center">
              <Link
                to="/add-task"
                onClick={handleNavClick}
                className="bg-cyan-100 text-cyan-700 hover:bg-cyan-200 px-4 py-2 rounded-lg font-medium transition block md:inline-block"
              >
                + Add Task
              </Link>
            </li>

            <li className="w-full md:w-auto text-center">
              <Link
                to="/profile"
                onClick={handleNavClick}
                className="text-gray-700 hover:text-cyan-600 px-3 py-2 rounded-lg font-medium transition block md:inline-block"
              >
                Profile
              </Link>
            </li>

            <li className="w-full md:w-auto text-center">
              <button
                onClick={handleLogout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition w-full md:w-auto"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="w-full md:w-auto text-center">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="bg-cyan-600 text-white hover:bg-cyan-700 px-3 py-1.5 rounded-lg font-medium transition block md:inline-block"
              >
                Login
              </Link>
            </li>
            <li className="w-full md:w-auto text-center">
              <Link
                to="/register"
                onClick={handleNavClick}
                className="bg-white text-cyan-600 border border-cyan-600 hover:bg-cyan-50 px-1.5 py-2 rounded-lg font-medium transition block md:inline-block"
              >
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;