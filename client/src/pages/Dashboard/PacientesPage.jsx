import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { SearchBar } from "../../components/SearchBar";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { useNavigate } from "react-router";


import {
  getPacienteRequest,
  createPacienteRequest,
  updatePacienteRequest,
  deletePacienteRequest
} from "/src/api/pacientes";
// Importar la API de owners para obtener los dueños
import { getClientesRequest } from "/src/api/clientes"; // ← NUEVO PASO 4
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

function PacientesPage() {
   const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  // PASO 4: Estado para guardar los dueños (owners)
  const [clientes, setClientes] = useState([]); // ← NUEVO

  // PASO 4: useEffect para cargar los dueños desde la API
  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await getClientesRequest();
        // Transformar los dueños al formato que espera react-select { value, label }
        const clientesOptions = response.data.map(cliente => ({
          value: cliente._id,
          label: `${cliente.username} ${cliente.lastname} (${cliente.email})` // ← Se muestra en el select
        }));
        setClientes(clientesOptions);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      }
    };
    obtenerClientes();
  }, []); // Se ejecuta solo una vez al montar el componente

  const handleCreatePaciente = async (data) => {
    try {
      await createPacienteRequest(data);
      setMostrarFormulario(false);
      const response = await getPacienteRequest();
      setPacientes(response.data);
      setSuccessMessage("Paciente creado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {

      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };
useEffect(() => {
  const obtenerPacientes = async () => {
    try {
      const response = await getPacienteRequest();
      
      // NORMALIZAR LOS DATOS AQUÍ
      const pacientesNormalizados = response.data.map(paciente => ({
        ...paciente,
        // Asegurar que ownerId sea siempre un objeto con la estructura que necesitas
        ownerId: typeof paciente.ownerId === 'string' 
          ? { _id: paciente.ownerId, username: 'ID: ' + paciente.ownerId } // Caso: es solo string
          : paciente.ownerId || { username: 'Sin dueño' }, // Caso: es objeto o null
        // Crear un campo auxiliar para búsquedas
        _searchableText: getSearchableText(paciente)
      }));
      
      setPacientes(pacientesNormalizados);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };
  obtenerPacientes();
}, []);

  const pacientesFiltrados = pacientes.filter(paciente => {
    const texto = busqueda.toLowerCase();
    return (
      paciente.nombre?.toLowerCase().includes(texto) ||
      paciente.especie?.toLowerCase().includes(texto) ||
      paciente.raza?.toLowerCase().includes(texto) ||
      paciente.ownerId?.toLowerCase().includes(texto)
    );
  });
  const pacientesConDueño = pacientesFiltrados.map(paciente => ({
    ...paciente,
    nombreDueño: paciente.ownerId?.username || "Sin dueño"
  }));

  const { handleDelete: handleDeletePaciente } = useDelete(
    deletePacienteRequest,
    getPacienteRequest,
    setPacientes
  );

  const {
    showForm: showEditForm,
    errors: editErrors,
    successMessage: editSuccessMessage,
    handleEdit,
    handleUpdate,
    handleCancel
  } = useEdit(
    updatePacienteRequest,
    getPacienteRequest,
    setPacientes,
    editConfig.paciente,
    null
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabecera */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Gestión de mascotas/pacientes</h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar paciente por nombre, raza y dueño."
            />
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition shadow-sm whitespace-nowrap font-medium"
          >
            + Nuevo Paciente
          </button>
        </div>
      </div>

      {/* Contenedor de formularios */}
      <div className="space-y-6 mb-6">
        {/* Formulario de creación */}
        {mostrarFormulario && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">Crear Nuevo Paciente</h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...createConfig.registerPaciente}
              layout="grid"
              // PASO 5: Pasar las opciones de dueños como customProps
              customProps={{ ownerOptions: clientes }} 
              onSubmit={handleCreatePaciente}
              errors={errors}
              successMessage={successMessage}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {showEditForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">Editar Paciente</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...editConfig.editpaciente}
              layout="grid"
              defaultValues={pacienteSeleccionado}
              // También pasar customProps al formulario de edición
              customProps={{ ownerOptions: clientes }} // ← NUEVO (opcional, si editar también necesita el select)
              errors={editErrors}
              successMessage={editSuccessMessage}
              onSubmit={handleUpdate}
            />
          </div>
        )}
      </div>

      {/* Tabla de pacientes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        {pacientes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg">No hay pacientes registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nuevo Paciente" para comenzar</p>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="text-center py-16 px-4">
            <p className="text-gray-500 text-lg">No se encontraron resultados para "{busqueda}"</p>
            <button
              onClick={() => setBusqueda("")}
              className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: "Nombre", accessor: "nombre" },
              { header: "Especie", accessor: "especie" },
              { header: "Raza", accessor: "raza" },
              { header: "Edad", accessor: "edad" },
              { header: "Sexo", accessor: "sexo" },
              { header: "Antecedentes Médicos", accessor: "antecedentesMedicos" },
              { header: "Dueño", accessor: "nombreDueño" },
              { header: "Color Pelaje", accessor: "colorPelaje" }
            ]}
            data={pacientesConDueño}
onRowClick={(paciente) => {

  navigate(`/pacientes/${paciente._id}`);
}}            onEdit={(paciente) => {

              setPacienteSeleccionado(paciente);
              handleEdit(paciente);
            }}
            onDelete={(paciente) => {
              handleDeletePaciente(paciente._id, paciente.nombre);
            }} />
        )}
      </div>
    </div>
  );
}

export default PacientesPage;