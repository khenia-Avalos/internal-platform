import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [mostrarModalCompletar, setMostrarModalCompletar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Datos del cliente
    lastname: '',
    cedula: '',
    direccion: '',
    email: '',
    // Datos de la mascota
    raza: '',
    edad: '',
    sexo: '',
    colorPelaje: '',
    peso: '',
    temperatura: '',
    antecedentesMedicos: ''
  });

  // Funcion para mostrar fecha local
  const mostrarFechaLocal = (fechaISO) => {
    if (!fechaISO) return 'No especificada';
    const fechaPartes = fechaISO.split('T')[0].split('-');
    const year = fechaPartes[0];
    const month = fechaPartes[1];
    const day = fechaPartes[2];
    return `${day}/${month}/${year}`;
  };

  // Validaciones
  const validarEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const validarCedula = (cedula) => {
    return /^\d{6,12}$/.test(cedula);
  };

  const validarPeso = (peso) => {
    if (!peso) return true;
    return /^\d+(\.\d{1,2})?$/.test(peso);
  };

  const validarTemperatura = (temp) => {
    if (!temp) return true;
    return /^\d+(\.\d{1,1})?$/.test(temp);
  };

  const validarEdad = (edad) => {
    if (!edad) return true;
    const num = parseInt(edad);
    return !isNaN(num) && num >= 0 && num <= 50;
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const clienteRes = await getClienteTemporalByIdRequest(id);
      setCliente(clienteRes.data);
      setFormData({
        lastname: clienteRes.data?.lastname || '',
        cedula: clienteRes.data?.cedula || '',
        direccion: clienteRes.data?.direccion || '',
        email: clienteRes.data?.email || '',
        raza: '',
        edad: '',
        sexo: '',
        colorPelaje: '',
        peso: '',
        temperatura: '',
        antecedentesMedicos: ''
      });
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

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
    setErrors([]);
  };

  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
    const errorClass = fieldErrors[fieldName] ? "border-red-500 focus:ring-red-500" : "border-cyan-400 focus:border-cyan-500";
    return `${baseClass} ${errorClass}`;
  };

  const handleSubmitCompletar = async () => {
    setErrors([]);
    setFieldErrors({});
    
    const nuevosErrores = [];
    const nuevosFieldErrors = {};
    
    // VALIDACIONES DEL CLIENTE
    
    // Validar apellido
    if (!formData.lastname || formData.lastname.trim() === '') {
      nuevosErrores.push('El apellido es requerido');
      nuevosFieldErrors.lastname = 'El apellido es requerido';
    }
    
    // Validar cédula
    if (!formData.cedula || formData.cedula.trim() === '') {
      nuevosErrores.push('La cédula es requerida');
      nuevosFieldErrors.cedula = 'La cédula es requerida';
    } else if (!validarCedula(formData.cedula)) {
      nuevosErrores.push('La cédula debe contener solo números (6-12 dígitos)');
      nuevosFieldErrors.cedula = 'La cédula debe tener 6-12 dígitos numéricos';
    }
    
    // Validar dirección
    if (!formData.direccion || formData.direccion.trim() === '') {
      nuevosErrores.push('La dirección es requerida');
      nuevosFieldErrors.direccion = 'La dirección es requerida';
    }
    
    // Validar email
    if (!formData.email || formData.email.trim() === '') {
      nuevosErrores.push('El correo electrónico es requerido');
      nuevosFieldErrors.email = 'El correo electrónico es requerido';
    } else if (!validarEmail(formData.email)) {
      nuevosErrores.push('Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)');
      nuevosFieldErrors.email = 'Formato de email inválido';
    }
    
    // VALIDACIONES DE LA MASCOTA
    
    // Validar raza (opcional)
    if (formData.raza && formData.raza.length > 50) {
      nuevosErrores.push('La raza no puede tener más de 50 caracteres');
      nuevosFieldErrors.raza = 'Máximo 50 caracteres';
    }
    
    // Validar edad
    if (formData.edad && !validarEdad(formData.edad)) {
      nuevosErrores.push('Ingrese una edad válida (0-50 años)');
      nuevosFieldErrors.edad = 'Edad inválida (0-50 años)';
    }
    
    // Validar sexo
    const sexosValidos = ['macho', 'hembra', 'Macho', 'Hembra', 'M', 'H'];
    if (formData.sexo && !sexosValidos.includes(formData.sexo)) {
      nuevosErrores.push('El sexo debe ser Macho o Hembra');
      nuevosFieldErrors.sexo = 'Seleccione Macho o Hembra';
    }
    
    // Validar peso
    if (formData.peso && !validarPeso(formData.peso)) {
      nuevosErrores.push('Ingrese un peso válido (ejemplo: 8.5)');
      nuevosFieldErrors.peso = 'Formato de peso inválido';
    }
    
    // Validar temperatura
    if (formData.temperatura && !validarTemperatura(formData.temperatura)) {
      nuevosErrores.push('Ingrese una temperatura válida (ejemplo: 38.5)');
      nuevosFieldErrors.temperatura = 'Formato de temperatura inválido';
    }
    
    if (nuevosErrores.length > 0) {
      setErrors(nuevosErrores);
      setFieldErrors(nuevosFieldErrors);
      
      const primerCampoError = Object.keys(nuevosFieldErrors)[0];
      if (primerCampoError) {
        const inputElement = document.querySelector(`[name="${primerCampoError}"]`);
        if (inputElement) {
          inputElement.focus();
          inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      const dataToSend = {
        // Datos del cliente
        lastname: formData.lastname.trim(),
        cedula: formData.cedula.trim(),
        direccion: formData.direccion.trim(),
        email: formData.email.toLowerCase().trim(),
        // Datos de la mascota
        raza: formData.raza || '',
        edad: formData.edad ? parseInt(formData.edad) : null,
        sexo: formData.sexo || '',
        colorPelaje: formData.colorPelaje || '',
        peso: formData.peso ? parseFloat(formData.peso) : null,
        temperatura: formData.temperatura ? parseFloat(formData.temperatura) : null,
        antecedentesMedicos: formData.antecedentesMedicos || ''
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
        const field = error.response.data.field;
        
        if (field) {
          setFieldErrors({ [field]: mensaje });
          setErrors([mensaje]);
          toast.error(mensaje);
        } else {
          setErrors([mensaje]);
          toast.error(mensaje);
        }
      } else {
        const mensajeError = 'Error al completar registro. Intente nuevamente.';
        setErrors([mensajeError]);
        toast.error(mensajeError);
      }
    } finally {
      setSubmitting(false);
    }
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
          {/* Seccion: Informacion del Cliente Temporal con boton a la derecha */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Información del Cliente Temporal</h2>
            {cliente.estado !== 'completo' && (
              <button
                type="button"
                onClick={() => {
                  setMostrarModalCompletar(true);
                  setErrors([]);
                  setFieldErrors({});
                }}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium text-sm"
              >
                Completar Registro
              </button>
            )}
          </div>

          <InfoCard
            title=""
            data={[
              { label: "Nombre completo", value: `${cliente.username} ${cliente.lastname || ''}` },
              { label: "Cédula", value: cliente.cedula || 'No registrada' },
              { label: "Teléfono", value: cliente.phoneNumber },
              { label: "Email", value: cliente.email || 'No registrado' },
              { label: "Estado", value: cliente.estado === 'temporal' ? 'Pendiente de registro' : 'Registro completado' },
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

          {/* Seccion: Citas Agendadas */}
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Citas Agendadas</h3>
            {cliente.citasTemporales && cliente.citasTemporales.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cliente.citasTemporales.map((cita, index) => (
                  <InfoCard
                    key={index}
                    title={`Cita ${index + 1} - ${cita.tipoCita === 'consulta' ? 'Consulta' : 'Estética'}`}
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
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-500">No hay citas agendadas</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal con todos los campos para completar registro */}
      <Modal
        isOpen={mostrarModalCompletar}
        onClose={() => {
          setMostrarModalCompletar(false);
          setErrors([]);
          setFieldErrors({});
        }}
        title="Completar Registro de Cliente"
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitCompletar(); }} className="space-y-4 bg-white p-6 rounded-lg max-h-[70vh] overflow-y-auto">
          <div className="bg-cyan-50 p-3 rounded-lg mb-4 border border-cyan-200">
            <p className="text-sm text-cyan-700">
              Complete los datos faltantes. Los campos marcados con * son obligatorios.
            </p>
          </div>

          {/* Errores generales */}
          {errors.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
              {errors.map((err, i) => (
                <p key={i} className="text-sm">{err}</p>
              ))}
            </div>
          )}

          {/* SECCION: DATOS DEL CLIENTE */}
          <div className="border-b border-gray-200 pb-2 mb-2">
            <h3 className="text-md font-semibold text-gray-700">Datos del Cliente</h3>
          </div>

          {/* Apellido */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido *
              {fieldErrors.lastname && <span className="text-red-500 ml-2 text-xs">{fieldErrors.lastname}</span>}
            </label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname || ''}
              onChange={(e) => handleFormChange('lastname', e.target.value)}
              className={getInputClass('lastname')}
              placeholder="Ej: Pérez Gómez"
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
              {fieldErrors.cedula && <span className="text-red-500 ml-2 text-xs">{fieldErrors.cedula}</span>}
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula || ''}
              onChange={(e) => handleFormChange('cedula', e.target.value)}
              className={getInputClass('cedula')}
              placeholder="000000000"
            />
            <p className="text-xs text-gray-400 mt-1">Solo números, 6-12 dígitos</p>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección *
              {fieldErrors.direccion && <span className="text-red-500 ml-2 text-xs">{fieldErrors.direccion}</span>}
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion || ''}
              onChange={(e) => handleFormChange('direccion', e.target.value)}
              className={getInputClass('direccion')}
              placeholder="San José, Costa Rica"
            />
          </div>

          {/* Correo electrónico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico *
              {fieldErrors.email && <span className="text-red-500 ml-2 text-xs">{fieldErrors.email}</span>}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email || ''}
              onChange={(e) => handleFormChange('email', e.target.value)}
              className={getInputClass('email')}
              placeholder="cliente@ejemplo.com"
            />
            <p className="text-xs text-gray-400 mt-1">
              Se enviará un correo con las credenciales de acceso
            </p>
          </div>

          {/* SECCION: DATOS DE LA MASCOTA */}
          <div className="border-b border-gray-200 pb-2 mt-4 mb-2">
            <h3 className="text-md font-semibold text-gray-700">Datos de la Mascota</h3>
            <p className="text-xs text-gray-400">Completa la información de tu mascota</p>
          </div>

          {/* Raza */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raza
              {fieldErrors.raza && <span className="text-red-500 ml-2 text-xs">{fieldErrors.raza}</span>}
            </label>
            <input
              type="text"
              name="raza"
              value={formData.raza || ''}
              onChange={(e) => handleFormChange('raza', e.target.value)}
              className={getInputClass('raza')}
              placeholder="Ej: Golden Retriever, Pastor Alemán"
            />
          </div>

          {/* Edad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Edad (años)
              {fieldErrors.edad && <span className="text-red-500 ml-2 text-xs">{fieldErrors.edad}</span>}
            </label>
            <input
              type="number"
              name="edad"
              value={formData.edad || ''}
              onChange={(e) => handleFormChange('edad', e.target.value)}
              className={getInputClass('edad')}
              placeholder="Ej: 3"
              min="0"
              max="50"
              step="1"
            />
          </div>

          {/* Sexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo
              {fieldErrors.sexo && <span className="text-red-500 ml-2 text-xs">{fieldErrors.sexo}</span>}
            </label>
            <select
              name="sexo"
              value={formData.sexo || ''}
              onChange={(e) => handleFormChange('sexo', e.target.value)}
              className={getInputClass('sexo')}
            >
              <option value="">Seleccione el sexo</option>
              <option value="macho">Macho</option>
              <option value="hembra">Hembra</option>
            </select>
          </div>

          {/* Color de Pelaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color de Pelaje
              {fieldErrors.colorPelaje && <span className="text-red-500 ml-2 text-xs">{fieldErrors.colorPelaje}</span>}
            </label>
            <input
              type="text"
              name="colorPelaje"
              value={formData.colorPelaje || ''}
              onChange={(e) => handleFormChange('colorPelaje', e.target.value)}
              className={getInputClass('colorPelaje')}
              placeholder="Ej: Blanco, Negro, Café, Manchado"
            />
          </div>

          {/* Peso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Peso (kg)
              {fieldErrors.peso && <span className="text-red-500 ml-2 text-xs">{fieldErrors.peso}</span>}
            </label>
            <input
              type="number"
              name="peso"
              value={formData.peso || ''}
              onChange={(e) => handleFormChange('peso', e.target.value)}
              className={getInputClass('peso')}
              placeholder="Ej: 8.5"
              step="0.1"
              min="0"
              max="100"
            />
          </div>

          {/* Temperatura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperatura (°C)
              {fieldErrors.temperatura && <span className="text-red-500 ml-2 text-xs">{fieldErrors.temperatura}</span>}
            </label>
            <input
              type="number"
              name="temperatura"
              value={formData.temperatura || ''}
              onChange={(e) => handleFormChange('temperatura', e.target.value)}
              className={getInputClass('temperatura')}
              placeholder="Ej: 38.5"
              step="0.1"
              min="35"
              max="42"
            />
          </div>

          {/* Antecedentes Médicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Antecedentes Médicos
              {fieldErrors.antecedentesMedicos && <span className="text-red-500 ml-2 text-xs">{fieldErrors.antecedentesMedicos}</span>}
            </label>
            <textarea
              name="antecedentesMedicos"
              value={formData.antecedentesMedicos || ''}
              onChange={(e) => handleFormChange('antecedentesMedicos', e.target.value)}
              rows={3}
              className={getInputClass('antecedentesMedicos')}
              placeholder="Ej: Alergias, enfermedades previas, cirugías, medicamentos actuales..."
            />
            <p className="text-xs text-gray-400 mt-1">Información relevante sobre la salud de tu mascota</p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setMostrarModalCompletar(false);
                setErrors([]);
                setFieldErrors({});
              }}
              className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-400 transition font-medium text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-cyan-600 text-white py-2.5 rounded-md hover:bg-cyan-700 transition disabled:opacity-50 font-medium text-sm"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                "Completar Registro"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ClienteTemporalDetallePage;