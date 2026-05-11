import React from "react";
import { useState, useEffect } from "react";
import { toast, Toaster } from 'sonner';
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { useAuth } from "../../hooks/useAuth"; // ← IMPORTAR useAuth
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { 
  createCita,
  updateCita,
  deleteCita,
  getCitasRequest,
  getCitasByDoctorRequest  // ← IMPORTAR NUEVA FUNCIÓN
} from "/src/api/cita";
import { DataTable } from "../../components/DataTable";
import { FormularioCita } from "../../components/forms/FormularioCita";
import { useDelete } from "../../hooks/useDelete";

function CitasPage() {
  const { user } = useAuth(); // ← OBTENER USUARIO LOGUEADO
  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const navigate = useNavigate();

  // Función para mostrar fecha sin conversión de zona horaria
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const handleCreateCita = async (data) => {
    try {
      await createCita(data);
      setMostrarFormulario(false);
      await cargarCitas(); // ← USAR FUNCIÓN CENTRALIZADA
      
      toast.success('✅ Cita creada exitosamente', {
        description: `${data.tipoCita} - ${data.fecha} a las ${data.horaInicio}`,
        duration: 3000,
      });
      
    } catch (error) {
      toast.error('❌ Error al crear la cita');
      manejarErrorResponse(error, setErrors);
    }
  };

  const handleUpdateCita = async (data) => {
    console.log("🔄 handleUpdateCita RECIBIÓ:", data);
    try {
      await updateCita(citaSeleccionada._id, data);
      await cargarCitas(); // ← USAR FUNCIÓN CENTRALIZADA
      
      toast.success('✅ Cita actualizada exitosamente', {
        description: `Datos generales actualizados`,
        duration: 3000,
      });
      
      setShowEditForm(false);
      setCitaSeleccionada(null);
    } catch (error) {
      console.error("❌ ERROR:", error);
      toast.error('❌ Error al actualizar la cita');
      manejarErrorResponse(error, setErrors);
    }
  };

  // ✅ FUNCIÓN CENTRALIZADA PARA CARGAR CITAS SEGÚN EL ROL
  const cargarCitas = async () => {
    try {
      let response;
      
      // Si es doctor, cargar solo sus citas
      if (user?.role === 'doctor') {
        const doctorId = user._id || user.id;
        console.log("👨‍⚕️ Cargando citas para doctor:", doctorId);
        response = await getCitasByDoctorRequest(doctorId);
      } else {
        // Admin o usuario normal, cargar todas las citas
        console.log("👑 Cargando todas las citas");
        response = await getCitasRequest();
      }
      
      const citasOrdenadas = response.data.sort((a, b) => 
        new Date(b.fecha) - new Date(a.fecha)
      );
      setCitas(citasOrdenadas);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      manejarErrorResponse(error, setErrors);
    }
  };

  useEffect(() => {
    if (user) {
      cargarCitas();
    }
  }, [user]); // ← Recargar cuando cambie el usuario

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
    cargarCitas, // ← USAR FUNCIÓN CENTRALIZADA
    setCitas,
    {
      onSuccess: () => toast.success('🗑️ Cita eliminada exitosamente'),
      onError: () => toast.error('❌ Error al eliminar la cita')
    }
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          {user?.role === 'doctor' ? '📅 Mis Citas' : '📋 Gestión de citas'}
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchBar value={busqueda} onChange={setBusqueda} placeholder="Buscar cita..." />
            <input 
              type="date" 
              value={fechaFiltro} 
              onChange={(e) => setFechaFiltro(e.target.value)} 
              className="px-4 py-2 border border-cyan-400 rounded-lg mt-2" 
            />
          </div>
          {/* Mostrar botón "Nueva Cita" solo para admin, no para doctores */}
          {user?.role !== 'doctor' && (
            <button 
              onClick={() => setMostrarFormulario(true)} 
              className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition"
            >
              + Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* Formulario de creación - solo para admin */}
      {mostrarFormulario && user?.role !== 'doctor' && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Crear Nueva Cita</h2>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <FormularioCita onSubmit={handleCreateCita} cita={null} isEdit={false} />
        </div>
      )}

      {/* Formulario de edición - solo para admin */}
      {showEditForm && citaSeleccionada && user?.role !== 'doctor' && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Editar Cita</h2>
            <button onClick={() => { setShowEditForm(false); setCitaSeleccionada(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <FormularioCita onSubmit={handleUpdateCita} cita={citaSeleccionada} isEdit={true} />
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {citas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay citas registradas</p>
          </div>
        ) : citasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No se encontraron resultados</p>
          </div>
        ) : (
          <DataTable
            columns={[
              { header: "Fecha", accessor: "fecha", render: (cita) => mostrarFechaLocal(cita.fecha) },
              { header: "Hora", accessor: "horaInicio" },
              { header: "Doctor", accessor: "doctorId", render: (cita) => cita.doctorId?.username },
              { header: "Mascota", accessor: "pacienteId", render: (cita) => cita.pacienteId?.nombre },
              { header: "Estado", accessor: "estado" }
            ]}
            data={citasFiltradas}
            onRowClick={(cita) => navigate(`/citas/${cita._id}`)}
            onEdit={(cita) => { 
              if (user?.role !== 'doctor') {
                setCitaSeleccionada(cita); 
                setShowEditForm(true);
              }
            }}
            onDelete={(cita) => {
              if (user?.role !== 'doctor') {
                handleDeleteCita(cita._id);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CitasPage;