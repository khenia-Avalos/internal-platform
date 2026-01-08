import { useAuth } from "../context/authContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Link } from "react-router";

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [newUsers, setNewUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    newUsersLast7Days: 0,
    byRole: { admin: 0, client: 0, employee: 0 },
    growthPercentage: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState("");

  // ✅ Obtener API_URL de forma segura
  useEffect(() => {
    const url = import.meta.env.VITE_BACKEND_URL || 
                import.meta.env.VITE_API_URL || 
                (window.location.hostname.includes('localhost') 
                  ? "http://localhost:4000" 
                  : `https://${window.location.hostname.replace('frontend-', 'backend-').replace('www.', '')}`);
    setApiUrl(url);
    console.log("🔧 API URL configurada:", url);
  }, []);

  // ✅ Verificar si es admin
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate("/");
    }
  }, [user, loading, navigate]);

  // ✅ Cargar datos del admin
  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role === 'admin' && apiUrl) {
        try {
          setLoadingData(true);
          setError(null);
          
          const token = localStorage.getItem('token') || sessionStorage.getItem('token');
          
          if (!token) {
            throw new Error("No se encontró token de autenticación");
          }
          
          console.log("🌐 Conectando a backend:", apiUrl);
          
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos timeout
          };
          
          // Cargar datos con manejo individual de errores
          let usersResponse, statsResponse;
          
          try {
            usersResponse = await axios.get(`${apiUrl}/api/admin/new-users`, config);
            console.log("✅ Respuesta usuarios:", usersResponse.data);
          } catch (usersError) {
            console.warn("⚠️ Error cargando usuarios:", usersError.message);
            usersResponse = { data: [] };
          }
          
          try {
            statsResponse = await axios.get(`${apiUrl}/api/admin/stats`, config);
            console.log("✅ Respuesta estadísticas:", statsResponse.data);
          } catch (statsError) {
            console.warn("⚠️ Error cargando estadísticas:", statsError.message);
            statsResponse = { data: {} };
          }
          
          // 🔒 MANEJO SEGURO DE DATOS - CRÍTICO
          // Procesar usuarios - siempre garantizar array
          const usersData = usersResponse.data;
          let safeUsers = [];
          
          if (Array.isArray(usersData)) {
            safeUsers = usersData;
          } else if (usersData && typeof usersData === 'object') {
            if (Array.isArray(usersData.data)) {
              safeUsers = usersData.data;
            } else if (usersData.users && Array.isArray(usersData.users)) {
              safeUsers = usersData.users;
            }
          }
          
          console.log(`📊 Usuarios procesados: ${safeUsers.length}`);
          
          // Procesar estadísticas - siempre garantizar objeto
          const statsData = statsResponse.data;
          let safeStats = {
            totalUsers: 0,
            newUsersLast7Days: 0,
            byRole: { admin: 0, client: 0, employee: 0 },
            growthPercentage: 0
          };
          
          if (statsData && typeof statsData === 'object') {
            const data = statsData.data || statsData;
            
            safeStats = {
              totalUsers: Number(data.totalUsers) || Number(data.total) || 0,
              newUsersLast7Days: Number(data.newUsersLast7Days) || Number(data.newUsers) || 0,
              byRole: {
                admin: Number(data.byRole?.admin) || Number(data.admins) || 0,
                client: Number(data.byRole?.client) || Number(data.clients) || 0,
                employee: Number(data.byRole?.employee) || Number(data.employees) || 0
              },
              growthPercentage: Number(data.growthPercentage) || 0
            };
          }
          
          console.log("📈 Estadísticas procesadas:", safeStats);
          
          setNewUsers(safeUsers);
          setStats(safeStats);
          
        } catch (error) {
          console.error("❌ Error en fetchAdminData:", error);
          
          let errorMessage = "Error desconocido";
          
          if (error.response) {
            errorMessage = `Error ${error.response.status}: ${error.response.data?.error || error.response.statusText}`;
            if (error.response.status === 403) {
              navigate("/");
            }
          } else if (error.request) {
            errorMessage = `No se pudo conectar al servidor: ${apiUrl}`;
          } else {
            errorMessage = error.message;
          }
          
          setError(errorMessage);
          
          // Usar datos por defecto para que la UI no se rompa
          setNewUsers([]);
          setStats({
            totalUsers: 0,
            newUsersLast7Days: 0,
            byRole: { admin: 0, client: 0, employee: 0 },
            growthPercentage: 0
          });
          
        } finally {
          setLoadingData(false);
        }
      }
    };
    
    if (user?.role === 'admin' && apiUrl) {
      fetchAdminData();
    } else if (!apiUrl) {
      setLoadingData(false);
      setError("URL del backend no configurada");
    }
  }, [user, navigate, apiUrl]);

  // ✅ Asegurar que newUsers siempre sea array válido
  const safeNewUsers = Array.isArray(newUsers) ? newUsers.filter(user => user && typeof user === 'object') : [];

  if (loading || (loadingData && !error)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Cargando Panel de Administración</h2>
          <p className="text-gray-500 mb-4">Por favor, espera...</p>
          <div className="inline-block bg-cyan-50 text-cyan-700 px-4 py-2 rounded-lg text-sm">
            <span className="font-medium">Backend:</span> {apiUrl || "Configurando..."}
          </div>
          {apiUrl && (
            <p className="text-xs text-gray-400 mt-3">
              Conectando a: {apiUrl.replace('https://', '').replace('http://', '')}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* HEADER ADMIN */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl">
                  <span className="text-2xl text-white">👑</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Panel de Administración
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Bienvenido, <span className="font-semibold text-cyan-600">{user?.username}</span>
                    <span className="ml-2 px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full text-sm font-medium">
                      Administrador
                    </span>
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  <span className="font-medium">URL:</span> {apiUrl ? apiUrl.replace('https://', '').replace('http://', '') : 'No configurada'}
                </div>
                <div className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  <span className="font-medium">Usuarios:</span> {safeNewUsers.length} cargados
                </div>
                <div className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  <span className="font-medium">Modo:</span> {import.meta.env.MODE}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/tasks" 
                className="px-4 py-2 bg-white text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition flex items-center gap-2"
              >
                <span>📋</span>
                <span className="hidden sm:inline">Mis Tareas</span>
                <span className="sm:hidden">Tareas</span>
              </Link>
              <Link 
                to="/" 
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* BANNER DE ERROR */}
        {error && (
          <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6 rounded-r-lg shadow">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-red-800">Error de conexión</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    🔄 Reintentar
                  </button>
                  <a 
                    href={apiUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                  >
                    🔗 Verificar backend
                  </a>
                  <Link 
                    to="/tasks"
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition text-sm font-medium"
                  >
                    📋 Ir a tareas
                  </Link>
                </div>
                <p className="text-xs text-red-600 mt-4">
                  <strong>Solución:</strong> Verifica que el backend esté ejecutándose y que las variables de entorno estén correctamente configuradas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TARJETAS DE ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              title: "Total Usuarios", 
              value: stats.totalUsers, 
              icon: "👥", 
              color: "blue",
              description: "Usuarios registrados totales"
            },
            { 
              title: "Nuevos (7 días)", 
              value: stats.newUsersLast7Days, 
              icon: "🆕", 
              color: "green",
              description: "Registros recientes"
            },
            { 
              title: "Administradores", 
              value: stats.byRole.admin, 
              icon: "👑", 
              color: "purple",
              description: "Usuarios con rol admin"
            },
            { 
              title: "Crecimiento", 
              value: `${stats.growthPercentage}%`, 
              icon: "📈", 
              color: "yellow",
              description: "Incremento mensual"
            }
          ].map((card, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-lg p-6 border-l-4 border-${card.color}-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-xs text-gray-400 mt-2">{card.description}</p>
                </div>
                <div className={`text-3xl text-${card.color}-500 bg-${card.color}-50 p-3 rounded-full`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SECCIÓN PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NUEVOS USUARIOS */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                      <span className="p-2 bg-cyan-100 text-cyan-600 rounded-lg">📋</span>
                      Nuevos Usuarios Registrados
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Usuarios registrados en los últimos 7 días
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium">
                      {safeNewUsers.length} {safeNewUsers.length === 1 ? 'usuario' : 'usuarios'}
                    </span>
                    <button 
                      onClick={() => window.location.reload()}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
                      title="Actualizar"
                    >
                      🔄
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="overflow-hidden">
                {safeNewUsers.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-5xl mb-6 text-gray-200">👤</div>
                    <h3 className="text-lg font-medium text-gray-500 mb-2">
                      {loadingData ? 'Cargando usuarios...' : 'No hay usuarios recientes'}
                    </h3>
                    <p className="text-gray-400 max-w-md mx-auto text-sm">
                      {error 
                        ? 'No se pudieron cargar los usuarios debido a un error de conexión.' 
                        : 'Los usuarios registrados en los últimos 7 días aparecerán aquí.'}
                    </p>
                    {error && (
                      <button 
                        onClick={() => window.location.reload()}
                        className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
                      >
                        Reintentar conexión
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {safeNewUsers.map((user, index) => (
                      <div 
                        key={user._id || user.id || index} 
                        className="p-6 hover:bg-gray-50 transition group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="relative">
                              <div className="flex-shrink-0 h-14 w-14 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-cyan-700 font-bold text-xl">
                                  {(user.username || 'U').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              {user.role === 'admin' && (
                                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                  <span className="text-xs text-white">👑</span>
                                </div>
                              )}
                            </div>
                            <div className="ml-5">
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-cyan-700 transition">
                                {user.username || 'Usuario'} {user.lastname || ''}
                              </h3>
                              <div className="flex items-center mt-1.5 space-x-4">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                  <span>📧</span>
                                  {user.email || 'Sin email'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800' :
                                  user.role === 'employee' ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800' :
                                  'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800'
                                }`}>
                                  {user.role === 'admin' ? '👑 Administrador' : 
                                   user.role === 'employee' ? '👨‍💼 Empleado' : 
                                   '👤 Cliente'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short'
                              }) : 'Sin fecha'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {user.createdAt ? new Date(user.createdAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''}
                            </div>
                            <div className="mt-2">
                              <button className="text-xs text-cyan-600 hover:text-cyan-800 font-medium">
                                Ver detalles →
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {safeNewUsers.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Mostrando {Math.min(safeNewUsers.length, 10)} de {safeNewUsers.length} usuarios
                    </p>
                    <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                      Ver todos los usuarios →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* BARRA LATERAL */}
          <div className="space-y-6">
            {/* ACCIONES RÁPIDAS */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-600 rounded-lg">⚡</span>
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="block p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                      <span className="text-white">👥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-cyan-700">Gestionar Usuarios</h4>
                      <p className="text-sm text-gray-600">Ver y administrar todos los usuarios</p>
                    </div>
                  </div>
                </Link>
                
                <button className="block w-full text-left p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                      <span className="text-white">📊</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-green-700">Generar Reporte</h4>
                      <p className="text-sm text-gray-600">Exportar datos estadísticos</p>
                    </div>
                  </div>
                </button>
                
                <button className="block w-full text-left p-4 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition group">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                      <span className="text-white">⚙️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 group-hover:text-purple-700">Configuración</h4>
                      <p className="text-sm text-gray-600">Ajustes del sistema y permisos</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* ACTIVIDAD RECIENTE */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="p-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-600 rounded-lg">📝</span>
                Actividad Reciente
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">👤</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nuevo usuario registrado</p>
                    <p className="text-xs text-gray-500 mt-1">Juan Pérez se registró hace 2 horas</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">✅</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usuario verificado</p>
                    <p className="text-xs text-gray-500 mt-1">María García completó su perfil</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                  <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">🔄</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Sistema actualizado</p>
                    <p className="text-xs text-gray-500 mt-1">Backend reiniciado hace 5 horas</p>
                  </div>
                </div>
              </div>
            </div>

            {/* INFORMACIÓN DEL SISTEMA */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="p-2 bg-white/10 rounded-lg">ℹ️</span>
                Información del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm text-gray-300">Versión</span>
                  <span className="text-sm font-medium">v2.1.0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm text-gray-300">Usuarios totales</span>
                  <span className="text-sm font-medium">{stats.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-sm text-gray-300">Administradores</span>
                  <span className="text-sm font-medium">{stats.byRole.admin}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-300">Estado</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${error ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                    {error ? 'Con errores' : 'Operativo'}
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-400 text-center">
                  Última actualización: {new Date().toLocaleTimeString('es-ES')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="mt-12 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
              <div className="h-10 w-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">AP</span>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">AgendaPro Admin</h4>
                <p className="text-sm text-gray-600">Sistema de administración</p>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Sistema de Administración AgendaPro • v2.1.0
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Acceso restringido a administradores • Desarrollado con React & Node.js
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Backend: {apiUrl ? apiUrl.replace('https://', '').replace('http://', '').split('/')[0] : 'No configurado'}
              </span>
              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Usuarios: {stats.totalUsers}
              </span>
              <span className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                Modo: {import.meta.env.MODE}
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AdminDashboard;