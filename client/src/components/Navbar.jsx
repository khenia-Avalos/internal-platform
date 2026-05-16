import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-white my-3 flex justify-between items-center py-3 px-4 md:py-5 md:px-10 rounded-lg shadow-sm">
      <Link to={isAuthenticated ? "/tasks" : "/"}>
        <h1 className="text-xl md:text-2xl font-bold text-cyan-600 hover:text-cyan-700 transition">
          El Éxito
        </h1>
      </Link>

      <ul className="flex gap-x-3 md:gap-x-6 items-center">
        {isAuthenticated ? (
          <>
            <li className="hidden md:block">
              <span className="text-gray-700">
                Bienvenido, <span className="text-cyan-600">{user?.username}</span>
              </span>
            </li>
            <li>
              <Link to="/tasks" className="text-gray-700 hover:text-cyan-600 transition text-sm md:text-base">
                Tasks
              </Link>
            </li>
            <li>
              <Link to="/add-task" className="text-gray-700 hover:text-cyan-600 transition text-sm md:text-base">
                Add Task
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 md:px-4 md:py-2 rounded-lg transition text-sm md:text-base"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <li>
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700 transition">
              Login
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;