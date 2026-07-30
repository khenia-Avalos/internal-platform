// src/pages/Dashboard/MedicamentosPage.jsx
import React from "react";
import { useState, useEffect } from "react";
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { toast, Toaster } from 'sonner';
import { useAuth } from "../../hooks/useAuth";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { DataTable } from "../../components/DataTable";
import { useEdit } from "../../hooks/useEdit";
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { editConfig } from "../config/editConfig";

import {
  getMedicamentosRequest,
  buscarMedicamentosRequest,
  createMedicamentoRequest,
  updateMedicamentoRequest,
  deleteMedicamentoRequest
} from "/src/api/medicamentos";

function MedicamentosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Cargar medicamentos
  const cargarMedicamentos = async () => {
    setLoading(true);
    try {
      const response = await getMedicamentosRequest();
      setMedicamentos(response.data);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al cargar medicamentos");
    } finally {
      setLoading(false);
    }
  };

  // Buscar medicamentos
  const buscarMedicamentos = async (query) => {
    setLoading(true);
    try {
      const response = await buscarMedicamentosRequest(query);
      setMedicamentos(response.data);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al buscar medicamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  // Manejar búsqueda
  const handleBuscar = () => {
    if (busqueda.trim() === "") {
      cargarMedicamentos();
    } else {
      buscarMedicamentos(busqueda);
    }
  };

  // Manejar Enter en búsqueda
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleBuscar();
    }
  };

  // Crear medicamento
  const handleCreateMedicamento = async (data) => {
    try {
      await createMedicamentoRequest(data);
      setMostrarFormulario(false);
      await cargarMedicamentos();
      toast.success("Medicamento creado exitosamente");
      setSuccessMessage("");
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al crear medicamento");
    }
  };

  // Actualizar medicamento
  const handleUpdateMedicamento = async (data) => {
    try {
      await updateMedicamentoRequest(medicamentoSeleccionado._id, data);
      setShowEditForm(false);
      setMedicamentoSeleccionado(null);
      await cargarMedicamentos();
      toast.success("Medicamento actualizado exitosamente");
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al actualizar medicamento");
    }
  };

  // Eliminar medicamento
  const handleDeleteMedicamento = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar "${nombre}"?`)) return;
    
    try {
      await deleteMedicamentoRequest(id);
      await cargarMedicamentos();
      toast.success(`Medicamento "${nombre}" eliminado`);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al eliminar medicamento");
    }
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 max-w-full">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Medicamentos
          </h1>
          {isAdmin && (
            <button
              onClick={() => {
                setMostrarFormulario(true);
                setErrors([]);
              }}
              className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
            >
              + Nuevo Medicamento
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por nombre, presentación, vía o uso..."
              onKeyPress={handleKeyPress}
            />
          </div>
          <button
            onClick={handleBuscar}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">
              Nuevo Medicamento
            </h2>
            <button
              onClick={() => {
                setMostrarFormulario(false);
                setErrors([]);
              }}
              className="text-gray-400 hover:text-gray-600 transition text-xl"
            >
              ×
            </button>
          </div>
          <DynamicForm
            {...createConfig.createMedicamento}
            layout="grid"
            onSubmit={handleCreateMedicamento}
            errors={errors}
            successMessage={successMessage}
          />
        </div>
      )}

      {/* Formulario de edición */}
      {showEditForm && medicamentoSeleccionado && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">
              Editar Medicamento
            </h2>
            <button
              onClick={() => {
                setShowEditForm(false);
                setMedicamentoSeleccionado(null);
                setErrors([]);
              }}
              className="text-gray-400 hover:text-gray-600 transition text-xl"
            >
              ×
            </button>
          </div>
          <DynamicForm
            {...editConfig.editMedicamento}
            layout="grid"
            defaultValues={medicamentoSeleccionado}
            onSubmit={handleUpdateMedicamento}
            errors={errors}
            successMessage={successMessage}
          />
        </div>
      )}

      {/* Tabla de medicamentos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : medicamentos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No hay medicamentos registrados</p>
            {isAdmin && (
              <button
                onClick={() => {
                  setMostrarFormulario(true);
                  setErrors([]);
                }}
                className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
              >
                Agregar el primer medicamento
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <DataTable
              columns={[
                { 
                  header: "Foto", 
                  accessor: "foto",
                  render: (item) => (
                    item.foto ? (
                      <img 
                        src={item.foto} 
                        alt={item.nombre} 
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              <span class="text-2xl"></span>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                        <span className="text-2xl"></span>
                      </div>
                    )
                  )
                },
                { header: "Medicamento", accessor: "nombre" },
                { header: "Vía", accessor: "via" },
                { header: "Presentación", accessor: "presentacion" },
                { 
                  header: "Para qué sirve", 
                  accessor: "paraQueSirve",
                  render: (item) => (
                    <span className="line-clamp-2 max-w-xs text-sm">
                      {item.paraQueSirve}
                    </span>
                  )
                }
              ]}
              data={medicamentos}
              onEdit={isAdmin ? (medicamento) => {
                setMedicamentoSeleccionado(medicamento);
                setShowEditForm(true);
                setErrors([]);
              } : undefined}
              onDelete={isAdmin ? (medicamento) => {
                handleDeleteMedicamento(medicamento._id, medicamento.nombre);
              } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicamentosPage;