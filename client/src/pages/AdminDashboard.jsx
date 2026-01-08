import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Link } from "react-router";

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [newUsers, setNewUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);

  // ✅ OBTENER URL DESDE VARIABLES DE ENTORNO
  // En local: VITE_API_URL=http://localhost:4000
  // En Render: VITE_API_URL=https://tu-backend.onrender.com
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

  // ✅ Verificar si es admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // ✅ Cargar datos del admin
  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role === 'admin') {
        try {
          setLoadingData(true);
          setError(null);
          
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          if (!token) {
            throw new Error("No authentication token found");
          }
          
          console.log("🌐 API URL:", API_URL);
          console.log("🔑 Token disponible:", token ? "Sí" : "No");
          
          // Configurar headers
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          };
          
          // Cargar datos en paralelo - USANDO VARIABLE DE ENTORNO
          const [usersRes, statsRes] = await Promise.all([
            axios.get(`${API_URL}/api/admin/new-users`, config),
            axios.get(`${API_URL}/api/admin/stats`, config)
          ]);
          
          console.log("✅ Datos recibidos - Usuarios:", usersRes.data);
          console.log("✅ Datos recibidos - Stats:", statsRes.data);
          
          setNewUsers(usersRes.data?.data || usersRes.data || []);
          setStats(statsRes.data?.data || statsRes.data || {});
        } catch (error) {
          console.error("❌ Error cargando datos admin:", error);
          console.error("URL usada:", API_URL);
          console.error("Error completo:", error.response || error.message);
          
          // Manejo detallado de errores
          if (error.response) {
            // El servidor respondió con error
            setError(`Error ${error.response.status}: ${error.response.data?.error || error.response.statusText}`);
            
            if (error.response.status === 403) {
              navigate("/");
            } else if (error.response.status === 401) {
              setError("Sesión expirada. Por favor, inicia sesión nuevamente.");
            }
          } else if (error.request) {
            // No se recibió respuesta
            setError(`No se pudo conectar con el servidor: ${API_URL}`);
            console.error("Request was made but no response received");
          } else {
            // Error en la configuración
            setError(error.message || "Error desconocido al cargar datos");
          }
        } finally {
          setLoadingData(false);
        }
      }
    };
    
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user, navigate, API_URL]);

  if (loading || loadingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
          <p className="text-sm text-gray-400 mt-2">Conectando a: {API_URL}</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER ADMIN */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🛠️ Panel de Administración
              </h1>
              <p className="text-gray-600 mt-2">
                Bienvenido, <span className="font-semibold text-cyan-600">{user?.username}</span>
                <span className="ml-2 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                  Administrador
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Backend: {API_URL.replace('https://', '').replace('http://', '').split('/')[0]}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-gray-900 hover:underline"
              >
                ← Volver al inicio
              </Link>
              <button 
                onClick={() => navigate('/tasks')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
              >
                Ver tareas
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* MOSTRAR ERROR SI HAY */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-500">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  Error al cargar datos: {error}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  URL del backend: {API_URL}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {import.meta.env.PROD 
                    ? "Modo producción - Verifica que el backend esté desplegado" 
                    : "Modo desarrollo - Verifica que el backend esté corriendo en puerto 4000"}
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-blue-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalUsers || 0}</p>
              </div>
              <div className="text-2xl text-blue-500">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nuevos (7 días)</p>
                <p className="text-2xl font-bold text-gray-800">{stats.newUsersLast7Days || 0}</p>
              </div>
              <div className="text-2xl text-green-500">🆕</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Clientes</p>
                <p className="text-2xl font-bold text-gray-800">{stats.byRole?.client || 0}</p>
              </div>
              <div className="text-2xl text-purple-500">👤</div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow p-6 border-l-4 border-yellow-500 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Crecimiento</p>
                <p className="text-2xl font-bold text-gray-800">{stats.growthPercentage || 0}%</p>
              </div>
              <div className="text-2xl text-yellow-500">📈</div>
            </div>
          </div>
        </div>

        {/* SECCIÓN PRINCIPAL: NUEVOS USUARIOS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">📋</span> Nuevos Usuarios Registrados
                  {newUsers.length > 0 && (
                    <span className="ml-2 px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs">
                      {newUsers.length} nuevos
                    </span>
                  )}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Usuarios registrados en los últimos 7 días
                </p>
              </div>
              
              <div className="overflow-x-auto">
                {newUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4 text-gray-300">📭</div>
                    <p className="text-gray-500">No hay nuevos registros</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Los nuevos usuarios aparecerán aquí automáticamente
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {newUsers.map((user) => (
                      <div key={user._id || user.id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-cyan-600 font-bold text-lg">
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.username} {user.lastname}
                            </h3>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-sm text-gray-500">{user.email}</span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'employee' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role || 'client'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {new Date(user.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(user.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BARRA LATERAL CON ACCIONES */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ⚡ Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="block w-full text-left px-4 py-3 rounded-lg hover:bg-cyan-50 border border-cyan-200 text-cyan-700"
                >
                  <span className="font-medium">👥 Ver todos los usuarios</span>
                  <span className="text-sm block text-gray-600">Gestionar cuentas y permisos</span>
                </Link>
                <button className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                  <span className="font-medium">📊 Generar reporte</span>
                  <span className="text-sm text-gray-500 block">Exportar datos a Excel</span>
                </button>
                <button className="block w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                  <span className="font-medium">⚙️ Configuración</span>
                  <span className="text-sm text-gray-500 block">Ajustes del sistema</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                📝 Actividad Reciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm">👤</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Nuevo registro</span>
                      <span className="text-gray-500 text-xs block">Hace 2 horas</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-sm">✅</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-800">
                      <span className="font-medium">Usuario verificado</span>
                      <span className="text-gray-500 text-xs block">Hace 5 horas</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* INFO DEL SISTEMA */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                ℹ️ Información del Sistema
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Base de datos:</span>
                  <span className="text-sm font-medium">MongoDB Atlas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Usuarios totales:</span>
                  <span className="text-sm font-medium">{stats.totalUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Administradores:</span>
                  <span className="text-sm font-medium">{stats.byRole?.admin || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modo:</span>
                  <span className="text-sm font-medium">{import.meta.env.MODE}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Sistema de Administración AgendaPro • v1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Backend: {API_URL.replace('https://', '').replace('http://', '')} • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;