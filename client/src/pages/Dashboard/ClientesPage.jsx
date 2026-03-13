import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../config/formConfig"
import { editConfig } from "../config/editConfig"
import { createConfig } from "../config/createConfig"
import { handleDuplicateError } from "../../utils/errorHandler";
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import ClienteDetallePage from "./ClienteDetallePage";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';

import { 
  getClientesRequest, 
  createClienteRequest, 
  updateClienteRequest, 
  deleteClienteRequest 
} from "/src/api/clientes";
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(""); 
  const navigate = useNavigate();

  const handleCreateCliente = async (data) => {
    try {
      await createClienteRequest(data);
      setMostrarFormulario(false);
      const response = await getClientesRequest();
      setClientes(response.data);
      setSuccessMessage("Cliente creado exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  useEffect(() => {
    const obtenerClientes = async () => {
      try {
        const response = await getClientesRequest();
        setClientes(response.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      }
    };
    obtenerClientes();
  }, []);

  const clientesFiltrados = clientes.filter(cliente => {
    const texto = busqueda.toLowerCase();
    return (
      cliente.username?.toLowerCase().includes(texto) ||
      cliente.lastname?.toLowerCase().includes(texto) ||
      cliente.email?.toLowerCase().includes(texto) ||
      cliente.phoneNumber?.toLowerCase().includes(texto) ||
      cliente.especialidad?.toLowerCase().includes(texto)
    );
  });

  const { handleDelete: handleDeleteCliente } = useDelete(
    deleteClienteRequest,
    getClientesRequest,
    setClientes
  );

  const {
    showForm: showEditForm,
    errors: editErrors,
    successMessage: editSuccessMessage,
    handleEdit,
    handleUpdate,
    handleCancel
  } = useEdit(
    updateClienteRequest,
    getClientesRequest,
    setClientes,
    editConfig.cliente,
    null
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Cabecera - Versión móvil primero */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Gestion de clientes</h1>
        
        {/* Barra de búsqueda y botón - Apilados en móvil, fila en desktop */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar 
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar cliente por nombre, email, cédula..."
            />
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition shadow-sm whitespace-nowrap font-medium"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      {/* Contenedor de formularios - Se desplazan hacia abajo sin tapar */}
      <div className="space-y-6 mb-6">
        {/* Formulario de creación */}
        {mostrarFormulario && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700"> Crear Nuevo Cliente</h2>
              <button
                onClick={() => setMostrarFormulario(false)}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...createConfig.registerCliente}
                              layout="grid"

              onSubmit={handleCreateCliente}
              errors={errors}
              successMessage={successMessage}
            />
          </div>
        )}

        {/* Formulario de edición */}
        {showEditForm && (
          <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-700">✏️ Editar Cliente</h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 transition text-xl"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <DynamicForm
              {...editConfig.editCliente}
                              layout="grid"

              defaultValues={clienteSeleccionado}
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
            <p className="text-gray-500 text-lg">No hay clientes registrados</p>
            <p className="text-gray-400 mt-2">Haz clic en "Nuevo Cliente" para comenzar</p>
          </div>
        ) : clientesFiltrados.length === 0 ? (
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
            data={clientesFiltrados}
              onRowClick={(cliente) => navigate(`/clientes/${cliente._id}`)} // ← NUEVO

            onEdit={(cliente) => {
              setClienteSeleccionado(cliente);
              handleEdit(cliente);
            }}
            onDelete={handleDeleteCliente}
          />
        )}
      </div>
    </div>
  );
}

export default ClientesPage;