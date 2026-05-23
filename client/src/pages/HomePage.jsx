import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";
import { useState } from "react";
import { FormularioClienteTemporal } from "../components/forms/FormularioClienteTemporal";
import { toast, Toaster } from 'sonner';

function HomePage() {
  const { isAuthenticated, user, loading, authChecked } = useAuth();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  if (loading && !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="text-6xl mb-4">🐾</div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              ¡Hola, <span className="text-cyan-600">{user?.username}</span>!
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Bienvenido a tu panel de gestión veterinaria
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Ir a mi cuenta →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSuccess = () => {
    setMostrarFormulario(false);
    toast.success("✅ Cita agendada exitosamente", {
      duration: 5000,
      position: "top-right"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <Toaster position="top-right" richColors closeButton duration={3000} />
      
      {/* Header/Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🐾</div>
              <h1 className="text-xl font-bold text-gray-800">Veterinaria El Éxito</h1>
            </div>
            <div className="flex gap-4">
              <Link to="/login" className="text-gray-600 hover:text-cyan-600 transition font-medium">
                Iniciar Sesión
              </Link>
              <Link to="/register" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition text-sm font-medium">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="text-7xl mb-4">🐕🐈</div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Cuidamos de <span className="text-cyan-600">tu mejor amigo</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Atención veterinaria profesional con amor y dedicación. 
              Tu mascota merece lo mejor, nosotros se lo ofrecemos.
            </p>
          </div>

          {/* Botón principal */}
          <div className="text-center mb-12">
            {!mostrarFormulario ? (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
              >
                📅 Agendar Cita
              </button>
            ) : (
              <button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition"
              >
                ✕ Cancelar
              </button>
            )}
          </div>

          {/* Formulario */}
          {mostrarFormulario && (
            <div className="max-w-4xl mx-auto mb-12">
              <FormularioClienteTemporal
                onSuccess={handleFormSuccess}
                onCancel={() => setMostrarFormulario(false)}
              />
            </div>
          )}

          {/* Servicios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-4xl mb-3">🩺</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Emergencias 24/7</h3>
              <p className="text-gray-600">Atención inmediata para tu mascota en cualquier momento</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-4xl mb-3">🏠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Servicio a Domicilio</h3>
              <p className="text-gray-600">Cuidamos de tu mascota desde la comodidad de tu hogar</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition text-center">
              <div className="text-4xl mb-3">✂️</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Grooming Profesional</h3>
              <p className="text-gray-600">Baño, corte y estética para consentir a tu mascota</p>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 bg-gradient-to-br from-cyan-600 to-blue-600 text-white">
                <h2 className="text-2xl font-bold mb-4">📞 Contacto de Emergencia</h2>
                <p className="text-3xl font-bold mb-2">4033-8953</p>
                <p className="text-xl mb-4">WhatsApp: 8895-5782</p>
                <p className="text-sm opacity-90">📍 Monserrat, Alajuela</p>
                <p className="text-sm opacity-90">⏰ 365 días del año • 24 horas</p>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🩺 Dra. Adriana Álvarez</h2>
                <p className="text-gray-600 mb-4">Médico Veterinario con más de 10 años de experiencia en el cuidado de mascotas.</p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.facebook.com/veterinariaelexito" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition"
                  >
                    📘 Facebook
                  </a>
                  <a 
                    href="https://www.instagram.com/vetelexito" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition"
                  >
                    📷 Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Veterinaria El Éxito - Tu mascota cuidada y protegida
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default HomePage;