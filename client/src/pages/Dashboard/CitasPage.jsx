import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import {createCita, getCitasByDoctor, deleteCitaRequest, updateCita} from "../../api/cita";
import { 
  createCita,
  getHorariosDisponibles,
  getCitasByDoctor,
  getCitasByPaciente,
  updateCita,
  deleteCita
} from "/src/api/cita";
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

function CitasPage() {
  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const handleCreateCita = async (data) => {
    try {
      await createCita(data);
      setMostrarFormulario(false);
      const response = await getCitasByDoctor();
      setCitas(response.data);
      setSuccessMessage("Cita creada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {

      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  useEffect(() => {
    const obtenerCitas = async () => {
      try {
        const response = await getCitasByDoctor();
        setCitas(response.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      }
    };
    obtenerCitas();
  }, []);

  const citasFiltradas = citas.filter(cita => {
    const texto = busqueda.toLowerCase();
    return (
      cita.doctorId?.username?.toLowerCase().includes(texto) ||
      cita.doctorId?.lastname?.toLowerCase().includes(texto) ||
      cita.doctorId?.email?.toLowerCase().includes(texto) ||
      cita.doctorId?.phoneNumber?.toLowerCase().includes(texto) ||
      cita.doctorId?.especialidad?.toLowerCase().includes(texto)
    );
  });

  const { handleDelete: handleDeleteCita } = useDelete(
    deleteCitaRequest,
    getCitasByDoctor,
    setCitas
  );

  const {
    showForm: showEditForm,
    errors: editErrors,
    successMessage: editSuccessMessage,
    handleEdit,
    handleUpdate,
    handleCancel
  } = useEdit(
    updateCita,
    getCitasByDoctor,
    setCitas,
    editConfig.cita,
    null
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabecera - Versión móvil primero */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Gestion de citas</h1>

        {/* Barra de búsqueda y botón - Apilados en móvil, fila en desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar cita por nombre de dueño o mascota"
            />
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition shadow-sm whitespace-nowrap font-medium"
          >
            + Nueva Cita
          </button>
        </div>
      </div>

      {/* Contenedor de formularios - Se desplazan hacia abajo sin tapar */}
      <div className="space-y-6 mb-6">
        {/* Formulario de creación */}
        {mostrarFormulario && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700"> Crear Nueva Cita</h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...createConfig.registerCita}
              layout="grid"

              onSubmit={handleCreateCita}
              errors={errors}
              successMessage={successMessage}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {showEditForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700"> Editar Cita</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...editConfig.editCita}
              layout="grid"

              defaultValues={citaSeleccionada}
              errors={editErrors}
              successMessage={editSuccessMessage}
              onSubmit={handleUpdate}
            />
          </div>
        )}
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        {clientes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg">No hay citas registradas</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nueva Cita" para comenzar</p>
          </div>
        ) : citasFiltradas.length === 0 ? (
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
              { header: "Cedula", accessor: "cedula" },
              { header: "Dirección", accessor: "direccion" }]}
            data={citasFiltradas}
            onRowClick={(cita) => navigate(`/citas/${cita._id}`)} // ← NUEVO

            onEdit={(cita) => {
              setCitaSeleccionada(cita);
              handleEdit(cita);
            }}
            onDelete={(cita) => {
              handleDeleteCita(cita._id, cita.username);
            }} />
        )}
      </div>
    </div>
  );
}

export default ClientesPage;