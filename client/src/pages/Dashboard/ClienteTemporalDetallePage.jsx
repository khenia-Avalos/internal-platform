import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getClienteTemporalByIdRequest } from "../../api/ClientesTemporales";

function ClienteTemporalDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // Función para mostrar fecha local
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
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
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
          <InfoCard
            title="Información del Cliente Temporal"
            data={[
              { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname || ''}` },
              { label: "Cédula", value: cliente.cedula || 'No registrada' },
              { label: "Teléfono", value: cliente.phoneNumber },
              { label: "Email", value: cliente.email || 'No registrado' },
              { label: "Estado", value: cliente.estado === 'temporal' ? '⏳ Pendiente de registro' : '✅ Registro completado' },
              { label: "Fecha de registro", value: mostrarFechaLocal(cliente.createdAt) },
            ]}
          />
          
          {/* Mostrar direccion solo si está completo */}
          {cliente.estado === 'completo' && cliente.direccion && (
            <div className="mt-4">
              <InfoCard
                title="Datos de Registro Completo"
                data={[
                  { label: "Dirección", value: cliente.direccion },
                ]}
              />
            </div>
          )}

          {/* Citas temporales */}
          <h3 className="text-xl font-semibold mb-4 mt-6">Citas Agendadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cliente.citasTemporales && cliente.citasTemporales.length > 0 ? (
              cliente.citasTemporales.map((cita, index) => (
                <InfoCard
                  key={index}
                  title={`Cita ${index + 1} - ${cita.tipoCita === 'consulta' ? '🩺 Consulta' : '✂️ Estética'}`}
                  data={[
                    { label: "Fecha", value: mostrarFechaLocal(cita.fecha) },
                    { label: "Horario", value: `${cita.horaInicio} - ${cita.horaFin}` },
                    { label: "Mascota", value: cita.pacienteTemporal?.nombre || 'No especificada' },
                    { label: "Especie", value: cita.pacienteTemporal?.especie || 'No especificada' },
                    { label: "Síntomas", value: cita.sintomas || 'No registrados' },
                    { label: "Tiempo de síntomas", value: cita.tiempoSintomas || 'No registrado' },
                    { label: "Notas", value: cita.notas || 'Sin notas' },
                  ]}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay citas agendadas</p>
              </div>
            )}
          </div>

          {/* Botón para completar registro si está pendiente */}
          {cliente.estado !== 'completo' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  // Aquí puedes abrir un modal para completar registro
                  alert("Funcionalidad de completar registro en desarrollo");
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                + Completar Registro
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ClienteTemporalDetallePage; 