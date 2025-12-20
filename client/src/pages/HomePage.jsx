import { useAuth } from "../context/authContext";
import { Link } from "react-router";

function HomePage() {
  const { isAuthenticated, user, loading, authChecked } = useAuth();
if (loading) return null;
 
  return (
    <div className="text-center py-10">
      <h1 className="text-4xl font-bold mb-6">HompePAGE</h1>

      {isAuthenticated ? (
      
        <div className="mt-8">
          <h2 className="text-2xl text-green-600 mb-4">
            Welcome back, {user?.username}!
          </h2>
          <p className="text-lg mb-6">You are already logged in.</p>
          <Link
            to="/tasks"
            className="bg-indigo-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-600 transition"
          >
            Go to Tasks Manager →
          </Link>
        </div>
      ) : (
        // ✅ Si NO está logueado
        <div className="mt-8">
          <h2 className="text-2xl text-blue-600 mb-4">
            Welcome to Tasks Manager
          </h2>
          <p className="text-lg mb-6">Please log in to manage your tasks</p>
          <div className="flex justify-center gap-4">
            <Link
              to="/login"
              className="bg-indigo-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-indigo-600 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg hover:bg-gray-300 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </div>
  );

}
export default HomePage;
