import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="bg-white my-3 flex justify-between items-center py-5 px-10 rounded-lg">
      <Link to={isAuthenticated ? "/tasks" : "/"}>
        <h1 className="text-2xl font-bold text-cyan-600 hover:text-cyan-700 transition">
          El Éxito
        </h1>
      </Link>

      <ul className="flex gap-x-6 items-center">
        {isAuthenticated ? (
          <>
            <li>
              <span className="text-gray-700">
                Bienvenido, <span className="text-cyan-600">{user?.username}</span>
              </span>
            </li>
            <li>
              <Link to="/tasks" className="text-gray-700 hover:text-cyan-600 transition">
                Tasks
              </Link>
            </li>
            <li>
              <Link to="/add-task" className="text-gray-700 hover:text-cyan-600 transition">
                Add Task
              </Link>
            </li>
            <li>
              <button
                onClick={logout}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" className="text-cyan-600 hover:text-cyan-700 transition">
                Login
              </Link>
            </li>
           
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;