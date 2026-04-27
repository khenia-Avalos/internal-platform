import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getCitaByIdRequest, updateCita } from "/src/api/cita";
import { FormularioCita } from "../../components/forms/FormularioCita";

function CitaDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [showReagendarModal, setShowReagendarModal] = useState(false);

  // Función para mostrar fecha sin conversión de zona horaria
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const cambiarEstado = async (nuevoEstado) => {
    let mensajeConfirmacion = '';
    let mensajeExito = '';
    let mensajeError = '';
    
    if (nuevoEstado === 'confirmada') {
      mensajeConfirmacion = '¿Estás seguro de confirmar esta cita?';
      mensajeExito = ' Cita confirmada exitosamente';
      mensajeError = ' Error al confirmar la cita';
    } else if (nuevoEstado === 'cancelada') {
      mensajeConfirmacion = '¿Estás seguro de cancelar esta cita?';
      mensajeExito = ' Cita cancelada';
      mensajeError = ' Error al cancelar la cita';
    } else if (nuevoEstado === 'completada') {
      mensajeConfirmacion = '¿Estás seguro de marcar esta cita como completada?';
      mensajeExito = ' Cita marcada como completada';
      mensajeError = ' Error al marcar la cita como completada';
    }
    
    if (!window.confirm(mensajeConfirmacion)) return;
    
    setUpdating(true);
    try {
      await updateCita(cita._id, { estado: nuevoEstado });
      setCita({ ...cita, estado: nuevoEstado });
      toast.success(mensajeExito, { duration: 3000 });
    } catch (error) {
      toast.error(mensajeError);
      manejarErrorResponse(error, setErrors);
    } finally {
      setUpdating(false);
    }
  };

  const handleReagendar = async (data) => {
    console.log(" Reagendando cita:", data);
    try {
      await updateCita(cita._id, data);
      const citaActualizada = await getCitaByIdRequest(id);
      setCita(citaActualizada.data);
      
      toast.success('Cita reagendada exitosamente', {
        description: `Nueva fecha: ${mostrarFechaLocal(data.fecha)} a las ${data.horaInicio}`,
        duration: 4000,
      });
      
      setShowReagendarModal(false);
    } catch (error) {
      console.error(" Error en reagendar:", error);
      toast.error(' Error al reagendar la cita');
      manejarErrorResponse(error, setErrors);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const citaRes = await getCitaByIdRequest(id);
        setCita(citaRes.data);
      } catch (error) {
        console.error("Error cargando cita:", error);
        manejarErrorResponse(error, setErrors);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const abrirModalReagendar = () => {
    setShowReagendarModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      <button
        onClick={() => navigate('/citas')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver atrás
      </button>

      {errors.length > 0 && (
        <div className="fixed top-20 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          {errors.map((err, i) => <p key={i}>{err}</p>)}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !cita && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cita no encontrada</p>
          <button
            onClick={() => navigate('/citas')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cita && (
        <>
          <InfoCard
            title="Información de la cita"
            data={[
              { label: "Doctor", value: cita.doctorId ? `${cita.doctorId.username} ${cita.doctorId.lastname}` : 'No asignado' },
              { label: "Título de la cita", value: cita.titulo || 'Sin título' },
              { label: "Descripción", value: cita.descripcion || 'No especificada' },
              { label: "Notas Adicionales", value: cita.notas || 'No especificadas' },
              { label: "Fecha", value: mostrarFechaLocal(cita.fecha) },
              { label: "Hora", value: cita.horaInicio ? `${cita.horaInicio} - ${cita.horaFin}` : 'No especificada' },
              { label: "Tipo de cita", value: cita.tipoCita || 'No especificado' },
              { label: "Dueño", value: cita.pacienteId?.ownerId?.username || 'No especificado' },
              { label: "Mascota", value: cita.pacienteId?.nombre || 'No especificada' },
              { label: "Correo del dueño", value: cita.pacienteId?.ownerId?.email || 'No especificado' },
            ]}
          />
          
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 flex-wrap">
            {cita.estado === 'pendiente' && (
              <>
                <button 
                  onClick={() => cambiarEstado('confirmada')} 
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                   Confirmar Cita
                </button>
                <button 
                  onClick={() => cambiarEstado('cancelada')} 
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                   Cancelar Cita
                </button>
                <button 
                  onClick={abrirModalReagendar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                   Reagendar Cita
                </button>
              </>
            )}
            
            {cita.estado === 'confirmada' && (
              <>
                <button 
                  onClick={() => cambiarEstado('completada')} 
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                   Marcar como Completada
                </button>
                <button 
                  onClick={abrirModalReagendar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                   Reagendar Cita
                </button>
              </>
            )}
            
            {cita.estado === 'cancelada' && (
              <p className="text-red-600 font-medium"> Esta cita ha sido cancelada</p>
            )}
            {cita.estado === 'completada' && (
              <p className="text-green-600 font-medium"> Esta cita ya fue completada</p>
            )}
          </div>
        </>
      )}

      {/* Modal para reagendar */}
      {showReagendarModal && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setShowReagendarModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowReagendarModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
              >
                ✕
              </button>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Reagendar Cita</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Cita actual: {mostrarFechaLocal(cita.fecha)} a las {cita.horaInicio}
                </p>
                <FormularioCita 
                  onSubmit={handleReagendar}
                  cita={cita}
                  isEdit={false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CitaDetallePage;