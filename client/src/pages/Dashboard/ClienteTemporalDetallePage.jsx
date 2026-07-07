import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import { DynamicForm } from "../../components/DynamicForm";
import { InfoCard } from "../../components/desCard";
import { createConfig } from "../config/createConfig";
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

  // funcion para mostrar fecha local
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
    } catch (error) {
      console.error("Error cargando datos:", error);
      setErrors(['Error al cargar los datos del cliente']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      cargarDatos();
    }
  }, [id]);

  const handleSubmitCompletar = async (data) => {
    setSubmitting(true);
    setErrors([]);
    
    try {
      // transformar datos para enviar al backend
      const dataToSend = {
        lastname: data.lastname.trim(),
        cedula: data.cedula.trim(),
        direccion: data.direccion.trim(),
        email: data.email.toLowerCase().trim(),
        raza: data.raza || '',
        edad: data.edad ? parseInt(data.edad) : null,
        sexo: data.sexo || '',
        colorPelaje: data.colorPelaje || '',
        peso: data.peso ? parseFloat(data.peso) : null,
        temperatura: data.temperatura ? parseFloat(data.temperatura) : null,
        antecedentesMedicos: data.antecedentesMedicos || ''
      };
      
      await completarRegistroClienteTemporalRequest(id, dataToSend);
      
      toast.success("Registro completado. Se ha enviado un correo con las credenciales de acceso", {
        duration: 5000,
        position: "top-right"
      });
      
      setMostrarModalCompletar(false);
      await cargarDatos();
      
    } catch (error) {
      console.error("Error al completar registro:", error);
      
      if (error.response?.data?.message) {
        const mensaje = error.response.data.message;
        setErrors([mensaje]);
        toast.error(mensaje);
      } else {
        const mensajeError = 'Error al completar registro. Intente nuevamente.';
        setErrors([mensajeError]);
        toast.error(mensajeError);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // construir data para InfoCard unificada con todos los datos
  const getDatosUnificados = () => {
    if (!cliente) return [];
    
    const datos = [
      { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname || ''}` },
      { label: "Cédula", value: cliente.cedula || 'No registrada' },
      { label: "Teléfono", value: cliente.phoneNumber },
      { label: "Email", value: cliente.email || 'No registrado' },
      { label: "Estado", value: cliente.estado === 'temporal' ? 'Pendiente de registro' : 'Registro completado' },
      { label: "Fecha de registro", value: mostrarFechaLocal(cliente.createdAt) },
    ];
    
    // agregar direccion si existe
    if (cliente.direccion) {
      datos.push({ label: "Dirección", value: cliente.direccion });
    }
    
    // agregar citas agendadas de forma detallada
    if (cliente.citasTemporales && cliente.citasTemporales.length > 0) {
      // agregar un separador visual
      datos.push({ 
        label: "─".repeat(40), 
        value: "", 
        isSeparator: true 
      });
      
      // agregar titulo de citas
      datos.push({ 
        label: `📋 Citas Agendadas (${cliente.citasTemporales.length})`, 
        value: "", 
        isTitle: true 
      });
      
      // agregar cada cita con sus detalles
      cliente.citasTemporales.forEach((cita, index) => {
        const tipo = cita.tipoCita === 'consulta' ? 'Consulta' : 'Estética';
        const mascota = cita.pacienteTemporal?.nombre || 'No especificada';
        const especie = cita.pacienteTemporal?.especie || 'No especificada';
        const fecha = mostrarFechaLocal(cita.fecha);
        const horario = `${cita.horaInicio} - ${cita.horaFin}`;
        const sintomas = cita.sintomas || 'No registrados';
        const tiempoSintomas = cita.tiempoSintomas || 'No registrado';
        const notas = cita.notas || 'Sin notas';
        
        // separador entre citas
        if (index > 0) {
          datos.push({ 
            label: "─".repeat(30), 
            value: "", 
            isSeparator: true 
          });
        }
        
        datos.push({ 
          label: `Cita ${index + 1}: ${tipo}`, 
          value: "", 
          isSubtitle: true 
        });
        datos.push({ label: "  • Fecha", value: fecha });
        datos.push({ label: "  • Horario", value: horario });
        datos.push({ label: "  • Mascota", value: mascota });
        datos.push({ label: "  • Especie", value: especie });
        datos.push({ label: "  • Síntomas", value: sintomas });
        datos.push({ label: "  • Tiempo de síntomas", value: tiempoSintomas });
        datos.push({ label: "  • Notas", value: notas });
      });
    } else {
      datos.push({ 
        label: "─".repeat(40), 
        value: "", 
        isSeparator: true 
      });
      datos.push({ label: "📋 Citas Agendadas", value: "No hay citas agendadas" });
    }
    
    return datos;
  };

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 max-w-full">
      <Toaster position="top-right" richColors closeButton duration={3000} />
      
      <button
        onClick={() => navigate('/dashboard/clientes-temporales')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition text-sm md:text-base"
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
            className="mt-4 text-cyan-600 hover:text-cyan-700 text-sm md:text-base"
          >
            Volver a la lista
          </button>
        </div>
      )}

      {!loading && cliente && (
        <>
          {/* header con titulo y boton */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Información del Cliente Temporal</h2>
            {cliente.estado !== 'completo' && (
              <button
                type="button"
                onClick={() => {
                  setMostrarModalCompletar(true);
                  setErrors([]);
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
              >
                Completar Registro
              </button>
            )}
          </div>

          {/* card unificada con toda la informacion */}
          <InfoCard
            title=""
            data={getDatosUnificados()}
          />
        </>
      )}

      {/* modal para completar registro usando DynamicForm */}
      <Modal
        isOpen={mostrarModalCompletar}
        onClose={() => {
          setMostrarModalCompletar(false);
          setErrors([]);
        }}
        title="Completar Registro de Cliente"
        size="lg"
      >
        <div className="bg-white p-6 rounded-lg max-h-[70vh] overflow-y-auto">
          <DynamicForm
            {...createConfig.completarRegistroCliente}
            onSubmit={handleSubmitCompletar}
            errors={errors}
            successMessage={successMessage}
            submitLabel={submitting ? 'Guardando...' : 'Completar Registro'}
            disabled={submitting}
          />
        </div>
      </Modal>
    </div>
  );
}

export default ClienteTemporalDetallePage;