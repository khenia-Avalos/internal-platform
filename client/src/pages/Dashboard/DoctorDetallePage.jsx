import { useParams, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getDoctorByIdRequest, updateDoctorRequest } from "/src/api/doctores";
import { getHorariosByDoctorRequest } from "/src/api/horarios";
import { DataTable } from "../../components/DataTable";
import { editConfig } from "../config/editConfig";
import { updateHorarioRequest } from "/src/api/horarios";  
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

  const isDoctor = user?.role === 'doctor';
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
        
        // Cargar historial de pausas
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
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
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
      // Recargar historial
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
      // Recargar historial
      const pausasRes = await getPausasByDoctorRequest(id);
      setHistorialPausas(pausasRes.data || []);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  // Activar/Desactivar doctor completo (vacaciones)
  const toggleDoctorActivo = async () => {
    const nuevoEstado = !doctor.activo;
    const mensaje = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!window.confirm(`¿Estas seguro de ${mensaje} a ${doctor.username}?`)) return;
    
    try {
      await updateDoctorRequest(id, { activo: nuevoEstado });
      setDoctor({ ...doctor, activo: nuevoEstado });
      toast.success(`Doctor ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  // Formatear fecha para mostrar
  const formatearFecha = (fecha) => {
    if (!fecha) return 'No registrada';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearFechaHora = (fecha) => {
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

  // Agrupar pausas por día
  const pausasPorDia = historialPausas.reduce((acc, pausa) => {
    const fecha = new Date(pausa.inicio).toLocaleDateString('es-CR');
    if (!acc[fecha]) {
      acc[fecha] = [];
    }
    acc[fecha].push(pausa);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Boton volver */}
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
          {/* CARD 1: INFORMACION DEL DOCTOR */}
          <InfoCard
            title="Informacion del Doctor"
            data={[
              { label: "Nombre completo", value: `${doctor.username} ${doctor.lastname}` },
              { label: "Email", value: doctor.email },
              { label: "Telefono", value: doctor.phoneNumber },
              { label: "Especialidad", value: doctor.especialidad },
            ]}
          />

          {/* ========================================== */}
          {/* CARD 2: ESTADO DEL DOCTOR (SOLO ADMIN) */}
          {/* ========================================== */}
          {isAdmin && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Estado del Doctor */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Estado del Doctor</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    doctor.activo !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {doctor.activo !== false ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Fecha de registro</span>
                    <span className="font-medium">{formatearFecha(doctor.createdAt)}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Ultima actualizacion</span>
                    <span className="font-medium">{formatearFecha(doctor.updatedAt)}</span>
                  </div>
                  {doctor.fechaDesactivacion && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Fecha de desactivacion</span>
                      <span className="font-medium text-red-600">{formatearFecha(doctor.fechaDesactivacion)}</span>
                    </div>
                  )}
                  {doctor.motivoDesactivacion && (
                    <div className="flex justify-between border-b border-gray-100 pb-2">
                      <span className="text-gray-500">Motivo</span>
                      <span className="font-medium">{doctor.motivoDesactivacion}</span>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={toggleDoctorActivo}
                  className={`w-full mt-4 px-4 py-2 rounded-lg text-white font-medium transition ${
                    doctor.activo !== false 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {doctor.activo !== false ? 'Desactivar Doctor (Vacaciones)' : 'Activar Doctor'}
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {doctor.activo !== false 
                    ? 'Al desactivar, el doctor no aparecera en las citas' 
                    : 'Al activar, el doctor volvera a estar disponible'}
                </p>
              </div>

              {/* ========================================== */}
              {/* CARD 3: CONTROL DE ALMUERZO Y HISTORIAL */}
              {/* ========================================== */}
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
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition text-sm"
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

                {/* Historial de pausas - acordeon por día */}
                {mostrarHistorial && (
                  <div className="mt-4 border-t border-gray-200 pt-4 max-h-64 overflow-y-auto">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Historial de Almuerzos</h4>
                    
                    {Object.keys(pausasPorDia).length === 0 ? (
                      <p className="text-sm text-gray-500">No hay registros de almuerzos</p>
                    ) : (
                      Object.entries(pausasPorDia)
                        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                        .map(([fecha, pausas]) => (
                          <div key={fecha} className="mb-3 border border-gray-100 rounded-lg overflow-hidden">
                            <div className="bg-gray-50 px-3 py-2 font-medium text-sm text-gray-700">
                              {fecha}
                              <span className="ml-2 text-xs text-gray-400 font-normal">
                                ({pausas.length} registro{pausas.length > 1 ? 's' : ''})
                              </span>
                            </div>
                            <div className="p-2 space-y-1">
                              {pausas.map((pausa, idx) => (
                                <div key={idx} className="flex justify-between text-sm px-2 py-1 hover:bg-gray-50 rounded">
                                  <span>
                                    <span className="text-gray-500">Inicio:</span>
                                    <span className="ml-1">{new Date(pausa.inicio).toLocaleTimeString()}</span>
                                  </span>
                                  <span>
                                    <span className="text-gray-500">Fin:</span>
                                    <span className="ml-1">
                                      {pausa.fin ? new Date(pausa.fin).toLocaleTimeString() : 'En curso'}
                                    </span>
                                  </span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    pausa.activa ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                                  }`}>
                                    {pausa.activa ? 'Activo' : 'Finalizado'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* SECCION HORARIOS - Admin y Recepcion */}
          {/* ========================================== */}
          {puedeVerHorarios && (
            <>
              <div className="flex justify-between items-center mt-6 md:mt-8 mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-700">Horarios</h2>
              </div>
              <div className="overflow-x-auto">
                <DataTable
                  columns={[
                    { header: "Dia", accessor: "diaNombre" },
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