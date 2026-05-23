import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";
import { useState } from "react";
import { FormularioClienteTemporal } from "../components/forms/FormularioClienteTemporal";
import { toast, Toaster } from 'sonner';

// Imagen desde la carpeta public
const logoImg = '/img/fondo.jpg';

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
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <img src={logoImg} alt="Veterinaria El Éxito" className="w-24 h-24 mx-auto mb-4 rounded-full object-cover" />
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              Hola, <span className="text-cyan-600">{user?.username}</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Bienvenido a tu panel de gestión veterinaria
            </p>
            <Link
              to="/dashboard"
              className="inline-block bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg"
            >
              Ir a mi cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFormSuccess = () => {
    setMostrarFormulario(false);
    toast.success("Cita agendada exitosamente", {
      duration: 5000,
      position: "top-right"
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors closeButton duration={3000} />
      
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <img src={logoImg} alt="Veterinaria El Éxito" className="w-32 h-32 mx-auto mb-6 rounded-full object-cover shadow-lg" />
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-4">
              Cuidamos de <span className="text-cyan-600">tu mascota</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Atención veterinaria profesional con amor y dedicación. 
              Tu mascota merece lo mejor.
            </p>
          </div>

          {/* Botón principal */}
          <div className="text-center mb-12">
            {!mostrarFormulario ? (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg"
              >
                Agendar Cita
              </button>
            ) : (
              <button
                onClick={() => setMostrarFormulario(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-500 transition"
              >
                Cancelar
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
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center border border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-cyan-600">24/7</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Emergencias</h3>
              <p className="text-gray-600">Atención inmediata para tu mascota en cualquier momento</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center border border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-cyan-600">Servicio a Domicilio</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">A Domicilio</h3>
              <p className="text-gray-600">Cuidamos de tu mascota desde la comodidad de tu hogar</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition text-center border border-gray-100">
              <div className="w-16 h-16 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-cyan-600">Grooming</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Grooming</h3>
              <p className="text-gray-600">Baño, corte y estética profesional</p>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-16 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 bg-cyan-600 text-white">
                <h2 className="text-2xl font-bold mb-4">Contacto de Emergencia</h2>
                <p className="text-3xl font-bold mb-2">4033-8953</p>
                <p className="text-xl mb-4">WhatsApp: 8895-5782</p>
                <p className="text-sm opacity-90">Monserrat, Alajuela</p>
                <p className="text-sm opacity-90">365 días del año - 24 horas</p>
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Dra. Adriana Álvarez</h2>
                <p className="text-gray-600 mb-4">Médico Veterinario con amplia experiencia en el cuidado de mascotas.</p>
                <div className="flex gap-4">
                  <a 
                    href="https://www.facebook.com/veterinariaelexito" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-cyan-600 transition"
                  >
                    Facebook
                  </a>
                  <a 
                    href="https://www.instagram.com/vetelexito" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-cyan-600 transition"
                  >
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="text-center py-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              {new Date().getFullYear()} Veterinaria El Éxito - Tu mascota cuidada y protegida
            </p>
          </footer>
        </div>
      </section>
    </div>
  );
}

export default HomePage;