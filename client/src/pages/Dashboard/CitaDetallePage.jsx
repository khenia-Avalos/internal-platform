import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getCitaByIdRequest, updateCita } from "/src/api/cita";
import { FormularioCita } from "../../components/forms/FormularioCita";

function CitaDetallePage() {
  console.log("🚀 COMPONENTE CitaDetallePage RENDERIZADO");
  
  const navigate = useNavigate();
  const { id } = useParams();
  console.log("🚀 ID de la cita:", id);
  
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [showReagendarModal, setShowReagendarModal] = useState(false);

  console.log("🚀 Estado showReagendarModal:", showReagendarModal);

  const cambiarEstado = async (nuevoEstado) => {
    console.log("🚀 cambiarEstado llamado con:", nuevoEstado);
    let mensajeConfirmacion = '';
    let mensajeExito = '';
    
    if (nuevoEstado === 'confirmada') {
      mensajeConfirmacion = '¿Estás seguro de confirmar esta cita?';
      mensajeExito = 'Cita confirmada exitosamente';
    } else if (nuevoEstado === 'cancelada') {
      mensajeConfirmacion = '¿Estás seguro de cancelar esta cita?';
      mensajeExito = 'Cita cancelada exitosamente';
    } else if (nuevoEstado === 'completada') {
      mensajeConfirmacion = '¿Estás seguro de marcar esta cita como completada?';
      mensajeExito = 'Cita marcada como completada';
    }
    
    if (!window.confirm(mensajeConfirmacion)) return;
    
    setUpdating(true);
    try {
      await updateCita(cita._id, { estado: nuevoEstado });
      setCita({ ...cita, estado: nuevoEstado });
      setSuccessMessage(mensajeExito);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    } finally {
      setUpdating(false);
    }
  };

  const handleReagendar = async (data) => {
    console.log("🔄 handleReagendar RECIBIÓ datos:", data);
    try {
      await updateCita(cita._id, data);
      console.log("🔄 Cita actualizada en backend");
      const citaActualizada = await getCitaByIdRequest(id);
      setCita(citaActualizada.data);
      setSuccessMessage("Cita reagendada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
      setShowReagendarModal(false);
      console.log("🔄 Modal cerrado");
    } catch (error) {
      console.error("🔄 Error en reagendar:", error);
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  useEffect(() => {
    console.log("🚀 useEffect ejecutándose");
    const cargarDatos = async () => {
      console.log("🚀 Cargando datos de cita...");
      setLoading(true);
      try {
        const citaRes = await getCitaByIdRequest(id);
        console.log("🚀 Cita cargada:", citaRes.data);
        setCita(citaRes.data);
      } catch (error) {
        console.error("🚀 Error cargando cita:", error);
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    } else {
      console.log("🚀 No hay ID");
    }
  }, [id]);

  // Función para abrir modal
  const abrirModalReagendar = () => {
    console.log("🔴🔴🔴 BOTÓN CLICKEADO - abrirModalReagendar");
    console.log("🔴🔴🔴 cita actual:", cita);
    console.log("🔴🔴🔴 showReagendarModal antes:", showReagendarModal);
    setShowReagendarModal(true);
    console.log("🔴🔴🔴 setShowReagendarModal(true) ejecutado");
    // Verificar después de un pequeño delay
    setTimeout(() => {
      console.log("🔴🔴🔴 showReagendarModal después del set:", showReagendarModal);
    }, 100);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/citas')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver atrás
      </button>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Mensaje de errores */}
      {errors.length > 0 && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
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
              { label: "Fecha", value: cita.fecha ? new Date(cita.fecha).toLocaleDateString() : 'No especificada' },
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
                <button onClick={() => cambiarEstado('confirmada')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  ✅ Confirmar Cita
                </button>
                <button onClick={() => cambiarEstado('cancelada')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  ❌ Cancelar Cita
                </button>
                <button 
                  onClick={abrirModalReagendar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  id="btn-reagendar"
                >
                  📅 Reagendar Cita
                </button>
              </>
            )}
            
            {cita.estado === 'confirmada' && (
              <>
                <button onClick={() => cambiarEstado('completada')} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  ✅ Marcar como Completada
                </button>
                <button 
                  onClick={abrirModalReagendar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  id="btn-reagendar"
                >
                  📅 Reagendar Cita
                </button>
              </>
            )}
            
            {cita.estado === 'cancelada' && <p className="text-red-600 font-medium">❌ Esta cita ha sido cancelada</p>}
            {cita.estado === 'completada' && <p className="text-green-600 font-medium">✅ Esta cita ya fue completada</p>}
          </div>
        </>
      )}

      {/* MODAL SIMPLE CON LOGS */}
      {showReagendarModal && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => {
              console.log("🔴 Fondo clickeado - cerrando modal");
              setShowReagendarModal(false);
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  console.log("🔴 Botón cerrar clickeado");
                  setShowReagendarModal(false);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
              >
                ✕
              </button>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Reagendar Cita</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Cita actual: {new Date(cita.fecha).toLocaleDateString()} a las {cita.horaInicio}
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