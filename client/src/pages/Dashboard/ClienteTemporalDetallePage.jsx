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
  const [formData, setFormData] = useState({}); // Estado para el formulario

  // Función para mostrar fecha local CORREGIDA
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const fechaPartes = fechaISO.split('T')[0].split('-');
    const year = fechaPartes[0];
    const month = fechaPartes[1];
    const day = fechaPartes[2];
    return `${day}/${month}/${year}`;
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const clienteRes = await getClienteTemporalByIdRequest(id);
      setCliente(clienteRes.data);
      // Inicializar formData con los datos del cliente
      setFormData({
        lastname: clienteRes.data?.lastname || '',
        cedula: clienteRes.data?.cedula || '',
        direccion: clienteRes.data?.direccion || '',
        email: clienteRes.data?.email || '',
      });
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

  // Función para manejar cambios en el formulario
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    setErrors(prev => prev.filter(err => err.field !== field));
  };

  // Función para completar registro - SOLO se ejecuta al hacer clic en el botón del modal
  const handleSubmitCompletar = async () => {
    // Validar campos requeridos
    const nuevosErrores = [];
    
    if (!formData.lastname) nuevosErrores.push({ field: 'lastname', message: 'El apellido es requerido' });
    if (!formData.cedula) nuevosErrores.push({ field: 'cedula', message: 'La cédula es requerida' });
    if (!formData.direccion) nuevosErrores.push({ field: 'direccion', message: 'La dirección es requerida' });
    if (!formData.email) nuevosErrores.push({ field: 'email', message: 'El email es requerido' });
    
    // Validar formato de email
    if (formData.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      nuevosErrores.push({ field: 'email', message: 'Ingrese un email válido' });
    }
    
    if (nuevosErrores.length > 0) {
      setErrors(nuevosErrores);
      toast.error("❌ Complete todos los campos requeridos");
      return;
    }
    
    setSubmitting(true);
    setErrors([]);
    
    try {
      const response = await completarRegistroClienteTemporalRequest(id, formData);
      
      toast.success("✅ ¡Registro completado! Se ha enviado un correo con las credenciales de acceso", {
        duration: 5000,
        position: "top-right"
      });
      
      setMostrarModalCompletar(false);
      await cargarDatos(); // Recargar datos
      
    } catch (error) {
      console.error("Error al completar registro:", error);
      
      if (error.response?.data?.message) {
        const mensaje = error.response.data.message;
        const field = error.response.data.field;
        
        if (mensaje.includes('email') || field === 'email') {
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
        }
      } else {
        toast.error("❌ Error al completar registro. Intente nuevamente");
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

          {cliente.estado !== 'completo' && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setMostrarModalCompletar(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                + Completar Registro
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal personalizado SIN DynamicForm automático */}
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
          
          {/* Formulario manual en lugar de DynamicForm */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={formData.lastname || ''}
                onChange={(e) => handleFormChange('lastname', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${errors.find(e => e.field === 'lastname') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Ej: Pérez Gómez"
              />
              {errors.find(e => e.field === 'lastname') && (
                <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'lastname')?.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cédula *
              </label>
              <input
                type="text"
                value={formData.cedula || ''}
                onChange={(e) => handleFormChange('cedula', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${errors.find(e => e.field === 'cedula') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="000000000"
              />
              {errors.find(e => e.field === 'cedula') && (
                <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'cedula')?.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={formData.direccion || ''}
                onChange={(e) => handleFormChange('direccion', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${errors.find(e => e.field === 'direccion') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="San José, Costa Rica"
              />
              {errors.find(e => e.field === 'direccion') && (
                <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'direccion')?.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico *
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleFormChange('email', e.target.value)}
                className={`w-full border rounded-md px-3 py-2 ${errors.find(e => e.field === 'email') ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="cliente@ejemplo.com"
              />
              {errors.find(e => e.field === 'email') && (
                <p className="text-red-500 text-xs mt-1">{errors.find(e => e.field === 'email')?.message}</p>
              )}
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setMostrarModalCompletar(false);
                  setErrors([]);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400 transition font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmitCompletar}
                disabled={submitting}
                className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                {submitting ? "Guardando..." : "Completar Registro"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ClienteTemporalDetallePage;