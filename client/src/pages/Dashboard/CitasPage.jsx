import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { FormularioCita } from "../../components/forms/FormularioCita";
import { 
  createCita,
  updateCita,
  deleteCita,
  getCitasRequest
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
  const [fechaFiltro, setFechaFiltro] = useState("");
  const navigate = useNavigate();

  const handleCreateCita = async (data) => {
    try {
      await createCita(data);
      setMostrarFormulario(false);
      const response = await getCitasRequest();
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
      const response = await getCitasRequest();
      // Ordenar por fecha (más reciente primero)
      const citasOrdenadas = response.data.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      setCitas(citasOrdenadas);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };
  obtenerCitas();
}, []);


const citasFiltradas = citas.filter(cita => {
  // Filtro por búsqueda
  const texto = busqueda.toLowerCase();
  const matchBusqueda = (
    cita.doctorId?.username?.toLowerCase().includes(texto) ||
    cita.doctorId?.lastname?.toLowerCase().includes(texto) ||
    cita.pacienteId?.nombre?.toLowerCase().includes(texto)
  );
  
  // Filtro por fecha
  const matchFecha = fechaFiltro ? cita.fecha?.startsWith(fechaFiltro) : true;
  
  return matchBusqueda && matchFecha;
});
  const { handleDelete: handleDeleteCita } = useDelete(
    deleteCita,
    getCitasRequest,
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
  async (id, data) => {
    console.log("🔵 1. updateCita llamado con ID:", id);
    console.log("🔵 2. Datos a enviar:", data);
    const res = await updateCita(id, data);
    console.log("🔵 3. Respuesta del backend:", res);
    return res;
  },
  getCitasRequest,
  setCitas,
  editConfig.editCita,
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
            <input
  type="date"//calendario para filtrar por fecha lo crea el navegadoir automaticamente
  value={fechaFiltro}
  onChange={(e) => setFechaFiltro(e.target.value)}
  className="px-4 py-2 border border-cyan-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
  placeholder="Filtrar por fecha"
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
          <FormularioCita
  onSubmit={handleCreateCita}
  cita={null}
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
         <FormularioCita
  onSubmit={(data) => {
    alert("🔥 El formulario se envió con datos: " + JSON.stringify(data));
    console.log("🔥 Datos enviados:", data);
  }}
  cita={citaSeleccionada}
/>
          </div>
        )}
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
{citas.length === 0 ? (
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
{ 
  header: "Fecha", 
  accessor: "fecha", 
  render: (cita) => {
    const fecha = new Date(cita.fecha);//conversion de zona horaria a formato legible
    const año = fecha.getUTCFullYear();
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getUTCDate()).padStart(2, '0');
    return `${dia}/${mes}/${año}`;
  }
},
  { header: "Hora", accessor: "horaInicio" },
  { header: "Doctor", accessor: "doctorId", render: (cita) => cita.doctorId?.username },
  { header: "Mascota", accessor: "pacienteId", render: (cita) => cita.pacienteId?.nombre },
  { header: "Estado", accessor: "estado" }
]}
            data={citasFiltradas}
            onRowClick={(cita) => navigate(`/citas/${cita._id}`)} // app.jsx lo sabe

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

export default CitasPage