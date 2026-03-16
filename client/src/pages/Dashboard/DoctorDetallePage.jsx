import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getDoctorByIdRequest } from "/src/api/doctores";




function DoctorDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const doctorRes = await getDoctorByIdRequest(id);
        setDoctor(doctorRes.data);
        
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
          
          <div className="mt-4 mb-6">
            <button 
              onClick={() => {
                setErrors([]);
                setModalAbierto(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              + Agregar Horario
            </button>
            </div>
        </>
      )}

      <Modal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar Nuevo Horario"
      >
     
      </Modal>
    </div>
  );
}

export default DoctorDetallePage;