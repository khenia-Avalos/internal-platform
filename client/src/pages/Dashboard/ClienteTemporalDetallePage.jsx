import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { createConfig } from "../config/createConfig";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { 
  getClienteTemporalByIdRequest, 
  completarRegistroClienteTemporalRequest 
} from "../../api/ClientesTemporales";
import { toast, Toaster } from 'sonner';

function ClienteTemporalDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [mostrarModalCompletar, setMostrarModalCompletar] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Función para mostrar fecha local CORREGIDA (usa UTC para evitar desfase)
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    
    // Crear fecha y usar UTC para evitar problemas de zona horaria
    const fecha = new Date(fechaISO);
    const day = fecha.getUTCDate();
    const month = fecha.getUTCMonth() + 1;
    const year = fecha.getUTCFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const clienteRes = await getClienteTemporalByIdRequest(id);
      setCliente(clienteRes.data);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  // ✅ Función para completar registro - SOLO se ejecuta desde el formulario del modal
  const handleCompletarRegistro = async (data) => {
    setSubmitting(true);
    setErrors([]);
    
    try {
      // Validar que los datos requeridos estén presentes
      if (!data.lastname) {
        toast.error("❌ El apellido es requerido");
        setErrors([{ field: 'lastname', message: 'El apellido es requerido' }]);
        setSubmitting(false);
        return;
      }
      if (!data.cedula) {
        toast.error("❌ La cédula es requerida");
        setErrors([{ field: 'cedula', message: 'La cédula es requerida' }]);
        setSubmitting(false);
        return;
      }
      if (!data.direccion) {
        toast.error("❌ La dirección es requerida");
        setErrors([{ field: 'direccion', message: 'La dirección es requerida' }]);
        setSubmitting(false);
        return;
      }
      if (!data.email) {
        toast.error("❌ El email es requerido");
        setErrors([{ field: 'email', message: 'El email es requerido' }]);
        setSubmitting(false);
        return;
      }
      
      // Enviar datos al backend
      const response = await completarRegistroClienteTemporalRequest(id, data);
      
      // Éxito
      toast.success("✅ ¡Registro completado! Se ha enviado un correo con las credenciales de acceso", {
        duration: 5000,
        position: "top-right"
      });
      
      setMostrarModalCompletar(false);
      await cargarDatos(); // Recargar datos para mostrar el nuevo estado
      
    } catch (error) {
      console.error("Error al completar registro:", error);
      
      // Manejo específico de errores del backend
      if (error.response?.data?.message) {
        const mensaje = error.response.data.message;
        const field = error.response.data.field;
        
        if (mensaje.includes('email') || mensaje.includes('Email') || field === 'email') {
          toast.error("❌ Este correo electrónico ya está registrado por otro usuario");
          setErrors([{ field: 'email', message: 'Este email ya está registrado' }]);
        } 
        else if (mensaje.includes('cédula') || mensaje.includes('cedula') || field === 'cedula') {
          toast.error("❌ Esta cédula ya está registrada por otro usuario");
          setErrors([{ field: 'cedula', message: 'Esta cédula ya está registrada' }]);
        }
        else if (mensaje.includes('completo')) {
          toast.warning("⚠️ Este cliente ya está registrado completamente");
          setMostrarModalCompletar(false);
        }
        else {
          toast.error(`❌ ${mensaje}`);
          manejarErrorResponse(error, setErrors, setSuccessMessage);
        }
      } else {
        toast.error("❌ Error al completar registro. Intente nuevamente");
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Toaster position="top-right" richColors closeButton duration={3000} />
      
      <button
        onClick={() => navigate('/dashboard/clientes-temporales')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Clientes Temporales
      </button>

      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      )}

      {!loading && !cliente && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cliente temporal no encontrado</p>
          <button
            onClick={() => navigate('/dashboard/clientes-temporales')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cliente && (
        <>
          <InfoCard
            title="Información del Cliente Temporal"
            data={[
              { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname || ''}` },
              { label: "Cédula", value: cliente.cedula || 'No registrada' },
              { label: "Teléfono", value: cliente.phoneNumber },
              { label: "Email", value: cliente.email || 'No registrado' },
              { label: "Estado", value: cliente.estado === 'temporal' ? '⏳ Pendiente de registro' : '✅ Registro completado' },
              { label: "Fecha de registro", value: mostrarFechaLocal(cliente.createdAt) },
            ]}
          />
          
          {/* Mostrar direccion solo si está completo */}
          {cliente.estado === 'completo' && cliente.direccion && (
            <div className="mt-4">
              <InfoCard
                title="Datos de Registro Completo"
                data={[
                  { label: "Dirección", value: cliente.direccion },
                ]}
              />
            </div>
          )}

          {/* Citas temporales */}
          <h3 className="text-xl font-semibold mb-4 mt-6">Citas Agendadas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cliente.citasTemporales && cliente.citasTemporales.length > 0 ? (
              cliente.citasTemporales.map((cita, index) => (
                <InfoCard
                  key={index}
                  title={`Cita ${index + 1} - ${cita.tipoCita === 'consulta' ? '🩺 Consulta' : '✂️ Estética'}`}
                  data={[
                    { label: "Fecha", value: mostrarFechaLocal(cita.fecha) },
                    { label: "Horario", value: `${cita.horaInicio} - ${cita.horaFin}` },
                    { label: "Mascota", value: cita.pacienteTemporal?.nombre || 'No especificada' },
                    { label: "Especie", value: cita.pacienteTemporal?.especie || 'No especificada' },
                    { label: "Síntomas", value: cita.sintomas || 'No registrados' },
                    { label: "Tiempo de síntomas", value: cita.tiempoSintomas || 'No registrado' },
                    { label: "Notas", value: cita.notas || 'Sin notas' },
                  ]}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No hay citas agendadas</p>
              </div>
            )}
          </div>

          {/* ✅ Botón para completar registro - SOLO abre el modal, NO guarda */}
          {cliente.estado !== 'completo' && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMostrarModalCompletar(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                + Completar Registro
              </button>
            </div>
          )}
        </>
      )}

      {/* ✅ Modal para completar registro - El formulario dentro es el que guarda */}
      <Modal
        isOpen={mostrarModalCompletar}
        onClose={() => {
          setMostrarModalCompletar(false);
          setErrors([]);
        }}
        title="Completar Registro de Cliente"
        size="lg"
      >
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Complete los datos faltantes para que el cliente pueda iniciar sesión en el sistema.
          </p>
          <DynamicForm
            {...createConfig.completarRegistroCliente}
            layout="grid"
            defaultValues={{
              lastname: cliente?.lastname || '',
              cedula: cliente?.cedula || '',
              direccion: cliente?.direccion || '',
              email: cliente?.email || '',
            }}
            onSubmit={handleCompletarRegistro}
            errors={errors}
            isSubmitting={submitting}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ClienteTemporalDetallePage;