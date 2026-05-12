import { useParams, useNavigate, useLocation } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getDoctorByIdRequest } from "/src/api/doctores";
import { getHorariosByDoctorRequest } from "/src/api/horarios";
import { DataTable } from "../../components/DataTable";
import { editConfig } from "../config/editConfig";
import { updateHorarioRequest } from "/src/api/horarios";  
import { iniciarPausaRequest, terminarPausaRequest, getPausasActivasRequest } from "/src/api/pausas";

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

  // ✅ Logs para depurar
  console.log("🔍 user completo:", user);
  console.log("🔍 user?._id:", user?._id);
  console.log("🔍 id de la URL:", id);
  console.log("🔍 user?.role:", user?.role);
  
  // ✅ Comparar correctamente los IDs
  const isDoctorViewingSelf = user?.role === 'doctor' && String(user?._id) === String(id);
  const isAdmin = user?.role === 'admin';
  
  console.log("🔍 isDoctorViewingSelf:", isDoctorViewingSelf);
  console.log("🔍 isAdmin:", isAdmin);
  console.log("🔍 Mostrar pausas:", isAdmin || isDoctorViewingSelf);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      try {
        const doctorRes = await getDoctorByIdRequest(id);
        setDoctor(doctorRes.data);
        console.log("📋 Doctor cargado:", doctorRes.data);
        
        // Solo cargar horarios si es admin
        if (isAdmin) {
          const horariosRes = await getHorariosByDoctorRequest(id);
          setHorarios(horariosRes.data);
        }
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id, isAdmin]);

  // Cargar pausa activa - para admin y para el doctor viendo su propio perfil
  useEffect(() => {
    let isMounted = true;
    
    const cargarPausaActiva = async () => {
      // ✅ Solo cargar pausa si es admin o el doctor viendo su propio perfil
      if (!isAdmin && !isDoctorViewingSelf) {
        console.log("⏭️ No cargar pausa - no es admin ni el propio doctor");
        return;
      }
      
      try {
        console.log("🔄 Cargando pausa activa para doctor:", id);
        const res = await getPausasActivasRequest(id);
        console.log("📊 Respuesta de pausas:", res);
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            console.log("✅ Pausa activa encontrada:", res.data[0]);
            setPausaActiva(res.data[0]);
          } else {
            console.log("❌ No hay pausa activa");
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
  }, [id, isAdmin, isDoctorViewingSelf]);

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
      setSuccessMessage("Horario actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const iniciarPausa = async () => {
    try {
      console.log("🍽️ Iniciando pausa para doctor:", id);
      const res = await iniciarPausaRequest({ doctorId: id, motivo: "almuerzo" });
      console.log("📊 Respuesta al iniciar pausa:", res);
      setPausaActiva(res.data);
      setSuccessMessage("Almuerzo iniciado");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error al iniciar pausa:", error);
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const terminarPausa = async () => {
    try {
      console.log("🍽️ Terminando pausa:", pausaActiva._id);
      await terminarPausaRequest(pausaActiva._id);
      setPausaActiva(null);
      setSuccessMessage("Almuerzo terminado");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error al terminar pausa:", error);
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/doctores')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Doctores
      </button>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !doctor && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Doctor no encontrado</p>
          <button
            onClick={() => navigate('/doctores')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
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

          {/* ✅ SECCIÓN PAUSAS - Siempre visible para admin y para el doctor viendo su propio perfil */}
          {(isAdmin || isDoctorViewingSelf) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">🍽️ Control de Almuerzo</h2>
                <div className="flex gap-3">
                  {!pausaActiva ? (
                    <button
                      onClick={iniciarPausa}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                    >
                      Iniciar Almuerzo
                    </button>
                  ) : (
                    <button
                      onClick={terminarPausa}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Volver del Almuerzo
                    </button>
                  )}
                </div>
              </div>
              {pausaActiva && (
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mt-2">
                  <p className="text-sm text-yellow-800">
                    ⏳ Almuerzo iniciado a las: {new Date(pausaActiva.inicio).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ✅ Si no es admin ni el propio doctor, mostrar mensaje */}
          {!isAdmin && !isDoctorViewingSelf && (
            <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-500">No tienes permisos para ver esta información.</p>
            </div>
          )}

          {/* ✅ SECCIÓN HORARIOS - SOLO para admin */}
          {isAdmin && horarios.length > 0 && (
            <>
              <div className="flex justify-between items-center mt-8 mb-4">
                <h2 className="text-xl font-semibold text-gray-700">📅 Horarios</h2>
              </div>
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
                onEdit={handleEditHorario}  
              />
            </>
          )}
        </>
      )}

      <Modal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Editar Horario"
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