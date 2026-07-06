// src/pages/Dashboard/DoctorDetallePage.jsx
import { useParams, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { 
    getDoctorByIdRequest, 
    bloquearDoctorRequest, 
    activarVacacionesRequest, 
    desactivarVacacionesRequest 
} from "/src/api/doctores";
import { getHorariosByDoctorRequest, updateHorarioRequest } from "/src/api/horarios";
import { DataTable } from "../../components/DataTable";
import { editConfig } from "../config/editConfig";
import { iniciarPausaRequest, terminarPausaRequest, getPausasActivasRequest, getPausasByDoctorRequest } from "/src/api/pausas";
import { toast } from 'sonner';

function DoctorDetallePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [horarioEditando, setHorarioEditando] = useState(null);
  const [pausaActiva, setPausaActiva] = useState(null);
  const [historialPausas, setHistorialPausas] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isRecepcion = user?.role === 'recepcion';
  const puedeVerHorarios = isAdmin || isRecepcion;

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      try {
        const doctorRes = await getDoctorByIdRequest(id);
        setDoctor(doctorRes.data);
        
        if (puedeVerHorarios) {
          const horariosRes = await getHorariosByDoctorRequest(id);
          setHorarios(horariosRes.data);
        }
        
        const pausasRes = await getPausasByDoctorRequest(id);
        setHistorialPausas(pausasRes.data || []);
        
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id, puedeVerHorarios]);

  // Cargar pausa activa
  useEffect(() => {
    let isMounted = true;
    
    const cargarPausaActiva = async () => {
      try {
        const res = await getPausasActivasRequest(id);
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setPausaActiva(res.data[0]);
          } else {
            setPausaActiva(null);
          }
        }
      } catch (error) {
        console.error("Error cargando pausa:", error);
      }
    };
    
    if (id) {
      cargarPausaActiva();
    }
    
    return () => {
      isMounted = false;
    };
  }, [id, location.key]);

  const getNombreDia = (dia) => {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dias[dia];
  };
  
  const horariosFormateados = horarios.map(horario => ({
    ...horario,
    diaNombre: getNombreDia(horario.dia),
    intervaloTexto: `${horario.intervalo} min`,
    estadoTexto: horario.activo ? 'Activo' : 'Inactivo',
    estadoColor: horario.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }));

  const handleEditHorario = (horario) => {
    setHorarioEditando(horario);
    setErrors([]);
    setModalAbierto(true);
  };
  
  const handleUpdateHorario = async (data) => {
    try {
      await updateHorarioRequest(horarioEditando._id, data);
      setModalAbierto(false);
      const horariosRes = await getHorariosByDoctorRequest(id);
      setHorarios(horariosRes.data);
      toast.success('Horario actualizado correctamente');
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const iniciarPausa = async () => {
    try {
      const res = await iniciarPausaRequest({ doctorId: id, motivo: "almuerzo" });
      setPausaActiva(res.data);
      toast.success('Almuerzo iniciado');
      const pausasRes = await getPausasByDoctorRequest(id);
      setHistorialPausas(pausasRes.data || []);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const terminarPausa = async () => {
    try {
      await terminarPausaRequest(pausaActiva._id);
      setPausaActiva(null);
      toast.success('Almuerzo terminado');
      const pausasRes = await getPausasByDoctorRequest(id);
      setHistorialPausas(pausasRes.data || []);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  // ============================================
  // FUNCIONES PARA BLOQUEAR DOCTOR
  // ============================================
  const handleBloquearDoctor = async () => {
    const confirmar = window.confirm(
      `⚠️ ¿Estás seguro de BLOQUEAR a ${doctor.username}?\n\n` +
      `Esta acción:\n` +
      `• Desactivará TODOS sus horarios\n` +
      `• Cambiará su correo a: ${doctor.username.toLowerCase()}retirado@gmail.com\n` +
      `• Cambiará su contraseña a: UsuarioRetiradoElExito\n` +
      `• El doctor no podrá iniciar sesión\n\n` +
      `¿Deseas continuar?`
    );
    
    if (!confirmar) return;
    
    try {
      const response = await bloquearDoctorRequest(id);
      toast.success(`Doctor bloqueado exitosamente. Nuevo correo: ${response.data.nuevoEmail}`);
      
      const doctorRes = await getDoctorByIdRequest(id);
      setDoctor(doctorRes.data);
      
      const horariosRes = await getHorariosByDoctorRequest(id);
      setHorarios(horariosRes.data);
      
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
      toast.error('Error al bloquear doctor');
    }
  };

  // ============================================
  // FUNCIONES PARA VACACIONES
  // ============================================
  const handleActivarVacaciones = async () => {
    const confirmar = window.confirm(
      `🌴 ¿Estás seguro de ACTIVAR VACACIONES para ${doctor.username}?\n\n` +
      `Esta acción desactivará TODOS sus horarios.\n\n` +
      `¿Deseas continuar?`
    );
    
    if (!confirmar) return;
    
    try {
      await activarVacacionesRequest(id);
      toast.success('Vacaciones activadas exitosamente');
      
      const doctorRes = await getDoctorByIdRequest(id);
      setDoctor(doctorRes.data);
      
      const horariosRes = await getHorariosByDoctorRequest(id);
      setHorarios(horariosRes.data);
      
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
      toast.error('Error al activar vacaciones');
    }
  };

  const handleDesactivarVacaciones = async () => {
    const confirmar = window.confirm(
      `✅ ¿Estás seguro de DESACTIVAR VACACIONES para ${doctor.username}?\n\n` +
      `Esta acción activará TODOS sus horarios.\n\n` +
      `¿Deseas continuar?`
    );
    
    if (!confirmar) return;
    
    try {
      await desactivarVacacionesRequest(id);
      toast.success('Vacaciones desactivadas exitosamente');
      
      const doctorRes = await getDoctorByIdRequest(id);
      setDoctor(doctorRes.data);
      
      const horariosRes = await getHorariosByDoctorRequest(id);
      setHorarios(horariosRes.data);
      
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
      toast.error('Error al desactivar vacaciones');
    }
  };

  // Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estaEnVacaciones = doctor?.vacacionesActivas === true;
  const estaBloqueado = doctor?.bloqueado === true;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/doctores')}
        className="mb-4 md:mb-6 flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Doctores
      </button>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !doctor && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-base md:text-lg">Doctor no encontrado</p>
          <button
            onClick={() => navigate('/doctores')}
            className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm md:text-base"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && doctor && (
        <>
          <InfoCard
            title="Información del Doctor"
            data={[
              { label: "Nombre completo", value: `${doctor.username} ${doctor.lastname}` },
              { label: "Email", value: doctor.email },
              { label: "Teléfono", value: doctor.phoneNumber },
              { label: "Especialidad", value: doctor.especialidad },
            ]}
          />

          {/* ========================================== */}
          {/* CARDS DE GESTIÓN (SOLO ADMIN) */}
          {/* ========================================== */}
          {isAdmin && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Estado del Doctor */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Estado del Doctor</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    estaBloqueado ? 'bg-red-100 text-red-700' :
                    estaEnVacaciones ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {estaBloqueado ? 'Bloqueado' :
                     estaEnVacaciones ? 'Vacaciones' :
                     'Activo'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Fecha de registro</span>
                    <span className="font-medium">{formatearFecha(doctor.createdAt)}</span>
                  </div>
                  
                  {doctor.fechaRetiro && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Fecha de retiro</span>
                      <span className="font-medium text-red-600">{formatearFecha(doctor.fechaRetiro)}</span>
                    </div>
                  )}
                  
                  {doctor.fechaInicioVacaciones && !doctor.fechaFinVacaciones && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Inicio de vacaciones</span>
                      <span className="font-medium text-yellow-600">{formatearFecha(doctor.fechaInicioVacaciones)}</span>
                    </div>
                  )}
                  
                  {doctor.fechaInicioVacaciones && doctor.fechaFinVacaciones && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Vacaciones</span>
                      <span className="font-medium text-green-600">
                        {formatearFecha(doctor.fechaInicioVacaciones)} - {formatearFecha(doctor.fechaFinVacaciones)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Última actualización</span>
                    <span className="font-medium">{formatearFecha(doctor.updatedAt)}</span>
                  </div>
                </div>

                {/* Información de bloqueo */}
                {estaBloqueado && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email original:</span>
                        <span className="font-medium text-gray-800">{doctor.emailOriginal || 'No registrado'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email actual:</span>
                        <span className="font-medium text-red-600 break-all">{doctor.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Contraseña:</span>
                        <span className="font-medium text-red-600 font-mono text-xs">UsuarioRetiradoElExito</span>
                      </div>
                      {doctor.motivoBloqueo && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Motivo:</span>
                          <span className="font-medium text-gray-800">{doctor.motivoBloqueo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 space-y-2">
                  {!estaBloqueado ? (
                    <>
                      <button
                        onClick={handleBloquearDoctor}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        🔒 Bloquear Doctor (Retiro)
                      </button>
                      
                      {!estaEnVacaciones ? (
                        <button
                          onClick={handleActivarVacaciones}
                          className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                        >
                          🌴 Activar Vacaciones
                        </button>
                      ) : (
                        <button
                          onClick={handleDesactivarVacaciones}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          ✅ Finalizar Vacaciones
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-red-600 font-medium">Doctor Bloqueado</p>
                      <p className="text-xs text-gray-500 mt-1">No puede iniciar sesión</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-400 text-center mt-2">
                    {estaBloqueado ? 'El doctor ha sido retirado y no puede iniciar sesión' :
                     estaEnVacaciones ? 'El doctor está en vacaciones, todos sus horarios están desactivados' :
                     'El doctor está activo y disponible para citas'}
                  </p>
                </div>
              </div>

              {/* Card 2: Control de Almuerzo */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Control de Almuerzo</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pausaActiva ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {pausaActiva ? 'En pausa' : 'Disponible'}
                  </span>
                </div>
                
                <div className="flex gap-3 mb-4">
                  {!pausaActiva ? (
                    <button
                      onClick={iniciarPausa}
                      disabled={estaBloqueado || estaEnVacaciones}
                      className={`flex-1 px-4 py-2 rounded-lg transition text-sm ${
                        estaBloqueado || estaEnVacaciones
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-yellow-600 text-white hover:bg-yellow-700'
                      }`}
                    >
                      Iniciar Almuerzo
                    </button>
                  ) : (
                    <button
                      onClick={terminarPausa}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                    >
                      Volver del Almuerzo
                    </button>
                  )}
                  <button
                    onClick={() => setMostrarHistorial(!mostrarHistorial)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    {mostrarHistorial ? 'Ocultar Historial' : 'Ver Historial'}
                  </button>
                </div>
                
                {pausaActiva && (
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-3">
                    <p className="text-xs text-yellow-800">
                      Inicio: {new Date(pausaActiva.inicio).toLocaleTimeString()}
                    </p>
                  </div>
                )}

                {mostrarHistorial && (
                  <div className="mt-4 border-t border-gray-200 pt-4 max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Historial de Almuerzos</h4>
                    {historialPausas.length === 0 ? (
                      <p className="text-sm text-gray-500">No hay registros de almuerzos</p>
                    ) : (
                      <div className="space-y-2">
                        {historialPausas.map((pausa, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <span>{new Date(pausa.inicio).toLocaleDateString('es-CR')}</span>
                            <span>
                              {new Date(pausa.inicio).toLocaleTimeString()} - 
                              {pausa.fin ? new Date(pausa.fin).toLocaleTimeString() : 'En curso'}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              pausa.activa ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {pausa.activa ? 'Activo' : 'Finalizado'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SECCIÓN HORARIOS - Admin y Recepción */}
          {/* ========================================== */}
          {puedeVerHorarios && (
            <>
              <div className="flex justify-between items-center mt-6 md:mt-8 mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-700">Horarios</h2>
                {estaBloqueado && (
                  <span className="text-sm text-red-600 font-medium">
                    ⚠️ Doctor bloqueado - Todos los horarios desactivados
                  </span>
                )}
                {estaEnVacaciones && (
                  <span className="text-sm text-yellow-600 font-medium">
                    🌴 En vacaciones - Todos los horarios desactivados
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <DataTable
                  columns={[
                    { header: "Día", accessor: "diaNombre" },
                    { header: "Hora Inicio", accessor: "horaInicio" },
                    { header: "Hora Fin", accessor: "horaFin" },
                    { header: "Intervalo", accessor: "intervaloTexto" },
                    { 
                      header: "Estado", 
                      accessor: "estadoTexto",
                      render: (horario) => (
                        <span className={`px-2 py-1 rounded-full text-xs ${horario.estadoColor}`}>
                          {horario.estadoTexto}
                        </span>
                      )
                    }
                  ]}
                  data={horariosFormateados}
                  onEdit={isAdmin ? handleEditHorario : undefined}  
                />
              </div>
            </>
          )}
        </>
      )}

      <Modal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Editar Horario"
        size="lg"
      >
        <DynamicForm
          {...editConfig.editHorario}
          defaultValues={horarioEditando}
          onSubmit={handleUpdateHorario}
          errors={errors}
          successMessage={successMessage}
        />
      </Modal>
    </div>
  );
}

export default DoctorDetallePage;