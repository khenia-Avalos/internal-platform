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
  const [historial, setHistorial] = useState(null);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [showHistorialForm, setShowHistorialForm] = useState(false);
  const [historialFormData, setHistorialFormData] = useState({});
  const [isEditingHistorial, setIsEditingHistorial] = useState(false);
  const [editErrors, setEditErrors] = useState([]);
  const [editSuccessMessage, setEditSuccessMessage] = useState("");

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isClient = user?.role === 'client';
  const canEditHistorial = isAdmin || isDoctor;

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

  const obtenerNombreDueño = () => {
    if (cita?.clienteTemporalId?.username) {
      return cita.clienteTemporalId.username;
    }
    if (cita?.pacienteId?.ownerId?.username) {
      return cita.pacienteId.ownerId.username;
    }
    return 'No especificado';
  };

  const obtenerEmailDueño = () => {
    if (cita?.clienteTemporalId?.email) {
      return cita.clienteTemporalId.email;
    }
    if (cita?.pacienteId?.ownerId?.email) {
      return cita.pacienteId.ownerId.email;
    }
    return 'No especificado';
  };

  const obtenerTelefonoDueño = () => {
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
  // FUNCIONES DE HISTORIAL CLÍNICO (UNIFICADAS)
  // ============================================

  const cargarHistorial = async () => {
    if (!id) return;
    
    setHistorialLoading(true);
    try {
      console.log('Buscando historial para cita:', id);
      const res = await getHistorialByCitaRequest(id);
      console.log('Historial encontrado:', res.data);
      setHistorial(res.data);
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

  // Función para abrir el formulario (crear o editar)
  const openHistorialForm = () => {
    if (historial) {
      // Si ya existe historial, preparar datos para editar
      const medicamentosText = Array.isArray(historial.medicamentos) 
        ? historial.medicamentos.map(m => {
            let text = m.nombre || '';
            if (m.dosis) text += `: ${m.dosis}`;
            if (m.frecuencia) text += ` cada ${m.frecuencia}`;
            if (m.duracion) text += ` por ${m.duracion}`;
            return text;
          }).join('\n')
        : '';
      
      const examenesText = Array.isArray(historial.examenes)
        ? historial.examenes.map(e => {
            let text = e.nombre || '';
            if (e.resultado) text += `: ${e.resultado}`;
            return text;
          }).join('\n')
        : '';
      
      setHistorialFormData({
        motivoConsulta: historial.motivoConsulta || '',
        sintomas: historial.sintomas || '',
        diagnostico: historial.diagnostico || '',
        tratamiento: historial.tratamiento || '',
        medicamentos: medicamentosText,
        examenes: examenesText,
        pesoRegistrado: historial.pesoRegistrado?.valor || '',
        temperaturaRegistrada: historial.temperaturaRegistrada || '',
        observaciones: historial.observaciones || '',
        proximaCitaSugerida: historial.proximaCitaSugerida ? 
          new Date(historial.proximaCitaSugerida).toISOString().split('T')[0] : ''
      });
      setIsEditingHistorial(true);
    } else {
      // Nuevo registro
      setHistorialFormData({
        motivoConsulta: '',
        sintomas: '',
        diagnostico: '',
        tratamiento: '',
        medicamentos: '',
        examenes: '',
        pesoRegistrado: '',
        temperaturaRegistrada: '',
        observaciones: '',
        proximaCitaSugerida: ''
      });
      setIsEditingHistorial(false);
    }
    setShowHistorialForm(true);
  };

  // Función para guardar historial (crear o actualizar)
  const handleSaveHistorial = async (data) => {
    try {
      if (!cita?.pacienteId?._id) {
        toast.error('No se puede crear el registro: falta la mascota asociada a la cita');
        return;
      }
      
      // Convertir medicamentos de texto a array de objetos
      const medicamentosArray = data.medicamentos ? 
        data.medicamentos.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              const nombre = parts[0].trim();
              const resto = parts.slice(1).join(':').trim();
              const dosisMatch = resto.match(/(\d+\s*(mg|g|ml|tableta|comprimido|gotas))/i);
              return {
                nombre: nombre,
                dosis: dosisMatch ? dosisMatch[0] : resto,
                frecuencia: '',
                duracion: ''
              };
            }
            return {
              nombre: line.trim(),
              dosis: '',
              frecuencia: '',
              duracion: ''
            };
          }) : [];
      
      // Convertir examenes de texto a array de objetos
      const examenesArray = data.examenes ?
        data.examenes.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const parts = line.split(':');
            if (parts.length >= 2) {
              return {
                nombre: parts[0].trim(),
                resultado: parts.slice(1).join(':').trim(),
                fecha: null
              };
            }
            return {
              nombre: line.trim(),
              resultado: '',
              fecha: null
            };
          }) : [];
      
      const datosEnvio = {
        pacienteId: cita.pacienteId._id,
        citaId: id,
        motivoConsulta: data.motivoConsulta || '',
        sintomas: data.sintomas || '',
        diagnostico: data.diagnostico || '',
        tratamiento: data.tratamiento || '',
        medicamentos: medicamentosArray,
        examenes: examenesArray,
        pesoRegistrado: data.pesoRegistrado ? {
          valor: parseFloat(data.pesoRegistrado) || 0,
          unidad: 'kg'
        } : null,
        temperaturaRegistrada: data.temperaturaRegistrada ? 
          parseFloat(data.temperaturaRegistrada) : null,
        observaciones: data.observaciones || '',
        proximaCitaSugerida: data.proximaCitaSugerida || null,
        estadoConsulta: 'completada'
      };
      
      if (isEditingHistorial && historial?._id) {
        // Actualizar
        await updateHistorialRequest(historial._id, datosEnvio);
        toast.success('Registro clínico actualizado exitosamente');
      } else {
        // Crear
        await createHistorialRequest(datosEnvio);
        toast.success('Registro clínico creado exitosamente');
      }
      
      await cargarHistorial();
      setShowHistorialForm(false);
    } catch (error) {
      console.error('Error al guardar historial:', error);
      manejarErrorResponse(error, setErrors);
      toast.error('Error al guardar el registro clínico');
    }
  };

  // ============================================
  // FUNCIONES DE ESTADO DE CITA
  // ============================================

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

  const informacionCita = [
    { label: "Doctor", value: cita?.doctorId ? `${cita.doctorId.username} ${cita.doctorId.lastname}` : 'No asignado' },
    { label: "Especialidad del Doctor", value: cita?.doctorId?.especialidad || 'No especificada' },
    { label: "Título de la cita", value: cita?.titulo || 'Sin título' },
    { label: "Descripción", value: cita?.descripcion || 'No especificada' },
    { label: "Notas Adicionales", value: cita?.notas || 'No especificadas' },
    { label: "Fecha", value: mostrarFechaLocal(cita?.fecha) },
    { label: "Hora", value: cita?.horaInicio ? `${cita.horaInicio} - ${cita.horaFin}` : 'No especificada' },
    { label: "Tipo de cita", value: cita?.tipoCita || 'No especificado' },
    { 
      label: "Origen de la cita", 
      value: esCitaTemporal() 
        ? 'Cliente Temporal (pendiente de completar registro)' 
        : 'Cliente Registrado'
    },
    { label: "Dueño", value: obtenerNombreDueño() },
    { label: "Correo del dueño", value: obtenerEmailDueño() },
    { label: "Teléfono del dueño", value: obtenerTelefonoDueño() },
    { label: "Mascota", value: cita?.pacienteId?.nombre || 'No especificada (pendiente de registro)' },
    { label: "Especie de la mascota", value: cita?.pacienteId?.especie || 'No especificada' },
    { label: "Estado de la cita", value: obtenerEstadoTexto() }
  ];

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
          <InfoCard title="Información de la cita" data={informacionCita} />

          {/* ========================================== */}
          {/* SECCIÓN DE HISTORIAL CLÍNICO */}
          {/* ========================================== */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Registro Clínico</h3>
              {canEditHistorial && !showHistorialForm && (
                <button
                  onClick={openHistorialForm}
                  className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition"
                >
                  {historial ? 'Actualizar Registro Clínico' : 'Crear Registro Clínico'}
                </button>
              )}
            </div>

            {historialLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : showHistorialForm ? (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-700">
                    {isEditingHistorial ? 'Editar Registro Clínico' : 'Nuevo Registro Clínico'}
                  </h2>
                  <button
                    onClick={() => setShowHistorialForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition text-xl"
                  >
                    ✕
                  </button>
                </div>
                <DynamicForm
                  {...(isEditingHistorial ? editConfig.editHistorialClinico : createConfig.historialClinico)}
                  layout="grid"
                  defaultValues={historialFormData}
                  onSubmit={handleSaveHistorial}
                  errors={isEditingHistorial ? editErrors : errors}
                  successMessage={isEditingHistorial ? editSuccessMessage : ''}
                />
              </div>
            ) : historial ? (
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Motivo de la consulta</p>
                      <p className="text-gray-800 font-medium">{historial.motivoConsulta || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Síntomas reportados</p>
                      <p className="text-gray-800 font-medium">{historial.sintomas || 'No especificados'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Diagnóstico</p>
                      <p className="text-gray-800 font-medium">{historial.diagnostico || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tratamiento indicado</p>
                      <p className="text-gray-800 font-medium">{historial.tratamiento || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Medicamentos recetados</p>
                      <p className="text-gray-800 font-medium">
                        {Array.isArray(historial.medicamentos) && historial.medicamentos.length > 0 
                          ? historial.medicamentos.map(m => `${m.nombre} (${m.dosis})`).join(', ')
                          : 'No especificados'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Exámenes realizados</p>
                      <p className="text-gray-800 font-medium">
                        {Array.isArray(historial.examenes) && historial.examenes.length > 0
                          ? historial.examenes.map(e => `${e.nombre}: ${e.resultado}`).join(', ')
                          : 'No especificados'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peso registrado</p>
                      <p className="text-gray-800 font-medium">
                        {historial.pesoRegistrado?.valor 
                          ? `${historial.pesoRegistrado.valor} ${historial.pesoRegistrado.unidad || 'kg'}`
                          : 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temperatura registrada</p>
                      <p className="text-gray-800 font-medium">
                        {historial.temperaturaRegistrada 
                          ? `${historial.temperaturaRegistrada} °C`
                          : 'No registrada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Próxima cita sugerida</p>
                      <p className="text-gray-800 font-medium">
                        {historial.proximaCitaSugerida 
                          ? mostrarFechaHora(historial.proximaCitaSugerida)
                          : 'No sugerida'}
                      </p>
                    </div>
                    <div className="md:col-span-2 lg:col-span-3">
                      <p className="text-sm text-gray-500">Observaciones adicionales</p>
                      <p className="text-gray-800 font-medium">{historial.observaciones || 'No especificadas'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay registro clínico para esta cita</p>
                {canEditHistorial && (
                  <button
                    onClick={openHistorialForm}
                    className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Crear Registro Clínico
                  </button>
                )}
              </div>
            )}
          </div>

          {esCitaTemporal() && !cita.pacienteId && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-300 rounded-lg">
              <p className="text-orange-800 text-sm font-medium">Esta es una cita de <strong>Cliente Temporal</strong></p>
              <p className="text-orange-700 text-sm mt-1">El cliente aún no ha completado su registro. Cuando lo haga, la mascota y los datos completos se asignarán automáticamente a esta cita.</p>
            </div>
          )}

          {cita.clienteTemporalId && !cita.pacienteId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm font-medium">Información del Cliente Temporal</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p className="text-blue-700"><strong>Nombre:</strong> {cita.clienteTemporalId.username}</p>
                <p className="text-blue-700"><strong>Email:</strong> {cita.clienteTemporalId.email}</p>
                <p className="text-blue-700"><strong>Teléfono:</strong> {cita.clienteTemporalId.phoneNumber || 'No registrado'}</p>
                <p className="text-blue-700"><strong>Estado:</strong> {cita.clienteTemporalId.estado === 'temporal' ? 'Pendiente de registro' : 'Registrado'}</p>
              </div>
            </div>
          )}

          {cita.pacienteId && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">Información de la Mascota</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <p className="text-green-700"><strong>Nombre:</strong> {cita.pacienteId.nombre}</p>
                <p className="text-green-700"><strong>Especie:</strong> {cita.pacienteId.especie}</p>
                <p className="text-green-700"><strong>Raza:</strong> {cita.pacienteId.raza || 'No especificada'}</p>
                <p className="text-green-700"><strong>Edad:</strong> {cita.pacienteId.edad || 'No especificada'} años</p>
              </div>
            </div>
          )}
          
          {/* BOTONES DE ACCIÓN SEGÚN ROL */}
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
                {isClient ? (
                  <a
                    href={`https://wa.me/50670932898?text=${encodeURIComponent(obtenerMensajeWhatsApp())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block text-center"
                  >
                    Reagendar por WhatsApp
                  </a>
                ) : (
                  <button 
                    onClick={abrirModalReagendar}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                    disabled={updating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Marcar como Completada
                  </button>
                )}
                <button 
                  onClick={() => cambiarEstado('cancelada')} 
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  Cancelar Cita
                </button>
                {isClient ? (
                  <a
                    href={`https://wa.me/50670932898?text=${encodeURIComponent(obtenerMensajeWhatsApp())}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition inline-block text-center"
                  >
                    Reagendar por WhatsApp
                  </a>
                ) : (
                  <button 
                    onClick={abrirModalReagendar}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
        </>
      )}

      {showReagendarModal && (
        <>
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowReagendarModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowReagendarModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10">✕</button>
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