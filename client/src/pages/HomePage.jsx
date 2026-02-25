import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";

function HomePage() {
  const { isAuthenticated, user, loading, authChecked } = useAuth();

  // ✅ Evitar mostrar contenido hasta que esté listo
  if (loading && !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // ✅ Si está autenticado (admin, doctor o cliente registrado)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            ¡Hola, <span className="text-cyan-600">{user?.username}</span>!
          </h1>
          <p className="text-xl text-gray-600 mb-10">
            Bienvenido a tu panel de gestión
          </p>
          
          <Link
            to="/dashboard"
            className="inline-block bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg hover:shadow-xl"
          >
            Ir a mi cuenta →
          </Link>
        </div>
      </div>
    );
  }

  // ✅ Si NO está autenticado (público general)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AgendaPro+
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Agenda tu cita de manera fácil y rápida
        </p>
        
        <Link
          to="/crear-cita"
          className="inline-block w-full bg-cyan-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg"
        >
          Crear cita
        </Link>
        
        <p className="mt-6 text-sm text-gray-500">
          ¿Eres cliente registrado?{" "}
          <Link to="/login" className="text-cyan-600 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}

export default HomePage;