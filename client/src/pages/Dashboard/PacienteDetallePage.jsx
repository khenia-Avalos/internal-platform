import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getClienteByIdRequest } from "/src/api/clientes";
import { getPacienteByOwnerRequest } from "/src/api/pacientes";
import { createPacienteRequest } from "/src/api/pacientes";
import { getPacienteByIdRequest } from "/src/api/pacientes";
import { getInternadosByPacienteRequest, createInternadoRequest } from "/src/api/internados";


function PacienteDetallePage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [paciente, setPaciente] = useState(null);
    const [dueno, setDueno] = useState(null); // ← UN SOLO dueño, no array
    const [loading, setLoading] = useState(true);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [internados, setInternados] = useState([]);
const [mostrarFormInternado, setMostrarFormInternado] = useState(false);

    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            try {
                // 1. Cargar paciente por ID
                const pacienteRes = await getPacienteByIdRequest(id);
                setPaciente(pacienteRes.data);
                
                // 2. Si tiene dueño, cargar datos del dueño
                if (pacienteRes.data.ownerId) {
   setDueno(pacienteRes.data.ownerId);           
     }
     // Después de cargar el paciente
  const internadosRes = await getInternadosByPacienteRequest(id);
  setInternados(internadosRes.data);

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



const handleCrearInternado = async (data) => {
    try {
        //enviar datos con pacienteid
await createInternadoRequest({ ...data, pacienteId: id });
setMostrarFormInternado(false);
setErrors([]);
 const response = await getInternadosByPacienteRequest(id);
      setInternados(response.data);
      setSuccessMessage("Internado creado exitosamente");
setTimeout(() => setSuccessMessage(""), 3000);
    }catch (error) {
               manejarErrorResponse(error, setErrors, setSuccessMessage);
        

    }
}


    return (
        <div className="p-6 max-w-7xl mx-auto">
            <button
                onClick={() => navigate('/pacientes')}
                className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver a Pacientes
            </button>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            )}

            {!loading && !paciente && (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg">Paciente no encontrado</p>
                    <button
                        onClick={() => navigate('/pacientes')}
                        className="mt-4 text-cyan-600 hover:text-cyan-700"
                    >
                        Volver a la lista
                    </button>
                </div>
            )}

            {!loading && paciente && (
                <>
                    <InfoCard
                        title={`Información de ${paciente.nombre}`}
                        data={[
                            { label: "Nombre", value: paciente.nombre },
                            { label: "Especie", value: paciente.especie },
                            { label: "Raza", value: paciente.raza || 'Sin raza' },
                            { label: "Edad", value: paciente.edad ? `${paciente.edad} años` : 'No especificada' },
                            { label: "Sexo", value: paciente.sexo || 'No especificado' },
                            { label: "Color Pelaje", value: paciente.colorPelaje || 'No especificado' },
                            { label: "Peso", value: paciente.peso ? `${paciente.peso.valor} ${paciente.peso.unidad}` : 'No especificado' },
                            { label: "Antecedentes Médicos", value: paciente.antecedentesMedicos || 'No especificados' },
                        ]}
                    />

                    {dueno && (
                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-4">Dueño de {paciente.nombre}</h3>
                            <InfoCard
                                title={`${dueno.username} ${dueno.lastname}`}
                                data={[
                                    { label: "Nombre completo", value: `${dueno.username} ${dueno.lastname}` },
                                    { label: "Email", value: dueno.email },
                                    { label: "Teléfono", value: dueno.phoneNumber },
                                    { label: "Cédula", value: dueno.cedula },
                                    { label: "Dirección", value: dueno.direccion },
                                ]}
                            />
                        </div>
                    )}
                   <div className="mt-8">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-semibold">Historial de Internados</h3>
    <button
      onClick={() => setMostrarFormInternado(true)}
      className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition"
    >
      + Agregar Internado
    </button>
  </div>

  {/* Formulario de internado */}
  {mostrarFormInternado && (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-700">Crear Nuevo Internado</h2>
        <button
          onClick={() => setMostrarFormInternado(false)}
          className="text-gray-400 hover:text-gray-600 transition text-xl"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
      <DynamicForm
        {...createConfig.internado}
        layout="grid"
        defaultValues={{ pacienteId: id }}
        onSubmit={handleCrearInternado}
        errors={errors}
        successMessage={successMessage}
      />
    </div>
  )}

  {/* Lista de internados */}
  {internados.length === 0 ? (
    <p className="text-gray-500">No hay internados registrados</p>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {internados.map((internado) => (
        <InfoCard
          key={internado._id}
          title={`Internado ${new Date(internado.fechaIngreso).toLocaleDateString()}`}
          data={[
            { label: "Fecha Ingreso", value: new Date(internado.fechaIngreso).toLocaleDateString() },
            { label: "Fecha Egreso", value: internado.fechaEgreso ? new Date(internado.fechaEgreso).toLocaleDateString() : 'En curso' },
            { 
              label: "Medicamentos", 
              value: internado.medicamentos?.length > 0 
                ? internado.medicamentos.map(m => `${m.nombre} (${m.dosis})`).join(', ')
                : 'Sin medicamentos'
            },
            { label: "Notas", value: internado.notas || 'Sin notas' }
          ]}
        />
      ))}
    </div>
  )}
</div>
  </>
)}
        
        </div>
    );
}

export default PacienteDetallePage;