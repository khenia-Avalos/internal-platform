import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getDoctorByIdRequest } from "/src/api/doctores";
import { getHorariosByDoctorRequest } from "/src/api/horarios";
import { DataTable } from "../../components/DataTable";
import { editConfig } from "../config/editConfig";
import { updateHorarioRequest } from "/src/api/horarios";  
import {iniciarPausaRequest, terminarPausaRequest, getPausasActivasRequest} from "/src/api/pausas";

function DoctorDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
const [horarios, setHorarios] = useState([]);
const [horarioEditando, setHorarioEditando] = useState(null);
const [pausaActiva, setPausaActiva] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      
      try {
        const doctorRes = await getDoctorByIdRequest(id);
        setDoctor(doctorRes.data);
        const horariosRes = await getHorariosByDoctorRequest(id);
setHorarios(horariosRes.data)
        
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

useEffect(() => {
  const cargarPausaActiva = async () => {
    try {
      const res = await getPausasActivasRequest(id);
      if (res.data.length > 0) {
        setPausaActiva(res.data[0]);
      }
    } catch (error) {
      console.error("Error al cargar pausa activa:", error);
    }
  };
  if (id) cargarPausaActiva();
}, [id]);

  const getNombreDia = (dia) => {
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];//los del config por posicion
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
}
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
    const res = await iniciarPausaRequest({ doctorId: id, motivo: "almuerzo" });
    setPausaActiva(res.data);
    setSuccessMessage("Almuerzo iniciado");
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
    manejarErrorResponse(error, setErrors, setSuccessMessage);
  }
};

const terminarPausa = async () => {
  try {
    await terminarPausaRequest(pausaActiva._id);
    setPausaActiva(null);
    setSuccessMessage("Almuerzo terminado");
    setTimeout(() => setSuccessMessage(""), 3000);
  } catch (error) {
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
          <div className="flex justify-between items-center mt-8 mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Horarios</h2>
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
      // El badge lo hacemos con render porque es visual
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

<div className="flex justify-between items-center mt-8 mb-4">
  <h2 className="text-xl font-semibold text-gray-700">Pausas</h2>
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
        </>
      )}

      <Modal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Editar Horario"
      >
         <DynamicForm
    {...editConfig.editHorario}
    defaultValues={horarioEditando}  // ← Los datos del horario a editar
    onSubmit={handleUpdateHorario}
    errors={errors}
    successMessage={successMessage}
  />
     
      </Modal>
    </div>
  );
}

export default DoctorDetallePage;