import React from "react";
import { useState, useEffect } from "react";
import { toast, Toaster } from 'sonner';
import { SearchBar } from "../../components/SearchBar";
import { useNavigate } from 'react-router';
import { useAuth } from "../../hooks/useAuth";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { 
  createCita,
  updateCita,
  deleteCita,
  getCitasRequest,
  getCitasByDoctorRequest,
  getCitasByPacienteRequest
} from "/src/api/cita";
import { getPacienteByOwnerRequest } from "/src/api/pacientes";
import { DataTable } from "../../components/DataTable";
import { FormularioCita } from "../../components/forms/FormularioCita";
import { useDelete } from "../../hooks/useDelete";

function CitasPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [errors, setErrors] = useState([]);
  const [fechaFiltro, setFechaFiltro] = useState("");
  const [showEditForm, setShowEditForm] = useState(false);
  const [mascotasCliente, setMascotasCliente] = useState([]);
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const isDoctor = user?.role === 'doctor';
  const isClient = user?.role === 'client';

  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  const cargarMascotasCliente = async () => {
    if (isClient && user?._id) {
      try {
        const res = await getPacienteByOwnerRequest(user._id);
        setMascotasCliente(res.data);
        console.log("🐾 Mascotas del cliente:", res.data);
      } catch (error) {
        console.error("Error cargando mascotas del cliente:", error);
      }
    }
  };

  const handleCreateCita = async (data) => {
    try {
      await createCita(data);
      setMostrarFormulario(false);
      await cargarCitas();
      
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
    try {
      await updateCita(citaSeleccionada._id, data);
      await cargarCitas();
      
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

  const cargarCitas = async () => {
    try {
      let response;
      
      if (isDoctor && user?._id) {
        const doctorId = user._id;
        response = await getCitasByDoctorRequest(doctorId);
      } 
      else if (isClient && user?._id) {
        const mascotasRes = await getPacienteByOwnerRequest(user._id);
        const mascotas = mascotasRes.data;
        
        let todasLasCitas = [];
        for (const mascota of mascotas) {
          const citasRes = await getCitasByPacienteRequest(mascota._id);
          todasLasCitas = [...todasLasCitas, ...citasRes.data];
        }
        todasLasCitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        response = { data: todasLasCitas };
      } 
      else {
        response = await getCitasRequest();
      }
      
      setCitas(response.data || []);
    } catch (error) {
      console.error("❌ Error cargando citas:", error);
      manejarErrorResponse(error, setErrors);
    }
  };

  useEffect(() => {
    if (user && user._id) {
      cargarCitas();
      if (isClient) {
        cargarMascotasCliente();
      }
    }
  }, [user]);

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
    cargarCitas,
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
          {isDoctor && '📅 Mis Citas'}
          {isClient && '📅 Mis Citas'}
          {isAdmin && '📋 Gestión de citas'}
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
          {/* ✅ AHORA DOCTOR TAMBIÉN PUEDE CREAR CITAS */}
          {(isAdmin || isDoctor || isClient) && (
            <button 
              onClick={() => setMostrarFormulario(true)} 
              className="bg-cyan-600 text-white px-5 py-2 rounded-lg hover:bg-cyan-700 transition"
            >
              + Nueva Cita
            </button>
          )}
        </div>
      </div>

      {/* ✅ Formulario de creación - disponible para admin, doctor y cliente */}
      {mostrarFormulario && (isAdmin || isDoctor || isClient) && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Crear Nueva Cita</h2>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <FormularioCita 
            onSubmit={handleCreateCita} 
            cita={null} 
            isEdit={false}
            datosPrecargados={isClient && user?._id ? {
              duenoId: user._id,
              correo: user.email,
              duenoNombre: `${user.username || ''} ${user.lastname || ''}`,
              mascotas: mascotasCliente
            } : null}
          />
        </div>
      )}

      {/* Formulario de edición - solo para admin */}
      {showEditForm && citaSeleccionada && isAdmin && (
        <div className="bg-white p-4 rounded-xl shadow-lg mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Editar Cita</h2>
            <button onClick={() => { setShowEditForm(false); setCitaSeleccionada(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <FormularioCita onSubmit={handleUpdateCita} cita={citaSeleccionada} isEdit={true} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        {citas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No hay citas registradas</p>
            {isClient && (
              <p className="text-gray-400 mt-2">Haz clic en "+ Nueva Cita" para agendar tu primera cita</p>
            )}
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
            onEdit={isAdmin ? (cita) => { 
              setCitaSeleccionada(cita); 
              setShowEditForm(true);
            } : undefined}
            onDelete={isAdmin ? (cita) => {
              handleDeleteCita(cita._id);
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}

export default CitasPage;