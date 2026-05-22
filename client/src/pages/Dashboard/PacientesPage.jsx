import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { SearchBar } from "../../components/SearchBar";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";

import {
  getPacienteRequest,
  createPacienteRequest,
  updatePacienteRequest,
  deletePacienteRequest
} from "/src/api/pacientes";
import { getClientesRequest } from "/src/api/clientes";
import { DataTable } from "../../components/DataTable";
import { useEdit } from "../../hooks/useEdit";

function PacientesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pacientes, setPacientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [clientes, setClientes] = useState([]);

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isClient = user?.role === 'client';

  // Cargar dueños (solo necesario para admin y doctor)
  useEffect(() => {
    if (isAdmin || isDoctor) {
      const obtenerClientes = async () => {
        try {
          const response = await getClientesRequest();
          const clientesOptions = response.data.map(cliente => ({
            value: cliente._id,
            label: `${cliente.username} ${cliente.lastname} (${cliente.email})`
          }));
          setClientes(clientesOptions);
        } catch (error) {
          manejarErrorResponse(error, setErrors, setSuccessMessage);
        }
      };
      obtenerClientes();
    }
  }, [isAdmin, isDoctor]);

  const handleCreatePaciente = async (data) => {
    try {
      await createPacienteRequest(data);
      setMostrarFormulario(false);
      await cargarPacientes();
      setSuccessMessage("Paciente creado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const cargarPacientes = async () => {
    try {
      const response = await getPacienteRequest();
      let pacientesData = response.data;
      
      if (isClient && user?._id) {
        pacientesData = pacientesData.filter(paciente => paciente.ownerId?._id === user._id);
      }
      
      setPacientes(pacientesData);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  useEffect(() => {
    if (user) {
      cargarPacientes();
    }
  }, [user]);

  //  FUNCIÓN DE ELIMINACIÓN MANUAL (igual que en ClientesPage)
  const handleDeletePaciente = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${nombre}"?`)) return;
    
    try {
      await deletePacienteRequest(id);
      //  Recargar los datos después de eliminar
      await cargarPacientes();
      setSuccessMessage("Paciente eliminado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const pacientesFiltrados = pacientes.filter(paciente => {
    const texto = busqueda.toLowerCase();
    return (
      paciente.nombre?.toLowerCase().includes(texto) ||
      paciente.especie?.toLowerCase().includes(texto) ||
      paciente.raza?.toLowerCase().includes(texto) ||
      paciente.ownerId?.username?.toLowerCase().includes(texto)
    );
  });

  const pacientesConDueño = pacientesFiltrados.map(paciente => ({
    ...paciente,
    nombreDueño: paciente.ownerId?.username || "Sin dueño"
  }));

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
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {isClient ? ' Mis Mascotas' : ' Gestión de mascotas/pacientes'}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar paciente por nombre, raza y dueño..."
            />
          </div>
          {(isAdmin || isDoctor || isClient) && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition shadow-sm whitespace-nowrap font-medium"
            >
              + Nueva Mascota
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6 mb-6">
        {mostrarFormulario && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">Crear Nueva Mascota</h2>
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
              customProps={{ 
                ownerOptions: clientes,
                defaultOwnerId: isClient ? user?._id : null
              }}
              onSubmit={handleCreatePaciente}
              errors={errors}
              successMessage={successMessage}
            />
          </div>
        )}

      {showEditForm && (isAdmin || isDoctor) && (
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700">✏️ Editar Paciente</h2>
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
customProps={{ 
  ownerOptions: pacienteSeleccionado?.ownerId ? [{
    value: pacienteSeleccionado.ownerId._id,
    label: `${pacienteSeleccionado.ownerId.username} ${pacienteSeleccionado.ownerId.lastname || ''}`
  }] : []
}}      defaultValues={{
        ...pacienteSeleccionado,
        peso: pacienteSeleccionado?.peso?.valor || '',
        pesoUnidad: pacienteSeleccionado?.peso?.unidad || 'kg'
      }}
      errors={editErrors}
      successMessage={editSuccessMessage}
      onSubmit={handleUpdate}
    />
  </div>
)}
       
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        {pacientes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="text-6xl mb-4"></div>
            <p className="text-gray-500 text-lg">No hay pacientes registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nueva Mascota" para comenzar</p>
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
            onRowClick={(paciente) => navigate(`/pacientes/${paciente._id}`)}
            onEdit={(isAdmin || isDoctor) ? (paciente) => {
              setPacienteSeleccionado(paciente);
              handleEdit(paciente);
            } : undefined}
            onDelete={isAdmin ? (paciente) => {
              handleDeletePaciente(paciente._id, paciente.nombre);
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default PacientesPage;