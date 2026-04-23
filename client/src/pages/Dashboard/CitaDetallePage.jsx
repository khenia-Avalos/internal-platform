import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getCitasRequest } from "/src/api/cita";
import { getCitasByPaciente } from "/src/api/cita";
import { getCitaByIdRequest } from "/src/api/cita";




function CitaDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cita, setCita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
    const citaRes = await getCitaByIdRequest(id);
setCita(citaRes.data);
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
        onClick={() => navigate('/clientes')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver atras
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
          
        </>
      )}
    </div>
  );
}

export default CitaDetallePage;