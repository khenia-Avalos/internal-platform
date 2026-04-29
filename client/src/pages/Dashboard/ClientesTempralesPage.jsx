import React from "react";
import { useState, useEffect } from "react";
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { toast, Toaster } from 'sonner';
import { FormularioClienteTemporal } from "../../components/forms/FormularioClienteTemporal";
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";

import {
  getClientesTemporalesRequest,
  completarRegistroClienteTemporalRequest,
  deleteClienteTemporalRequest
} from "../../api/ClientesTemporales";
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";

function ClientesTemporalesPage() {
  const [clientesTemporales, setClientesTemporales] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [mostrarFormCompleto, setMostrarFormCompleto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar clientes temporales
  useEffect(() => {
    const obtenerClientesTemporales = async () => {
      setLoading(true);
      try {
        const response = await getClientesTemporalesRequest();
        setClientesTemporales(response.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors);
        toast.error("Error al cargar clientes temporales");
      } finally {
        setLoading(false);
      }
    };
    obtenerClientesTemporales();
  }, []);

  const recargarLista = async () => {
    const response = await getClientesTemporalesRequest();
    setClientesTemporales(response.data);
  };

  const handleCompletarRegistro = async (cliente) => {
    setClienteSeleccionado(cliente);
    setMostrarFormCompleto(true);
  };

  const handleSubmitCompleto = async (data) => {
    try {
      await completarRegistroClienteTemporalRequest(clienteSeleccionado._id, data);
      await recargarLista();
      setMostrarFormCompleto(false);
      setClienteSeleccionado(null);
      toast.success("✅ Cliente registrado completamente");
    } catch (error) {
      toast.error("❌ Error al completar registro");
      manejarErrorResponse(error, setErrors);
    }
  };

  const { handleDelete: handleDeleteClienteTemporal } = useDelete(
    deleteClienteTemporalRequest,
    getClientesTemporalesRequest,
    setClientesTemporales,
    {
      onSuccess: () => toast.success("🗑️ Cliente temporal eliminado"),
      onError: () => toast.error("❌ Error al eliminar cliente temporal")
    }
  );

  const clientesFiltrados = clientesTemporales.filter(cliente => {
    const texto = busqueda.toLowerCase();
    return (
      cliente.username?.toLowerCase().includes(texto) ||
      cliente.phoneNumber?.toLowerCase().includes(texto)
    );
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          📞 Clientes Temporales (Agendamiento Rápido)
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Clientes que agendaron cita sin completar registro. Al llegar a la consulta, complete sus datos.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar por nombre, teléfono..."
            />
          </div>
          <button
            onClick={() => setMostrarFormulario(true)}
            className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition"
          >
            📞 + Nueva Cita Rápida
          </button>
        </div>
      </div>

      {/* Formulario de agendamiento rápido */}
      {mostrarFormulario && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-700">
              📝 Agendar Cita Rápida (Datos Mínimos)
            </h2>
            <button
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-400 hover:text-gray-600 transition text-xl"
            >
              ✕
            </button>
          </div>
          
          <FormularioClienteTemporal
            onSuccess={() => {
              setMostrarFormulario(false);
              recargarLista();
            }}
            onCancel={() => setMostrarFormulario(false)}
          />
        </div>
      )}

      {/* Modal para completar registro */}
      {mostrarFormCompleto && clienteSeleccionado && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Completar Registro - {clienteSeleccionado.username}</h2>
                <button onClick={() => setMostrarFormCompleto(false)} className="text-gray-400">✕</button>
              </div>
              <DynamicForm
                {...createConfig.completarRegistroCliente}
                layout="grid"
                defaultValues={{
                  username: clienteSeleccionado.username,
                  phoneNumber: clienteSeleccionado.phoneNumber,
                  email: clienteSeleccionado.email || '',
                }}
                onSubmit={handleSubmitCompleto}
                errors={errors}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : clientesTemporales.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay clientes temporales</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: "Nombre", accessor: "username" },
              { header: "Teléfono", accessor: "phoneNumber" },
              { header: "Email", accessor: "email", render: (c) => c.email || "—" },
              { 
                header: "Estado", 
                accessor: "estado", 
                render: (c) => (
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    c.estado === 'completo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.estado === 'completo' ? '✅ Registrado' : '⏳ Pendiente'}
                  </span>
                )
              }
            ]}
            data={clientesFiltrados}
            onRowClick={(cliente) => navigate(`/clientes/${cliente._id}`)}
            onEdit={(cliente) => {
              if (cliente.estado !== 'completo') {
                handleCompletarRegistro(cliente);
              }
            }}
            onDelete={(cliente) => handleDeleteClienteTemporal(cliente._id, cliente.username)}
            editLabel={cliente => cliente.estado !== 'completo' ? "Completar Registro" : "Ver"}
          />
        )}
      </div>
    </div>
  );
}

export default ClientesTemporalesPage;