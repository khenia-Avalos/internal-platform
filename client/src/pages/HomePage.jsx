import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";
import { useState } from "react";
import { FormularioClienteTemporal } from "../components/forms/FormularioClienteTemporal";
import { toast, Toaster } from 'sonner';
const fondoImg = '/img/fondo.jpg';

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
            Ir a mi cuenta 
          </Link>
        </div>
      </div>
    );
  }

  // Función para manejar el éxito del formulario
  const handleFormSuccess = () => {
    setMostrarFormulario(false);
    toast.success(" Cita agendada exitosamente", {
      duration: 5000,
      position: "top-right"
    });
  };

  // Si NO está autenticado (público general)
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${fondoImg})` }}
    >
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="min-h-screen bg-black/50 py-12 px-4">
        <Toaster position="top-right" richColors closeButton duration={3000} />
        
        <div className="max-w-6xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Veterinaria El Éxito
            </h1>
            <p className="text-xl text-white mb-8 drop-shadow-lg">
              ¡Tu mascota cuidada y protegida desde la comodidad de tu hogar!
            </p>
            
            {/* Botón para mostrar/ocultar el formulario */}
            {!mostrarFormulario && (
              <button
                onClick={() => setMostrarFormulario(true)}
                className="inline-block bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg hover:shadow-xl"
              >
                 Crear cita
              </button>
            )}
            
            {mostrarFormulario && (
              <button
                onClick={() => setMostrarFormulario(false)}
                className="inline-block bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
              >
                ✕ Cancelar
              </button>
            )}
            
            <p className="mt-6 text-sm text-white drop-shadow-md">
              ¿Eres cliente registrado?{" "}
              <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline">
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

          {/* Sección de información de la clínica */}
          <div className="mt-12 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna izquierda - Servicios */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                   Nuestros Servicios
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2"> Atención de emergencias en mascotas 24/7</li>
                  <li className="flex items-center gap-2"> Control de vacunas</li>
                  <li className="flex items-center gap-2"> Grooming (baño y corte)</li>
                  <li className="flex items-center gap-2"> Castración</li>
                  <li className="flex items-center gap-2"> Servicio a domicilio (todo el país)</li>
                  <li className="flex items-center gap-2"> Anestesia inhalatoria</li>
                  <li className="flex items-center gap-2"> Control de parásitos</li>
                  <li className="flex items-center gap-2"> Consulta veterinaria especializada</li>
                </ul>
              </div>

              {/* Columna derecha - Contacto */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                   Contacto y Ubicación
                </h2>
                <div className="space-y-3 text-gray-700">
                  <p className="flex items-center gap-2">
                     <strong>Ubicación:</strong> Monserrat, Alajuela
                  </p>
                  <p className="flex items-center gap-2">
                     <strong>Teléfono de emergencias:</strong> 4033-8953
                  </p>
                  <p className="flex items-center gap-2">
                     <strong>WhatsApp:</strong> 8895-5782
                  </p>
                  <p className="flex items-center gap-2">
                     <strong>Horario:</strong> 365 días del año, 24 horas al día
                  </p>
                  <p className="flex items-center gap-2">
                     <strong>Servicio a domicilio:</strong> Todo el país
                  </p>
                </div>

                {/* Redes Sociales */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3"> Síguenos en redes sociales</h3>
                  <div className="flex gap-4">
                    <a 
                      href="https://www.facebook.com/veterinariaelexito" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      <span>fb</span> Veterinaria El Éxito
                    </a>
                    <a 
                      href="https://www.instagram.com/vetelexito" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
                    >
                      <span>ig</span> @vetelexito
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Mensaje de bienvenida */}
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-gray-700">
                <span className="font-semibold">🩺 Dra. Adriana Álvarez</span> - Médico Veterinario
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Comprometidos con la salud y bienestar de tu mascota. 
                Brindamos atención de calidad con amor y profesionalismo.
              </p>
              <p className="text-xs text-gray-400 mt-4">
                © {new Date().getFullYear()} Veterinaria El Éxito - Todos los derechos reservados
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;