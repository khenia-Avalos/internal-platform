import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getClienteTemporalByIdRequest } from "/src/api/ClientesTemporales";
import { toast } from 'sonner';

function ClienteTemporalDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Función para mostrar fecha
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const clienteRes = await getClienteTemporalByIdRequest(id);
        setCliente(clienteRes.data);
        console.log("Cliente temporal cargado:", clienteRes.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
        toast.error("Error al cargar cliente temporal");
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
      <button
        onClick={() => navigate('/dashboard/clientes-temporales')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Clientes Temporales
      </button>

      {successMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {successMessage}
        </div>
      )}

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {errors.map((err, i) => <p key={i}>{err}</p>)}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !cliente && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cliente temporal no encontrado</p>
          <button
            onClick={() => navigate('/dashboard/clientes-temporales')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cliente && (
        <>
          {/* Información del cliente */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
            <div className="bg-cyan-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Información del Cliente Temporal</h2>
              {cliente.estado === 'temporal' && (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                  ⏳ Pendiente de registro
                </span>
              )}
              {cliente.estado === 'completo' && (
                <span className="inline-block mt-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                  ✅ Registro completado
                </span>
              )}
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre completo</label>
                  <p className="text-gray-900">{cliente.username} {cliente.lastname || ''}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cédula</label>
                  <p className="text-gray-900">{cliente.cedula || 'No registrada'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-gray-900">{cliente.phoneNumber}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900">{cliente.email || 'No registrado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de registro</label>
                  <p className="text-gray-900">{mostrarFechaLocal(cliente.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del registro completo (si aplica) */}
          {cliente.estado === 'completo' && cliente.direccion && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
              <div className="bg-green-600 px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Datos Completos de Registro</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dirección</label>
                    <p className="text-gray-900">{cliente.direccion || 'No registrada'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Citas temporales */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-cyan-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Citas Agendadas</h2>
              <p className="text-cyan-100 text-sm mt-1">Citas agendadas mediante el sistema rápido</p>
            </div>
            <div className="p-6">
              {cliente.citasTemporales && cliente.citasTemporales.length > 0 ? (
                <div className="space-y-4">
                  {cliente.citasTemporales.map((cita, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            Cita #{index + 1} - {cita.tipoCita === 'consulta' ? '🩺 Consulta médica' : '✂️ Estética'}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                            <div>
                              <span className="text-sm text-gray-500">Fecha:</span>
                              <p className="text-gray-800">{mostrarFechaLocal(cita.fecha)}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Horario:</span>
                              <p className="text-gray-800">{cita.horaInicio} - {cita.horaFin}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Mascota:</span>
                              <p className="text-gray-800">{cita.pacienteTemporal?.nombre || 'No especificada'}</p>
                            </div>
                            <div>
                              <span className="text-sm text-gray-500">Especie:</span>
                              <p className="text-gray-800">{cita.pacienteTemporal?.especie || 'No especificada'}</p>
                            </div>
                            {cita.sintomas && (
                              <div>
                                <span className="text-sm text-gray-500">Síntomas:</span>
                                <p className="text-gray-800">{cita.sintomas}</p>
                              </div>
                            )}
                            {cita.tiempoSintomas && (
                              <div>
                                <span className="text-sm text-gray-500">Tiempo de síntomas:</span>
                                <p className="text-gray-800">{cita.tiempoSintomas}</p>
                              </div>
                            )}
                            {cita.notas && (
                              <div className="md:col-span-2">
                                <span className="text-sm text-gray-500">Notas:</span>
                                <p className="text-gray-800">{cita.notas}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {cliente.estado !== 'completo' && (
                            <button
                              onClick={() => {
                                toast.info("Completa el registro del cliente para convertir esta cita", {
                                  duration: 3000,
                                });
                              }}
                              className="px-3 py-1 bg-cyan-100 text-cyan-700 text-sm rounded hover:bg-cyan-200"
                            >
                              Convertir a cita real
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay citas agendadas</p>
                </div>
              )}
            </div>
          </div>

          {/* Botón para completar registro (si está pendiente) */}
          {cliente.estado !== 'completo' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  toast.info("Esta funcionalidad abrirá el formulario para completar el registro del cliente", {
                    duration: 3000,
                  });
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Completar Registro del Cliente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClienteTemporalDetallePage;