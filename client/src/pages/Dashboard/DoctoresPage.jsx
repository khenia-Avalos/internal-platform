import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { handleDuplicateError } from "../../utils/errorHandler";
import { SearchBar } from "../../components/SearchBar";


import { 
  getDoctoresRequest, 
  createDoctorRequest, 
  updateDoctorRequest, 
  deleteDoctorRequest 
} from "/src/api/doctores";
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

function DoctoresPage() {
  const [doctores, setDoctores] = useState([]);//lista de doctores obtenida del backend
  const [mostrarFormulario, setMostrarFormulario] = useState(false);//controla la visibilidad del formulario de creación
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);//almacena el doctor seleccionado para edición
  const [busqueda, setBusqueda] = useState("");//estado para el término de búsqueda
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); 

  const handleCreateDoctor = async (data) => {
    try {
      await createDoctorRequest(data);
      setMostrarFormulario(false);
      const response = await getDoctoresRequest();
      setDoctores(response.data);
      setSuccessMessage("Doctor creado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      if (!handleDuplicateError(error, setErrors)) {
        setErrors(["Error al crear doctor. Intenta de nuevo."]);
      }
      console.error("Error al crear doctor:", error);
    }
  };

  useEffect(() => {
    const obtenerDoctores = async () => {
      try {
        const response = await getDoctoresRequest();
        setDoctores(response.data);
      } catch (error) {
        console.error("Error al obtener doctores:", error);
      }
    };
    obtenerDoctores();
  }, []);

  const doctoresFiltrados = doctores.filter(doctor => {
    const texto = busqueda.toLowerCase();
    return (
      doctor.username?.toLowerCase().includes(texto) ||
      doctor.lastname?.toLowerCase().includes(texto) ||
      doctor.email?.toLowerCase().includes(texto) ||
      doctor.phoneNumber?.toLowerCase().includes(texto) ||
      doctor.especialidad?.toLowerCase().includes(texto)
    );
  });

  const { handleDelete: handleDeleteDoctor } = useDelete(
    deleteDoctorRequest,
    getDoctoresRequest,
    setDoctores
  );

  const {
    showForm: showEditForm,
    errors: editErrors,
    successMessage: editSuccessMessage,
    handleEdit,
    handleUpdate,
    handleCancel
  } = useEdit(
    updateDoctorRequest,
    getDoctoresRequest,
    setDoctores,
    editConfig.doctor,
    null
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabecera con título y acciones */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">👨‍⚕️ Gestión de Doctores</h1>
        <div className="flex w-full sm:w-auto gap-3">
          <SearchBar 
            value={busqueda}
            onChange={setBusqueda}
            placeholder="Buscar doctor..."
          />
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap font-medium"
          >
            + Nuevo Doctor
          </button>
        </div>
      </div>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">📋 Crear Nuevo Doctor</h2>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>
          <DynamicForm
            {...createConfig.registerDoctor}
            onSubmit={handleCreateDoctor}
            errors={errors}
            successMessage={successMessage}
          />
        </div>
      )}

      {/* Formulario de edición */}
      {showEditForm && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">✏️ Editar Doctor</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              ✕
            </button>
          </div>
          <DynamicForm
            {...editConfig.editDoctor}
            defaultValues={doctorSeleccionado}
            errors={editErrors}
            successMessage={editSuccessMessage}
            onSubmit={handleUpdate}
          />
        </div>
      )}

      {/* Tabla de doctores */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {doctores.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <p className="text-gray-500 text-lg">No hay doctores registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nuevo Doctor" para comenzar</p>
          </div>
        ) : doctoresFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No se encontraron resultados para "{busqueda}"</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: "Nombre", accessor: "username" },
              { header: "Apellido", accessor: "lastname" },
              { header: "Email", accessor: "email" },
              { header: "Teléfono", accessor: "phoneNumber" },
              { header: "Especialidad", accessor: "especialidad" }
            ]}
            data={doctoresFiltrados}
            onEdit={(doctor) => {
              setDoctorSeleccionado(doctor);
              handleEdit(doctor);
            }}
            onDelete={handleDeleteDoctor}
          />
        )}
      </div>
    </div>
  );
}

export default DoctoresPage;