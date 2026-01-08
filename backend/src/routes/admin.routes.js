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
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

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
    try {
      console.log("🔄 Fetching users from:", `${API_URL}/api/admin/new-users`);
      
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error("No se encontró token de autenticación");
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      };

      const response = await axios.get(`${API_URL}/api/admin/new-users`, config);
      
      console.log("✅ Respuesta completa:", response.data);
      
      // 🔥 CORRECCIÓN CRÍTICA: Tu backend devuelve {success: true, data: [...]}
      const usersData = response.data;
      let usersArray = [];
      
      if (usersData && usersData.success && Array.isArray(usersData.data)) {
        usersArray = usersData.data;
      } else if (Array.isArray(usersData)) {
        // Por si acaso el backend cambia y devuelve array directo
        usersArray = usersData;
      }
      
      console.log(`📊 Usuarios extraídos: ${usersArray.length}`);
      
      if (usersArray.length > 0) {
        console.log("👤 Primer usuario:", usersArray[0]);
      }

      // Filtrar solo usuarios con role "client" y ordenar por fecha
      const clientUsers = usersArray
        .filter(u => u && u.role === 'client')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNewUsers(clientUsers);
      setLastUpdate(new Date());
      setError(null);
      
    } catch (error) {
      console.error("❌ Error cargando usuarios:", error);
      
      // Mostrar error específico
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        
        if (error.response.status === 403) {
          setError("Acceso denegado. No tienes permisos de administrador.");
          setTimeout(() => navigate("/"), 2000);
        } else if (error.response.status === 401) {
          setError("Sesión expirada. Redirigiendo al login...");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          setError(`Error del servidor: ${error.response.status}`);
        }
      } else if (error.request) {
        setError("No se pudo conectar al servidor. Verifica tu conexión.");
      } else {
        setError(`Error: ${error.message}`);
      }
    }
  };

  // ✅ Cargar datos inicial
  useEffect(() => {
    if (user?.role === 'admin') {
      setLoadingData(true);
      fetchNewUsers().finally(() => setLoadingData(false));
    }
  }, [user]);

  // ✅ Configurar auto-refresh
  useEffect(() => {
    if (user?.role === 'admin' && autoRefresh) {
      const interval = setInterval(() => {
        console.log("🔄 Auto-refresh ejecutado");
        fetchNewUsers();
      }, 30000); // 30 segundos

      return () => clearInterval(interval);
    }
  }, [user, autoRefresh]);

  // ✅ Formatear fecha relativa
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Sin fecha";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora mismo";
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // ✅ Refrescar manualmente
  const handleRefresh = () => {
    setLoadingData(true);
    fetchNewUsers().finally(() => setLoadingData(false));
  };

  // ✅ Alternar auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // ✅ Copiar ID al portapapeles
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("ID copiado al portapapeles");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
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
              <p className="text-sm text-gray-500 mt-1">
                <span className="inline-flex items-center">
                  <span className={`h-2 w-2 rounded-full mr-2 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  {autoRefresh ? 'Actualización automática: ACTIVADA' : 'Actualización automática: DESACTIVADA'}
                </span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toggleAutoRefresh}
                className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {autoRefresh ? (
                  <>
                    <span>🔴</span>
                    <span>Desactivar Auto</span>
                  </>
                ) : (
                  <>
                    <span>🟢</span>
                    <span>Activar Auto</span>
                  </>
                )}
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={loadingData}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                {loadingData ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span>Cargando...</span>
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition flex items-center gap-2"
              >
                <span>📋</span>
                <span>Tareas</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="text-red-500 mr-3">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Clientes</p>
                <p className="text-2xl font-bold text-gray-900">{newUsers.length}</p>
              </div>
              <div className="text-2xl text-blue-500">👥</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Últimas 24h</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newUsers.filter(user => {
                    const userDate = new Date(user.createdAt);
                    const now = new Date();
                    const diffHours = (now - userDate) / 3600000;
                    return diffHours <= 24;
                  }).length}
                </p>
              </div>
              <div className="text-2xl text-green-500">🆕</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Última hora</p>
                <p className="text-2xl font-bold text-gray-900">
                  {newUsers.filter(user => {
                    const userDate = new Date(user.createdAt);
                    const now = new Date();
                    const diffHours = (now - userDate) / 3600000;
                    return diffHours <= 1;
                  }).length}
                </p>
              </div>
              <div className="text-2xl text-purple-500">⏰</div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lastUpdate ? 'Conectado' : 'Desconectado'}
                </p>
              </div>
              <div className="text-2xl text-cyan-500">📡</div>
            </div>
          </div>
        </div>

        {/* USERS TABLE */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  📋 Usuarios Clientes Registrados
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Mostrando {newUsers.length} usuario{newUsers.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                {lastUpdate && (
                  <div className="text-sm text-gray-500">
                    Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
                  </div>
                )}
                <div className="text-xs px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full">
                  {autoRefresh ? 'Auto: ON' : 'Auto: OFF'}
                </div>
              </div>
            </div>
          </div>

          {loadingData ? (
            <div className="py-16 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando usuarios...</p>
              <p className="text-sm text-gray-400 mt-2">Conectando al servidor</p>
            </div>
          ) : newUsers.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl text-gray-300 mb-4">👤</div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                No hay usuarios registrados
              </h3>
              <p className="text-gray-400">
                {error ? 'Error al cargar datos' : 'No se encontraron usuarios clientes en los últimos 7 días'}
              </p>
              <button
                onClick={handleRefresh}
                className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
              >
                Reintentar carga
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-cyan-700 font-bold text-lg">
                              {userItem.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {userItem.username} {userItem.lastname}
                            </div>
                            <div className="text-xs text-gray-500">
                              Rol: <span className="text-green-600 font-medium">Cliente</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{userItem.email}</div>
                        <div className="text-sm text-gray-500">{userItem.phoneNumber}</div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded">
                          {userItem._id?.substring(0, 16)}...
                        </div>
                        <button
                          onClick={() => copyToClipboard(userItem._id)}
                          className="text-xs text-cyan-600 hover:text-cyan-800 mt-1 flex items-center gap-1"
                        >
                          <span>📋</span>
                          <span>Copiar ID</span>
                        </button>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(userItem.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(userItem.createdAt).toLocaleTimeString('es-ES', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatRelativeTime(userItem.createdAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* FOOTER */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Mostrando {Math.min(newUsers.length, 10)} de {newUsers.length} usuarios
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-xs text-gray-400">
                      Backend: {API_URL.replace('https://', '').replace('http://', '')}
                    </div>
                    <button
                      onClick={handleRefresh}
                      className="text-sm text-cyan-600 hover:text-cyan-800"
                    >
                      ↻ Actualizar ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* DEBUG INFO - Solo en desarrollo */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-2">🔍 Información de Debug</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>API URL: {API_URL}</p>
              <p>Usuario actual: {user?.username} ({user?.role})</p>
              <p>Token: {localStorage.getItem('token') ? 'Presente' : 'No encontrado'}</p>
              <p>Auto-refresh: {autoRefresh ? 'Activo' : 'Inactivo'}</p>
              <p>Última actualización: {lastUpdate ? lastUpdate.toLocaleString() : 'Nunca'}</p>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="mt-12 py-6 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Panel de Administración • AgendaPro
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Acceso restringido a administradores • {newUsers.length} usuarios registrados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;