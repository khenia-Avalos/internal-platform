import React from "react";
import { useState, useEffect } from "react";
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { 
  createCita,
  updateCita,
  deleteCita,
  getCitasRequest
} from "/src/api/cita";
import { DataTable } from "../../components/DataTable";
import { FormularioCita } from "../../components/forms/FormularioCita";
import { useDelete } from "../../hooks/useDelete";

function CitasPage() {
  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
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

const handleUpdateCita = async (data) => {
  try {
    await updateCita(citaSeleccionada._id, data);
    const response = await getCitasRequest();
    setCitas(response.data);
    setSuccessMessage("Cita actualizada exitosamente");
    setTimeout(() => setSuccessMessage(""), 3000);
    setShowEditForm(false);
    setCitaSeleccionada(null);
  } catch (error) {
    manejarErrorResponse(error, setErrors, setSuccessMessage);
  }
};

  useEffect(() => {
    const obtenerCitas = async () => {
      try {
        const response = await getCitasRequest();
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
    const texto = busqueda.toLowerCase();
    const matchBusqueda = (
      cita.doctorId?.username?.toLowerCase().includes(texto) ||
      cita.doctorId?.lastname?.toLowerCase().includes(texto) ||
      cita.pacienteId?.nombre?.toLowerCase().includes(texto)
    );
    const matchFecha = fechaFiltro ? cita.fecha?.startsWith(fechaFiltro) : true;
    return matchBusqueda && matchFecha;
  });

  const { handleDelete: handleDeleteCita } = useDelete(
    deleteCita,
    getCitasRequest,
    setCitas
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Gestión de citas</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar cita..." />
            <input type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} className="px-4 py-2 border border-cyan-400 rounded-lg mt-2" />
          </div>
          <button onClick={() => setMostrarFormulario(true)} className="bg-cyan-600 text-white px-5 py-2 rounded-lg">
            + Nueva Cita
          </button>
        </div>
      </div>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Crear Nueva Cita</h2>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-400">✕</button>
          </div>
          <FormularioCita onSubmit={handleCreateCita} cita={null} />
        </div>
      )}

      {/* Formulario de edición */}
      {showEditForm && citaSeleccionada && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Editar Cita</h2>
            <button onClick={() => { setShowEditForm(false); setCitaSeleccionada(null); }} className="text-gray-400">✕</button>
          </div>
          <FormularioCita onSubmit={handleUpdateCita} cita={citaSeleccionada} />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {citas.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-500">No hay citas registradas</p></div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center py-16"><p className="text-gray-500">No se encontraron resultados</p></div>
        ) : (
          <DataTable
            columns={[
              { header: "Fecha", accessor: "fecha", render: (cita) => new Date(cita.fecha).toLocaleDateString() },
              { header: "Hora", accessor: "horaInicio" },
              { header: "Doctor", accessor: "doctorId", render: (cita) => cita.doctorId?.username },
              { header: "Mascota", accessor: "pacienteId", render: (cita) => cita.pacienteId?.nombre },
              { header: "Estado", accessor: "estado" }
            ]}
            data={citasFiltradas}
            onRowClick={(cita) => navigate(`/citas/${cita._id}`)}
            onEdit={(cita) => { setCitaSeleccionada(cita); setShowEditForm(true); }}
            onDelete={(cita) => handleDeleteCita(cita._id)}
          />
        )}
      </div>
    </div>
  );
}

export default CitasPage;