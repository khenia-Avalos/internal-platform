import { useAuth } from "../context/authContext";
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
  //autenticado
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-800 mb-6">
              ¡Hola de nuevo,{" "}
              <span className="text-cyan-600">{user?.username}</span>!
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Tu panel de gestión está listo. Desde aquí puedes administrar
              citas, clientes y todo lo necesario para tu negocio.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link
                to="/agenda"
                className="bg-cyan-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition shadow-lg hover:shadow-xl"
              >
                📅 Ir a mi Agenda
              </Link>
              <Link
                to="/clientes"
                className="bg-white text-cyan-600 border-2 border-cyan-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-cyan-50 transition shadow-lg"
              >
                👥 Ver mis Clientes
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
  
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Crear Nueva Cita
              </h3>
              <p className="text-gray-600 mb-4">
                Agenda un nuevo servicio para un cliente existente o nuevo.
              </p>
              <Link
                to="/citas/nueva"
                className="text-cyan-600 font-semibold hover:text-cyan-700"
              >
                Agendar ahora →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Ver Reportes
              </h3>
              <p className="text-gray-600 mb-4">
                Consulta tus ingresos, servicios populares y clientes
                frecuentes.
              </p>
              <Link
                to="/reportes"
                className="text-cyan-600 font-semibold hover:text-cyan-700"
              >
                Ver estadísticas →
              </Link>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Configurar Servicios
              </h3>
              <p className="text-gray-600 mb-4">
                Añade o edita los servicios que ofreces, con sus precios y
                duraciones.
              </p>
              <Link
                to="/configuracion/servicios"
                className="text-cyan-600 font-semibold hover:text-cyan-700"
              >
                Personalizar →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //no autenticado
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <section className="py-20 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
          Gestiona tu agenda y conoce a tus clientes.
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
          <strong className="text-cyan-600">AgendaPro+</strong> es el sistema
          todo-en-uno para negocios de servicios. Agenda citas, guarda
          historiales, envía recordatorios y haz crecer tu negocio desde un solo
          lugar.
        </p>
       
 
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-cyan-100 to-blue-100 h-64 rounded-2xl flex items-center justify-center">
          <p className="text-gray-500">[Dashboard de ejemplo del sistema]</p>
        </div>
      </section>

      {/* SECCIÓN: ¿PARA QUIÉN ES? */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Perfecto para tu negocio
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition shadow-lg border border-gray-100">
              <div className="text-4xl mb-4">🦷</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Clínicas Dentales
              </h3>
              <p className="text-gray-600">
                Controla tratamientos, historial médico y recordatorios de
                higiene.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition shadow-lg border border-gray-100">
              <div className="text-4xl mb-4">💇</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Salones de Belleza
              </h3>
              <p className="text-gray-600">
                Gestiona estilistas, preferencias de color y venta de productos.
              </p>
            </div>
            <div className="text-center p-8 rounded-2xl hover:shadow-xl transition shadow-lg border border-gray-100">
              <div className="text-4xl mb-4">🐕</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Peluquerías Caninas
              </h3>
              <p className="text-gray-600">
                Registra notas por mascota, alertas de vacunas y clientes
                frecuentes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN: CARACTERÍSTICAS */}
      <section className="py-16 px-4" id="features">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Todo lo que necesitas, integrado
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-4 text-cyan-600">📅</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Agenda Inteligente
              </h3>
              <p className="text-gray-600">
                Visualiza, crea y reorganiza citas en vista diaria/semanal.
                Evita dobles reservas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-4 text-cyan-600">🧑‍💼</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Expediente Completo
              </h3>
              <p className="text-gray-600">
                Historial de cada cliente: visitas, notas, alergias y
                preferencias.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-4 text-cyan-600">🔔</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Recordatorios Automáticos
              </h3>
              <p className="text-gray-600">
                Reduce incomparecencias con notificaciones por email o SMS
                automáticas.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="text-3xl mb-4 text-cyan-600">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Ventas y Reportes
              </h3>
              <p className="text-gray-600">
                Registra pagos, emite facturas y descubre tus servicios más
                populares.
              </p>
            </div>
          </div>
        </div>
      </section>

  
    </div>
  );
}

export default HomePage;
