import { useParams, useNavigate, Link } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { getClienteByIdRequest } from "/src/api/clientes";
import { getPacienteByOwnerRequest } from "/src/api/pacientes";
import { createPacienteRequest } from "/src/api/pacientes";
import { getCitasByPacienteRequest } from "/src/api/cita";
import { DataTable } from "../../components/DataTable";
import { useNavigate as useNavigateRouter } from 'react-router';

function ClienteDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [citas, setCitas] = useState([]);
  const [citasLoading, setCitasLoading] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState("");

  // Función para cargar todas las citas de las mascotas del cliente
  const cargarCitasCliente = async () => {
    if (!id) return;
    
    setCitasLoading(true);
    try {
      // Obtener todas las mascotas del cliente
      const mascotasRes = await getPacienteByOwnerRequest(id);
      const mascotasData = mascotasRes.data;
      
      let todasLasCitas = [];
      
      // Para cada mascota, obtener sus citas
      for (const mascota of mascotasData) {
        try {
          const citasRes = await getCitasByPacienteRequest(mascota._id);
          // Agregar el nombre de la mascota a cada cita para referencia
          const citasConMascota = citasRes.data.map(cita => ({
            ...cita,
            nombreMascota: mascota.nombre
          }));
          todasLasCitas = [...todasLasCitas, ...citasConMascota];
        } catch (error) {
          console.error(`Error cargando citas de mascota ${mascota.nombre}:`, error);
        }
      }
      
      // Ordenar por fecha descendente (más reciente primero)
      todasLasCitas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      setCitas(todasLasCitas);
    } catch (error) {
      console.error("Error cargando citas del cliente:", error);
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    } finally {
      setCitasLoading(false);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const clienteRes = await getClienteByIdRequest(id);
        setCliente(clienteRes.data);
        
        const mascotasRes = await getPacienteByOwnerRequest(id);
        setMascotas(mascotasRes.data);
        
        // Cargar citas después de obtener las mascotas
        await cargarCitasCliente();
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const handleSubmitMascota = async (data) => {
    try {
      await createPacienteRequest(data);
      setModalAbierto(false);
      
      // Recargar mascotas
      const mascotasRes = await getPacienteByOwnerRequest(id);
      setMascotas(mascotasRes.data);
      
      // Recargar citas
      await cargarCitasCliente();
      
      setSuccessMessage("Mascota creada exitosamente");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    }
  };

  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return '';
    const [year, month, day] = fechaISO.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  // Filtrar citas por fecha
  const citasFiltradas = citas.filter(cita => {
    if (!fechaFiltro) return true;
    const fechaCita = cita.fecha?.split('T')[0];
    return fechaCita === fechaFiltro;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/clientes')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver 
      </button>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !cliente && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cliente no encontrado</p>
          <button
            onClick={() => navigate('/clientes')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cliente && (
        <>
          <InfoCard
            title="Información del Cliente"
            data={[
              { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname}` },
              { label: "Email", value: cliente.email },
              { label: "Teléfono", value: cliente.phoneNumber },
              { label: "Cédula", value: cliente.cedula },
              { label: "Dirección", value: cliente.direccion },
            ]}
          />
          
          <div className="mt-4 mb-6">
            <button 
              onClick={() => {
                setErrors([]);
                setModalAbierto(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Agregar Mascota
            </button>
          </div>

          <h3 className="text-xl font-semibold mb-4">Mascotas de {cliente.username}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {mascotas.map((mascota) => (
              <InfoCard
                key={mascota._id}
                title={mascota.nombre}
                data={[
                  { label: "Especie", value: mascota.especie },
                  { label: "Raza", value: mascota.raza || 'Sin raza' },
                  { label: "Edad", value: mascota.edad ? `${mascota.edad} años` : 'No especificada' },
                ]}
              />
            ))}
          </div>

          {/* SECCIÓN DE CITAS */}
          <div className="mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-xl font-semibold">Historial de Citas</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Filtrar por fecha:</label>
                <input 
                  type="date" 
                  value={fechaFiltro} 
                  onChange={(e) => setFechaFiltro(e.target.value)} 
                  className="px-3 py-1.5 border border-cyan-400 rounded-lg text-sm"
                />
                {fechaFiltro && (
                  <button 
                    onClick={() => setFechaFiltro("")} 
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>

            {citasLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
              </div>
            ) : citas.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Este cliente no tiene citas registradas</p>
              </div>
            ) : citasFiltradas.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay citas para la fecha seleccionada</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
                <DataTable
                  columns={[
                    { header: "Fecha", accessor: "fecha", render: (cita) => mostrarFechaLocal(cita.fecha) },
                    { header: "Hora", accessor: "horaInicio" },
                    { header: "Mascota", accessor: "nombreMascota" },
                    { header: "Doctor", accessor: "doctorId", render: (cita) => cita.doctorId?.username || 'No asignado' },
                    { header: "Estado", accessor: "estado" }
                  ]}
                  data={citasFiltradas}
                  onRowClick={(cita) => navigate(`/citas/${cita._id}`)}
                />
              </div>
            )}
          </div>
        </>
      )}

      <Modal 
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Agregar Nueva Mascota"
      >
        <DynamicForm
          {...createConfig.registerPaciente}
          layout="grid"
          defaultValues={{ ownerId: id }}
          customProps={{ ownerOptions: [{ value: id, label: cliente?.username }] }}
          onSubmit={handleSubmitMascota}
          errors={errors}           
          successMessage={successMessage} 
        />
      </Modal>
    </div>
  );
}

export default ClienteDetallePage;