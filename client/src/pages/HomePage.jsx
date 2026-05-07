import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";
import { useState } from "react";
import { FormularioClienteTemporal } from "../components/forms/FormularioClienteTemporal";
import { toast, Toaster } from 'sonner';

function HomePage() {
  const { isAuthenticated, user, loading, authChecked } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Evitar mostrar contenido hasta que esté listo
  if (loading && !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Si está autenticado (admin, doctor o cliente registrado)
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

  // Función para manejar el éxito del formulario
  const handleFormSuccess = () => {
    setMostrarFormulario(false);
    toast.success("✅ Cita agendada exitosamente", {
      duration: 5000,
      position: "top-right"
    });
  };

  // Si NO está autenticado (público general)
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <Toaster position="top-right" richColors closeButton duration={3000} />
      
      <div className="max-w-4xl mx-auto">
        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AgendaPro+
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Agenda tu cita de manera fácil y rápida
          </p>
          
          {/* Botón para mostrar/ocultar el formulario */}
          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="inline-block bg-cyan-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg"
            >
              Crear cita
            </button>
          )}
          
          {mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(false)}
              className="inline-block bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
            >
              ✕ Cancelar
            </button>
          )}
          
          <p className="mt-6 text-sm text-gray-500">
            ¿Eres cliente registrado?{" "}
            <Link to="/login" className="text-cyan-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Formulario que se despliega en la misma página */}
        {mostrarFormulario && (
          <div className="mt-6">
            <FormularioClienteTemporal
              onSuccess={handleFormSuccess}
              onCancel={() => setMostrarFormulario(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;