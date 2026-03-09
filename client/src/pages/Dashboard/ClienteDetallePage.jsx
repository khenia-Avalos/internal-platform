import { useParams, useNavigate, Link  } from 'react-router';
import { useState, useEffect } from 'react';
import { 

  getClienteByIdRequest,

} from "/src/api/clientes";
import { 
  getPacienteByOwnerRequest,

} from "/src/api/pacientes";

function ClienteDetallePage() {
      const navigate = useNavigate();

  const { id } = useParams(); // ← Obtiene el ID de la URL
  const [cliente, setCliente] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
  const cargarDatos = async () => {
    setLoading(true);
    try {
      // 1. Obtener cliente por ID
      const clienteRes = await getClienteByIdRequest(id);
      setCliente(clienteRes.data);
      
      // 2. Obtener mascotas de este cliente
      const mascotasRes = await getPacienteByOwnerRequest(ownerId);
      setMascotas(mascotasRes.data);
      
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (id) {
    cargarDatos();
  }
}, [id]);
 return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Botón volver */}
      <button
        onClick={() => navigate('/clientes')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Clientes
      </button>

      {/* Estado de carga */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {/* Cliente no encontrado */}
      {!loading && !cliente && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cliente no encontrado</p>
          <button
            onClick={() => navigate('/clientes')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {/* Datos del cliente */}
      {!loading && cliente && (
        <>
          {/* Tarjeta del cliente */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Información del Cliente</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Nombre completo</p>
                  <p className="text-lg font-semibold text-gray-800">{cliente.username} {cliente.lastname}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-lg text-gray-800">{cliente.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="text-lg text-gray-800">{cliente.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cédula</p>
                  <p className="text-lg text-gray-800">{cliente.cedula}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="text-lg text-gray-800">{cliente.direccion}</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition">
                  Editar Cliente
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  + Agregar Mascota
                </button>
              </div>
            </div>
          </div>

          {/* Sección de mascotas */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Mascotas de {cliente.username}</h2>
              <span className="bg-white text-cyan-600 px-3 py-1 rounded-full text-sm font-semibold">
                {mascotas.length} {mascotas.length === 1 ? 'mascota' : 'mascotas'}
              </span>
            </div>

            <div className="p-6">
              {mascotas.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Este cliente aún no tiene mascotas registradas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mascotas.map((mascota) => (
                    <div key={mascota._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{mascota.nombre}</h3>
                          <p className="text-sm text-gray-600">{mascota.especie} • {mascota.raza || 'Sin raza'}</p>
                          {mascota.edad && (
                            <p className="text-sm text-gray-600 mt-1">Edad: {mascota.edad} años</p>
                          )}
                        </div>
                        <Link
                          to={`/mascotas/${mascota._id}`}
                          className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                        >
                          Ver detalle →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ClienteDetallePage;