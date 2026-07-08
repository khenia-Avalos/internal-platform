// src/pages/Citas/CitaDetallePage.jsx
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getCitaByIdRequest, updateCita } from "/src/api/cita";
import { FormularioCita } from "../../components/forms/FormularioCita";
import { useAuth } from "../../hooks/useAuth";
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { editConfig } from "../config/editConfig";
import { 
  getHistorialByCitaRequest,
  createHistorialRequest,
  updateHistorialRequest
} from "/src/api/historialClinico";

function CitaDetallePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [showReagendarModal, setShowReagendarModal] = useState(false);
  
  // estados para historial clinico
  const [historial, setHistorial] = useState(null);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [showHistorialForm, setShowHistorialForm] = useState(false);
  const [isEditingHistorial, setIsEditingHistorial] = useState(false);
  const [historialFormData, setHistorialFormData] = useState({});

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isClient = user?.role === 'client';
  const canEditHistorial = isAdmin || isDoctor;

  // verificar si la mascota esta fallecida
  const pacienteFallecido = cita?.pacienteId?.fallecido === true;

  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const mostrarFechaHora = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const date = new Date(fechaISO);
    return date.toLocaleDateString('es-CR', {
      timeZone: 'America/Costa_Rica',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const obtenerNombreDueno = () => {
    if (cita?.clienteTemporalId?.username) {
      return cita.clienteTemporalId.username;
    }
    if (cita?.pacienteId?.ownerId?.username) {
      return cita.pacienteId.ownerId.username;
    }
    return 'No especificado';
  };

  const obtenerEmailDueno = () => {
    if (cita?.clienteTemporalId?.email) {
      return cita.clienteTemporalId.email;
    }
    if (cita?.pacienteId?.ownerId?.email) {
      return cita.pacienteId.ownerId.email;
    }
    return 'No especificado';
  };

  const obtenerTelefonoDueno = () => {
    if (cita?.clienteTemporalId?.phoneNumber) {
      return cita.clienteTemporalId.phoneNumber;
    }
    if (cita?.pacienteId?.ownerId?.phoneNumber) {
      return cita.pacienteId.ownerId.phoneNumber;
    }
    return 'No especificado';
  };

  const esCitaTemporal = () => {
    return cita?.esCitaTemporal === true || (cita?.clienteTemporalId && !cita?.pacienteId);
  };

  const obtenerEstadoTexto = () => {
    switch (cita?.estado) {
      case 'pendiente': return 'Pendiente de confirmación';
      case 'confirmada': return 'Confirmada';
      case 'cancelada': return 'Cancelada';
      case 'completada': return 'Completada';
      default: return cita?.estado || 'No especificado';
    }
  };

  const obtenerMensajeWhatsApp = () => {
    const fecha = mostrarFechaLocal(cita?.fecha);
    const hora = cita?.horaInicio;
    const doctor = cita?.doctorId?.username || "nuestro veterinario";
    const mascota = cita?.pacienteId?.nombre || "mi mascota";
    
    return `Hola, quisiera reagendar mi cita del ${fecha} a las ${hora} con ${doctor} para ${mascota}. ¿Podrían ayudarme?`;
  };

  // ============================================
  // FUNCIONES DE HISTORIAL CLINICO - ACTUALIZADAS
  // ============================================

  const cargarHistorial = async () => {
    if (!id) return;
    
    setHistorialLoading(true);
    try {
      console.log('Buscando historial para cita:', id);
      const res = await getHistorialByCitaRequest(id);
      console.log('Historial encontrado:', res.data);
      setHistorial(res.data.data);
      
      if (res.data.data) {
        const h = res.data.data;
        // ========== AHORA ES TEXTO LIBRE ==========
        setHistorialFormData({
          motivoConsulta: h.motivoConsulta || '',
          sintomas: h.sintomas || '',
          diagnostico: h.diagnostico || '',
          tratamiento: h.tratamiento || '',
          medicamentos: h.medicamentos || '', // String
          examenes: h.examenes || '',         // String
          observaciones: h.observaciones || '',
          proximaCitaSugerida: h.proximaCitaSugerida ? 
            new Date(h.proximaCitaSugerida).toISOString().split('T')[0] : ''
        });
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      if (error.response?.status !== 404) {
        manejarErrorResponse(error, setErrors);
      }
      setHistorial(null);
    } finally {
      setHistorialLoading(false);
    }
  };

  // ========== HANDLE CREATE - ACTUALIZADO ==========
  const handleCreateHistorial = async (data) => {
    console.log('handleCreateHistorial ejecutándose');
    console.log('Datos del formulario:', data);
    
    try {
      if (!cita?.pacienteId?._id) {
        toast.error('No se puede crear el registro: falta la mascota asociada a la cita');
        return;
      }
      
      if (pacienteFallecido) {
        toast.error('No se puede crear un registro clínico porque la mascota está marcada como fallecida');
        return;
      }
      
      // ========== ENVÍO SIMPLE - TEXTO LIBRE ==========
      const datosEnvio = {
        pacienteId: cita.pacienteId._id,
        citaId: id,
        motivoConsulta: data.motivoConsulta || '',
        sintomas: data.sintomas || '',
        diagnostico: data.diagnostico || '',
        tratamiento: data.tratamiento || '',
        medicamentos: data.medicamentos || '', // Texto libre
        examenes: data.examenes || '',         // Texto libre
        observaciones: data.observaciones || '',
        proximaCitaSugerida: data.proximaCitaSugerida || null
      };
      
      console.log('Datos a enviar:', JSON.stringify(datosEnvio, null, 2));
      
      const response = await createHistorialRequest(datosEnvio);
      console.log('Respuesta del backend:', response.data);
      
      await cargarHistorial();
      setShowHistorialForm(false);
      toast.success('Registro clínico creado exitosamente');
    } catch (error) {
      console.error('Error al crear historial:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al crear el registro clínico');
      }
      manejarErrorResponse(error, setErrors);
    }
  };

  // ========== HANDLE UPDATE - ACTUALIZADO ==========
  const handleUpdateHistorial = async (data) => {
    console.log('handleUpdateHistorial ejecutándose');
    console.log('Datos a actualizar:', data);
    
    try {
      if (!historial?._id) {
        toast.error('No hay registro clínico para actualizar');
        return;
      }
      
      if (pacienteFallecido) {
        toast.error('No se puede actualizar el registro clínico porque la mascota está marcada como fallecida');
        return;
      }
      
      // ========== ENVÍO SIMPLE - TEXTO LIBRE ==========
      const datosEnvio = {
        motivoConsulta: data.motivoConsulta || '',
        sintomas: data.sintomas || '',
        diagnostico: data.diagnostico || '',
        tratamiento: data.tratamiento || '',
        medicamentos: data.medicamentos || '', // Texto libre
        examenes: data.examenes || '',         // Texto libre
        observaciones: data.observaciones || '',
        proximaCitaSugerida: data.proximaCitaSugerida || null
      };
      
      console.log('Datos a enviar:', JSON.stringify(datosEnvio, null, 2));
      
      const response = await updateHistorialRequest(historial._id, datosEnvio);
      console.log('Respuesta del backend:', response.data);
      
      await cargarHistorial();
      setShowHistorialForm(false);
      toast.success('Registro clínico actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar historial:', error);
      console.error('Respuesta del error:', error.response?.data);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Error al actualizar el registro clínico');
      }
      manejarErrorResponse(error, setErrors);
    }
  };

  const abrirFormularioCrear = () => {
    setHistorialFormData({
      motivoConsulta: '',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      medicamentos: '',
      examenes: '',
      observaciones: '',
      proximaCitaSugerida: ''
    });
    setIsEditingHistorial(false);
    setShowHistorialForm(true);
  };

  const abrirFormularioEditar = () => {
    if (!historial) return;
    setIsEditingHistorial(true);
    setShowHistorialForm(true);
  };

  // funciones de estado de cita
  const cambiarEstado = async (nuevoEstado) => {
    let mensajeConfirmacion = '';
    let mensajeExito = '';
    
    if (nuevoEstado === 'confirmada') {
      mensajeConfirmacion = '¿Estás seguro de confirmar esta cita?';
      mensajeExito = 'Cita confirmada exitosamente';
    } else if (nuevoEstado === 'cancelada') {
      mensajeConfirmacion = '¿Estás seguro de cancelar esta cita?';
      mensajeExito = 'Cita cancelada';
    } else if (nuevoEstado === 'completada') {
      mensajeConfirmacion = '¿Estás seguro de marcar esta cita como completada?';
      mensajeExito = 'Cita marcada como completada';
    }
    
    if (!window.confirm(mensajeConfirmacion)) return;
    
    setUpdating(true);
    try {
      await updateCita(cita._id, { estado: nuevoEstado });
      setCita({ ...cita, estado: nuevoEstado });
      toast.success(mensajeExito, { duration: 3000 });
    } catch (error) {
      manejarErrorResponse(error, setErrors);
    } finally {
      setUpdating(false);
    }
  };

  const handleReagendar = async (data) => {
    console.log("Reagendando cita:", data);
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
      console.error("Error en reagendar:", error);
      toast.error('Error al reagendar la cita');
      manejarErrorResponse(error, setErrors);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const citaRes = await getCitaByIdRequest(id);
        setCita(citaRes.data);
        await cargarHistorial();
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

  // informacion de la mascota para mostrar arriba
  const informacionMascota = cita?.pacienteId ? [
    { label: "Nombre de la mascota", value: cita.pacienteId.nombre },
    { label: "Especie", value: cita.pacienteId.especie },
    { label: "Raza", value: cita.pacienteId.raza || 'No especificada' },
    { label: "Edad", value: cita.pacienteId.edad ? `${cita.pacienteId.edad} años` : 'No especificada' },
  ] : [
    { label: "Mascota", value: 'No especificada (pendiente de registro)' }
  ];

  // informacion de la cita - NUEVO ORDEN
  const informacionCita = [
    // Fila 1: Doctor y Especialidad
    { label: "Doctor", value: cita?.doctorId ? `${cita.doctorId.username} ${cita.doctorId.lastname}` : 'No asignado' },
    { label: "Especialidad del Doctor", value: cita?.doctorId?.especialidad || 'No especificada' },
    // Fila 2: Título, Descripción, Tipo, Origen, Fecha, Hora, Notas, Estado
    { label: "Título de la cita", value: cita?.titulo || 'Sin título' },
    { label: "Descripción", value: cita?.descripcion || 'No especificada' },
    { label: "Tipo de cita", value: cita?.tipoCita || 'No especificado' },
    { label: "Origen de la cita", value: esCitaTemporal() ? 'Cliente Temporal (pendiente de completar registro)' : 'Cliente Registrado' },
    { label: "Fecha", value: mostrarFechaLocal(cita?.fecha) },
    { label: "Hora", value: cita?.horaInicio ? `${cita.horaInicio} - ${cita.horaFin}` : 'No especificada' },
    { label: "Notas Adicionales", value: cita?.notas || 'No especificadas' },
    { label: "Estado de la cita", value: obtenerEstadoTexto() },
    // Fila 3: Correo y Teléfono del dueño
    { label: "Correo del dueño", value: obtenerEmailDueno() },
    { label: "Teléfono del dueño", value: obtenerTelefonoDueno() },
    ...(pacienteFallecido ? [
      { label: "Estado de la mascota", value: "FALLECIDA - No se pueden crear nuevos registros" }
    ] : [])
  ];

  // informacion del cliente temporal
  const informacionClienteTemporal = cita?.clienteTemporalId && !cita?.pacienteId ? [
    { label: "Nombre", value: cita.clienteTemporalId.username },
    { label: "Email", value: cita.clienteTemporalId.email || 'No registrado' },
    { label: "Teléfono", value: cita.clienteTemporalId.phoneNumber || 'No registrado' },
    { label: "Estado", value: cita.clienteTemporalId.estado === 'temporal' ? 'Pendiente de registro' : 'Registrado' },
  ] : [];

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 max-w-full">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      <button
        onClick={() => navigate('/citas')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition text-sm md:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Citas
      </button>

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
            className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm md:text-base"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cita && (
        <>
          {/* card 1: informacion de la mascota usando InfoCard */}
          <InfoCard
            title="Información de la Mascota"
            data={informacionMascota}
          />

          {/* card 2: informacion de la cita con botones dentro */}
          <div className="mt-6">
            <InfoCard
              title="Información de la Cita"
              data={informacionCita}
            >
              {/* separador */}
              <div className="border-t border-gray-200 my-6"></div>
              
              {/* botones de accion dentro de la card */}
              <div className="flex flex-wrap gap-3">
                {cita.estado === 'pendiente' && (
                  <>
                    <button 
                      onClick={() => cambiarEstado('confirmada')} 
                      disabled={updating || pacienteFallecido}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
                    >
                      Confirmar Cita
                    </button>
                    <button 
                      onClick={() => cambiarEstado('cancelada')} 
                      disabled={updating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
                    >
                      Cancelar Cita
                    </button>
                    {isClient ? (
                      <a
                        href={`https://wa.me/50670932898?text=${encodeURIComponent(obtenerMensajeWhatsApp())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block text-center text-sm font-medium"
                      >
                        Reagendar por WhatsApp
                      </a>
                    ) : (
                      <button 
                        onClick={abrirModalReagendar}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Reagendar Cita
                      </button>
                    )}
                  </>
                )}
                
                {cita.estado === 'confirmada' && (
                  <>
                    {(isAdmin || isDoctor) && (
                      <button 
                        onClick={() => cambiarEstado('completada')} 
                        disabled={updating || pacienteFallecido}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium"
                      >
                        Marcar como Completada
                      </button>
                    )}
                    <button 
                      onClick={() => cambiarEstado('cancelada')} 
                      disabled={updating}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm font-medium"
                    >
                      Cancelar Cita
                    </button>
                    {isClient ? (
                      <a
                        href={`https://wa.me/50670932898?text=${encodeURIComponent(obtenerMensajeWhatsApp())}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block text-center text-sm font-medium"
                      >
                        Reagendar por WhatsApp
                      </a>
                    ) : (
                      <button 
                        onClick={abrirModalReagendar}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                      >
                        Reagendar Cita
                      </button>
                    )}
                  </>
                )}
                
                {cita.estado === 'cancelada' && (
                  <p className="text-red-600 font-medium">Esta cita ha sido cancelada</p>
                )}
                {cita.estado === 'completada' && (
                  <p className="text-green-600 font-medium">Esta cita ya fue completada</p>
                )}
              </div>
            </InfoCard>
          </div>

          {/* card 3: cliente temporal si existe */}
          {informacionClienteTemporal.length > 0 && (
            <div className="mt-6">
              <InfoCard
                title="Información del Cliente Temporal"
                data={informacionClienteTemporal}
              />
            </div>
          )}

          {/* mensaje de alerta si la mascota esta fallecida */}
          {pacienteFallecido && (
            <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-lg">
              <p className="text-gray-800 font-medium">
                Esta cita corresponde a una mascota fallecida
              </p>
              <p className="text-gray-700 text-sm mt-1">
                No se pueden crear ni actualizar registros clínicos para esta mascota.
              </p>
            </div>
          )}

          {/* card 4: registro clinico */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Registro Clínico</h3>
              {canEditHistorial && !showHistorialForm && !pacienteFallecido && (
                <button
                  onClick={historial ? abrirFormularioEditar : abrirFormularioCrear}
                  className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
                >
                  {historial ? 'Actualizar Registro Clínico' : 'Crear Registro Clínico'}
                </button>
              )}
              {pacienteFallecido && (
                <span className="text-gray-500 text-sm">Registro bloqueado - Mascota fallecida</span>
              )}
            </div>

            {historialLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : showHistorialForm ? (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                    {isEditingHistorial ? 'Editar Registro Clínico' : 'Nuevo Registro Clínico'}
                  </h2>
                  <button
                    onClick={() => setShowHistorialForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition text-xl"
                  >
                    ×
                  </button>
                </div>
                <DynamicForm
                  {...(isEditingHistorial ? editConfig.editHistorialClinico : createConfig.historialClinico)}
                  layout="grid"
                  defaultValues={historialFormData}
                  onSubmit={isEditingHistorial ? handleUpdateHistorial : handleCreateHistorial}
                  errors={errors}
                />
              </div>
            ) : historial ? (
              <InfoCard
                title=""
                data={[
                  { label: "Motivo de la consulta", value: historial.motivoConsulta || 'No especificado' },
                  { label: "Síntomas reportados", value: historial.sintomas || 'No especificados' },
                  { label: "Diagnóstico", value: historial.diagnostico || 'No especificado' },
                  { label: "Tratamiento indicado", value: historial.tratamiento || 'No especificado' },
                  // ========== MEDICAMENTOS Y EXAMENES COMO TEXTO LIBRE ==========
                  { label: "Pronóstico", value: historial.medicamentos || 'No especificados' },
                  { label: "Exámenes realizados", value: historial.examenes || 'No especificados' },
                  { label: "Observaciones adicionales", value: historial.observaciones || 'No especificadas' },
                  { 
                    label: "Próxima cita sugerida", 
                    value: historial.proximaCitaSugerida 
                      ? mostrarFechaHora(historial.proximaCitaSugerida)
                      : 'No sugerida'
                  },
                ]}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No hay registro clínico para esta cita</p>
                {canEditHistorial && !pacienteFallecido && (
                  <button
                    onClick={abrirFormularioCrear}
                    className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Crear Registro Clínico
                  </button>
                )}
                {pacienteFallecido && (
                  <p className="text-gray-400 text-sm mt-2">No se pueden crear registros para mascotas fallecidas</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {showReagendarModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowReagendarModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowReagendarModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10">×</button>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Reagendar Cita</h2>
                <p className="text-sm text-gray-500 mb-4">Cita actual: {mostrarFechaLocal(cita.fecha)} a las {cita.horaInicio}</p>
                <FormularioCita onSubmit={handleReagendar} cita={cita} isEdit={false} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default CitaDetallePage;