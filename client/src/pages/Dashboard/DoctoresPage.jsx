import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { SearchBar } from "../../components/SearchBar";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { useNavigate } from 'react-router';




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
  const navigate = useNavigate();
  const [doctores, setDoctores] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
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
       manejarErrorResponse(error, setErrors, setSuccessMessage);

    }
  };

  useEffect(() => {
    const obtenerDoctores = async () => {
      try {
        const response = await getDoctoresRequest();
        setDoctores(response.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabecera - Versión móvil primero */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4"> Gestión de Doctores</h1>
        
        {/* Barra de búsqueda y botón - Apilados en móvil, fila en desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar 
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar doctor por nombre, email, especialidad..."
            />
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition shadow-sm whitespace-nowrap font-medium"
          >
            + Nuevo Doctor
          </button>
        </div>
      </div>

      {/* Contenedor de formularios - Se desplazan hacia abajo sin tapar */}
      <div className="space-y-6 mb-6">
        {/* Formulario de creación */}
        {mostrarFormulario && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700"> Crear Nuevo Doctor</h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...createConfig.registerDoctor}
                              layout="grid"

              onSubmit={handleCreateDoctor}
              errors={errors}
              successMessage={successMessage}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {showEditForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700"> Editar Doctor</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...editConfig.editDoctor}
                              layout="grid"

              defaultValues={doctorSeleccionado}
              errors={editErrors}
              successMessage={editSuccessMessage}
              onSubmit={handleUpdate}
            />
          </div>
        )}
      </div>

      {/* Tabla de doctores */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        {doctores.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg">No hay doctores registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nuevo Doctor" para comenzar</p>
          </div>
        ) : doctoresFiltrados.length === 0 ? (
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
              { header: "Nombre", accessor: "username" },
              { header: "Apellido", accessor: "lastname" },
              { header: "Email", accessor: "email" },
              { header: "Teléfono", accessor: "phoneNumber" },
              { header: "Especialidad", accessor: "especialidad" }
            ]}
            data={doctoresFiltrados}
              onRowClick={(doctor) => navigate(`/doctores/${doctor._id}`)}
            onEdit={(doctor) => {
              setDoctorSeleccionado(doctor);
              handleEdit(doctor);
            }}
onDelete={(doctor) => {
  handleDeleteDoctor(doctor._id, doctor.username);
}}    />
        )}
      </div>
    </div>
  );
}

export default DoctoresPage;