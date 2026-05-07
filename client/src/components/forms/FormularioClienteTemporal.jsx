import { useState, useEffect } from 'react';
import { getDoctoresRequest } from '../../api/doctores';
import { getHorariosDisponiblesRequest } from '../../api/cita';
import { createClienteTemporalRequest } from '../../api/ClientesTemporales';
import { toast } from 'sonner';

export const FormularioClienteTemporal = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [doctores, setDoctores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    phoneNumber: '',
    email: '',
    cedula: '',
    nombreMascota: '',
    especie: '',
    doctorId: '',
    fechaCita: '',
    tipoCita: 'consulta',
    sintomas: '',
    tiempoSintomas: '',
    notas: ''
  });
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);

  // Limpiar error de campo después de 3 segundos
  const limpiarErrorCampo = (campo) => {
    setTimeout(() => {
      setFieldErrors(prev => ({ ...prev, [campo]: null }));
    }, 3000);
  };

  // Cargar doctores filtrados (solo Medicina General y Groomer)
  useEffect(() => {
    const cargarDoctores = async () => {
      try {
        const res = await getDoctoresRequest();
        const doctoresFiltrados = res.data.filter(doctor => 
          doctor.especialidad === 'Medicina General' || 
          doctor.especialidad === 'Groomer'
        );
        setDoctores(doctoresFiltrados);
      } catch (error) {
        console.error('Error cargando doctores:', error);
        setErrors(['Error al cargar veterinarios']);
      }
    };
    cargarDoctores();
  }, []);

  // Cargar horarios cuando cambia doctor o fecha
  useEffect(() => {
    const cargarHorarios = async () => {
      if (formData.doctorId && formData.fechaCita) {
        setCargandoHorarios(true);
        try {
          const res = await getHorariosDisponiblesRequest(formData.doctorId, formData.fechaCita);
          setHorarios(res.data);
          setHorarioSeleccionado(null);
        } catch (error) {
          console.error('Error cargando horarios:', error);
          setHorarios([]);
        } finally {
          setCargandoHorarios(false);
        }
      } else {
        setHorarios([]);
      }
    };
    cargarHorarios();
  }, [formData.doctorId, formData.fechaCita]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectHorario = (horario) => {
    setHorarioSeleccionado(horario);
    if (fieldErrors.horario) {
      setFieldErrors(prev => ({ ...prev, horario: null }));
    }
  };

  // Validaciones en tiempo real
  const validarTelefono = (telefono) => {
    const phoneRegex = /^\+\d{1,4}[0-9\s\-]{8,15}$/;
    return phoneRegex.test(telefono);
  };

  const validarEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  const validarCedula = (cedula) => {
    return /^\d{6,12}$/.test(cedula);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Limpiar errores anteriores
    setErrors([]);
    setFieldErrors({});
    
    const nuevosErrores = [];
    const nuevosFieldErrors = {};
    
    // Validar nombre
    if (!formData.username || formData.username.trim() === '') {
      nuevosErrores.push('El nombre del dueño es requerido');
      nuevosFieldErrors.username = 'El nombre del dueño es requerido';
    }
    
    // Validar email
    if (!formData.email || formData.email.trim() === '') {
      nuevosErrores.push('El correo electrónico es requerido');
      nuevosFieldErrors.email = 'El correo electrónico es requerido';
    } else if (!validarEmail(formData.email)) {
      nuevosErrores.push('Ingrese un correo electrónico válido (ejemplo: usuario@dominio.com)');
      nuevosFieldErrors.email = 'Formato de email inválido';
    }
    
    // Validar cédula
    if (!formData.cedula || formData.cedula.trim() === '') {
      nuevosErrores.push('La cédula es requerida');
      nuevosFieldErrors.cedula = 'La cédula es requerida';
    } else if (!validarCedula(formData.cedula)) {
      nuevosErrores.push('La cédula debe contener solo números (6-12 dígitos)');
      nuevosFieldErrors.cedula = 'La cédula debe tener 6-12 dígitos numéricos';
    }
    
    // Validar teléfono
    if (!formData.phoneNumber || formData.phoneNumber.trim() === '') {
      nuevosErrores.push('El número de teléfono es requerido');
      nuevosFieldErrors.phoneNumber = 'El número de teléfono es requerido';
    } else if (!validarTelefono(formData.phoneNumber)) {
      nuevosErrores.push('El teléfono debe incluir código de país. Ejemplos: +50676486781 o +506 7098 3832');
      nuevosFieldErrors.phoneNumber = 'Ejemplo: +50676486781 o +506 7098 3832';
    }
    
    // Validar nombre de mascota
    if (!formData.nombreMascota || formData.nombreMascota.trim() === '') {
      nuevosErrores.push('El nombre de la mascota es requerido');
      nuevosFieldErrors.nombreMascota = 'El nombre de la mascota es requerido';
    }
    
    // Validar especie
    if (!formData.especie) {
      nuevosErrores.push('La especie de la mascota es requerida');
      nuevosFieldErrors.especie = 'La especie es requerida';
    }
    
    // Validar doctor
    if (!formData.doctorId) {
      nuevosErrores.push('Debe seleccionar un veterinario');
      nuevosFieldErrors.doctorId = 'Seleccione un veterinario';
    }
    
    // Validar fecha
    if (!formData.fechaCita) {
      nuevosErrores.push('La fecha de la cita es requerida');
      nuevosFieldErrors.fechaCita = 'Seleccione una fecha';
    }
    
    // Validar horario
    if (!horarioSeleccionado) {
      nuevosErrores.push('Debe seleccionar un horario disponible');
      nuevosFieldErrors.horario = 'Seleccione un horario';
    }
    
    if (nuevosErrores.length > 0) {
      setErrors(nuevosErrores);
      setFieldErrors(nuevosFieldErrors);
      
      // Enfocar el primer campo con error
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
    
    setLoading(true);
    setErrors([]);
    
    try {
      const datosEnvio = {
        username: formData.username.trim(),
        lastname: formData.lastname || '',
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.toLowerCase().trim(),
        cedula: formData.cedula.trim(),
        nombreMascota: formData.nombreMascota.trim(),
        especie: formData.especie,
        doctorId: formData.doctorId,
        fechaCita: formData.fechaCita,
        horaInicio: horarioSeleccionado.inicio,
        horaFin: horarioSeleccionado.fin,
        tipoCita: formData.tipoCita,
        sintomas: formData.sintomas || '',
        tiempoSintomas: formData.tiempoSintomas || '',
        notas: formData.notas || ''
      };
      
      console.log("📝 Datos a enviar:", datosEnvio);
      
      await createClienteTemporalRequest(datosEnvio);
      
      toast.success('✅ ¡Cita agendada exitosamente! Se ha enviado un correo de confirmación.', {
        duration: 5000,
        position: "top-right"
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('❌ Error:', error);
      
      // Manejar error específico del backend
      if (error.response?.data?.message) {
        const mensaje = error.response.data.message;
        const field = error.response.data.field;
        
        // Si el backend envió un campo específico, mostrar error junto a ese campo
        if (field) {
          setFieldErrors({ [field]: mensaje });
          setErrors([mensaje]);
          
          // Enfocar el campo con error
          const inputElement = document.querySelector(`[name="${field}"]`);
          if (inputElement) {
            inputElement.focus();
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          setErrors([mensaje]);
        }
        
        toast.error(`❌ ${mensaje}`, { duration: 5000 });
      } else {
        const mensajeError = 'Error al agendar cita. Intente nuevamente.';
        setErrors([mensajeError]);
        toast.error(`❌ ${mensajeError}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener clases de input según si tiene error
  const getInputClass = (fieldName) => {
    const baseClass = "w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition";
    const errorClass = fieldErrors[fieldName] ? "border-red-500 focus:ring-red-500" : "border-cyan-400 focus:border-cyan-500";
    return `${baseClass} ${errorClass}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📞 Agendar Cita Rápida</h2>
      
      <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
        <p className="text-sm text-blue-700">
          ⚡ Agendamiento rápido - La cédula será su identificador único.
        </p>
      </div>

      {/* Errores generales */}
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {errors.map((err, i) => (
            <p key={i} className="text-sm">❌ {err}</p>
          ))}
        </div>
      )}

      {/* Datos del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del dueño * 
            {fieldErrors.username && <span className="text-red-500 ml-2 text-xs">{fieldErrors.username}</span>}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={getInputClass('username')}
            placeholder="Ej: Juan Pérez"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className={getInputClass('lastname')}
            placeholder="Ej: Pérez Gómez"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cédula * 
            {fieldErrors.cedula && <span className="text-red-500 ml-2 text-xs">{fieldErrors.cedula}</span>}
          </label>
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className={getInputClass('cedula')}
            placeholder="000000000"
          />
          <p className="text-xs text-gray-400 mt-1">Solo números, 6-12 dígitos</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono * 
            {fieldErrors.phoneNumber && <span className="text-red-500 ml-2 text-xs">{fieldErrors.phoneNumber}</span>}
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className={getInputClass('phoneNumber')}
            placeholder="+506 7098 3832"
          />
          <p className="text-xs text-gray-400 mt-1">Incluye código de país: +506 0000 0000</p>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico * 
            {fieldErrors.email && <span className="text-red-500 ml-2 text-xs">{fieldErrors.email}</span>}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={getInputClass('email')}
            placeholder="cliente@ejemplo.com"
          />
          <p className="text-xs text-gray-400 mt-1">
            Se enviará un correo con las credenciales al completar el registro
          </p>
        </div>
      </div>

      {/* Datos de la mascota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la mascota * 
            {fieldErrors.nombreMascota && <span className="text-red-500 ml-2 text-xs">{fieldErrors.nombreMascota}</span>}
          </label>
          <input
            type="text"
            name="nombreMascota"
            value={formData.nombreMascota}
            onChange={handleChange}
            className={getInputClass('nombreMascota')}
            placeholder="Ej: Firulais"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Especie * 
            {fieldErrors.especie && <span className="text-red-500 ml-2 text-xs">{fieldErrors.especie}</span>}
          </label>
          <select
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            className={getInputClass('especie')}
          >
            <option value="">Selecciona una especie</option>
            <option value="perro">Perro 🐕</option>
            <option value="gato">Gato 🐈</option>
            <option value="conejo">Conejo 🐇</option>
            <option value="ave">Ave 🐦</option>
            <option value="hámster">Hámster 🐹</option>
            <option value="tortuga">Tortuga 🐢</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Datos de la cita */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cita *</label>
          <select
            name="tipoCita"
            value={formData.tipoCita}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2"
          >
            <option value="consulta">Consulta médica 🩺</option>
            <option value="estetica">Estética (baño/corte) ✂️</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Veterinario * 
            {fieldErrors.doctorId && <span className="text-red-500 ml-2 text-xs">{fieldErrors.doctorId}</span>}
          </label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={getInputClass('doctorId')}
          >
            <option value="">Selecciona un veterinario</option>
            {doctores.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.username} {doctor.lastname} - {doctor.especialidad}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de la cita * 
            {fieldErrors.fechaCita && <span className="text-red-500 ml-2 text-xs">{fieldErrors.fechaCita}</span>}
          </label>
          <input
            type="date"
            name="fechaCita"
            value={formData.fechaCita}
            onChange={handleChange}
            className={getInputClass('fechaCita')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Horario disponible * 
            {fieldErrors.horario && <span className="text-red-500 ml-2 text-xs">{fieldErrors.horario}</span>}
          </label>
          {cargandoHorarios ? (
            <div className="text-center py-4 text-gray-500">Cargando horarios...</div>
          ) : horarios.length === 0 ? (
            <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
              No hay horarios disponibles para esta fecha
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-1">
              {horarios.map((horario, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectHorario(horario)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    horarioSeleccionado === horario
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {horario.inicio} - {horario.fin}
                </button>
              ))}
            </div>
          )}
          {horarioSeleccionado && (
            <p className="text-sm text-green-600 mt-1">
              ✅ Horario seleccionado: {horarioSeleccionado.inicio} - {horarioSeleccionado.fin}
            </p>
          )}
        </div>
      </div>

      {/* Síntomas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
          <select
            name="sintomas"
            value={formData.sintomas}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2"
          >
            <option value="">Selecciona un síntoma (opcional)</option>
            <option value="vomito">Vómito</option>
            <option value="Diarrea">Diarrea</option>
            <option value="Falta de apetito">Falta de apetito</option>
            <option value="tos">Tos</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">¿Hace cuánto comenzaron?</label>
          <input
            type="text"
            name="tiempoSintomas"
            value={formData.tiempoSintomas}
            onChange={handleChange}
            placeholder="Ej: 2 días, 1 semana..."
            className="w-full border border-cyan-400 rounded-md px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
        <textarea
          name="notas"
          value={formData.notas}
          onChange={handleChange}
          rows={3}
          placeholder="Información adicional..."
          className="w-full border border-cyan-400 rounded-md px-3 py-2"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-cyan-600 text-white py-2.5 rounded-md hover:bg-cyan-700 transition disabled:opacity-50 font-medium"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Agendando...
            </span>
          ) : (
            "Agendar Cita Rápida"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 text-gray-700 py-2.5 rounded-md hover:bg-gray-400 transition font-medium"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};