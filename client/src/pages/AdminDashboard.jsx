import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Link } from "react-router";

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [newUsers, setNewUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // ✅ URL del backend
  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

  // ✅ Verificar si es admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // ✅ Función para cargar usuarios
  const fetchNewUsers = async () => {
    if (user?.role === 'admin') {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error("No se encontró token de autenticación");
        }

        const config = {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        };

        const response = await axios.get(`${API_URL}/api/admin/new-users`, config);
        
        // 🔒 Procesar datos de forma segura
        const usersData = response.data;
        let safeUsers = [];

        if (Array.isArray(usersData)) {
          safeUsers = usersData;
        } else if (usersData && typeof usersData === 'object' && Array.isArray(usersData.data)) {
          safeUsers = usersData.data;
        }

        // Filtrar solo usuarios con role "client"
        const clientUsers = safeUsers.filter(user => user.role === 'client');
        
        // Ordenar por fecha más reciente primero
        clientUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setNewUsers(clientUsers);
        setError(null);
        
      } catch (error) {
        console.error("❌ Error cargando usuarios:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/");
        }
      }
    }
  };

  // ✅ Cargar datos inicial y configurar refresco automático
  useEffect(() => {
    if (user?.role === 'admin') {
      // Cargar datos inmediatamente
      fetchNewUsers().finally(() => setLoadingData(false));

      // Configurar refresco automático cada 30 segundos
      const interval = setInterval(fetchNewUsers, 30000);
      setRefreshInterval(interval);

      // Limpiar intervalo al desmontar
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [user]);

  // ✅ Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Hace unos segundos";
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ Refrescar manualmente
  const handleRefresh = () => {
    setLoadingData(true);
    fetchNewUsers().finally(() => setLoadingData(false));
  };

  if (loading || loadingData) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando Panel de Administración</h2>
          <p className="text-gray-500 mb-4">Por favor, espera...</p>
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
      <header className="bg-white shadow border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                👑 Panel de Administración
              </h1>
              <p className="text-gray-600 mt-1">
                Bienvenido, <span className="font-semibold text-cyan-600">{user?.username}</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleRefresh}
                disabled={loadingData}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loadingData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Actualizando...</span>
                  </>
                ) : (
                  <>
                    <span>🔄</span>
                    <span>Actualizar</span>
                  </>
                )}
              </button>
              <Link 
                to="/tasks" 
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
              >
                📋 Tareas
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* NOTIFICACIONES EN VIVO */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  📊 Registros en Vivo
                </h2>
                <p className="text-gray-600 text-sm">
                  Usuarios clientes registrados recientemente
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Actualización automática cada 30 segundos
                </div>
                <div className={`h-3 w-3 rounded-full ${refreshInterval ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              </div>
            </div>

            {/* CONTADOR Y ESTADO */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600">Total Registrados</div>
                <div className="text-2xl font-bold text-gray-900">{newUsers.length}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600">Últimas 24h</div>
                <div className="text-2xl font-bold text-gray-900">
                  {newUsers.filter(user => {
                    const userDate = new Date(user.createdAt);
                    const now = new Date();
                    const diffHours = (now - userDate) / 3600000;
                    return diffHours <= 24;
                  }).length}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600">Última hora</div>
                <div className="text-2xl font-bold text-gray-900">
                  {newUsers.filter(user => {
                    const userDate = new Date(user.createdAt);
                    const now = new Date();
                    const diffHours = (now - userDate) / 3600000;
                    return diffHours <= 1;
                  }).length}
                </div>
              </div>
              <div className="bg-cyan-50 p-4 rounded-lg">
                <div className="text-sm text-cyan-600">Estado</div>
                <div className="text-2xl font-bold text-gray-900 flex items-center">
                  <div className={`h-3 w-3 rounded-full mr-2 ${refreshInterval ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {refreshInterval ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>

            {/* LISTA DE USUARIOS */}
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <div>
                    <p className="font-medium">Error al cargar usuarios</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              </div>
            ) : newUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4 text-gray-300">👤</div>
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  No hay usuarios registrados
                </h3>
                <p className="text-gray-400 text-sm">
                  Los nuevos usuarios clientes aparecerán aquí automáticamente
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Información
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {newUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-cyan-600 font-bold">
                                  {user.username?.charAt(0).toUpperCase() || 'U'}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username} {user.lastname}
                                </div>
                                <div className="text-xs text-cyan-600 bg-cyan-50 px-2 py-1 rounded-full inline-block mt-1">
                                  Cliente
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.email}</div>
                            <div className="text-sm text-gray-500">{user.phoneNumber}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs font-mono text-gray-500 bg-gray-50 p-2 rounded">
                              {user._id?.substring(0, 8)}...
                            </div>
                            <button 
                              onClick={() => navigator.clipboard.writeText(user._id)}
                              className="text-xs text-cyan-600 hover:text-cyan-800 mt-1"
                              title="Copiar ID"
                            >
                              📋 Copiar
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(user.createdAt).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(user.createdAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PIE DE TABLA */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Mostrando {newUsers.length} usuario{newUsers.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-400">
                    Última actualización: {new Date().toLocaleTimeString('es-ES')}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INFORMACIÓN ADICIONAL */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ESTADÍSTICAS RÁPIDAS */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📈 Distribución por Hora
            </h3>
            <div className="space-y-4">
              {[24, 12, 6, 1].map((hours) => {
                const count = newUsers.filter(user => {
                  const userDate = new Date(user.createdAt);
                  const now = new Date();
                  const diffHours = (now - userDate) / 3600000;
                  return diffHours <= hours;
                }).length;

                return (
                  <div key={hours} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Últimas {hours} {hours === 1 ? 'hora' : 'horas'}
                    </span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-900 mr-2">{count}</span>
                      <div className="h-2 bg-gray-200 rounded-full w-32">
                        <div 
                          className="h-2 bg-cyan-500 rounded-full"
                          style={{ width: `${(count / Math.max(newUsers.length, 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* INFORMACIÓN DEL SISTEMA */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              ⚙️ Configuración del Sistema
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Backend URL</span>
                <span className="text-sm font-mono text-gray-900">
                  {API_URL.replace('https://', '').replace('http://', '')}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Modo</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  import.meta.env.PROD 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {import.meta.env.PROD ? 'Producción' : 'Desarrollo'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Intervalo de actualización</span>
                <span className="text-sm text-gray-900">30 segundos</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Sesión activa</span>
                <span className="text-sm text-gray-900">
                  {user?.username} ({user?.email})
                </span>
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
              © {new Date().getFullYear()} Panel de Administración • AgendaPro
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Monitoreo en tiempo real • Solo administradores
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;