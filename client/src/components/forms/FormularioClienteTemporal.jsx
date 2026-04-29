import { useState, useEffect } from 'react';
import { getDoctoresRequest } from '../../api/doctores';
import { getHorariosDisponiblesRequest } from '../../api/cita';
import { createClienteTemporalRequest } from '../../api/ClientesTemporales';
import { toast } from 'sonner';

export const FormularioClienteTemporal = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    lastname: '',
    phoneNumber: '',
    email: '',
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
  };

  const handleSelectHorario = (horario) => {
    console.log("Horario seleccionado:", horario);
    setHorarioSeleccionado(horario);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validaciones
    const nuevosErrores = [];
    if (!formData.username) nuevosErrores.push('El nombre del dueño es requerido');
    if (!formData.phoneNumber) nuevosErrores.push('El teléfono es requerido');
    if (!formData.nombreMascota) nuevosErrores.push('El nombre de la mascota es requerido');
    if (!formData.especie) nuevosErrores.push('La especie es requerida');
    if (!formData.doctorId) nuevosErrores.push('Debe seleccionar un veterinario');
    if (!formData.fechaCita) nuevosErrores.push('Debe seleccionar una fecha');
    if (!horarioSeleccionado) nuevosErrores.push('Debe seleccionar un horario');
    
    if (nuevosErrores.length > 0) {
      setErrors(nuevosErrores);
      return;
    }
    
    setLoading(true);
    setErrors([]);
    
    try {
      const datosEnvio = {
        username: formData.username,
        lastname: formData.lastname,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        nombreMascota: formData.nombreMascota,
        especie: formData.especie,
        doctorId: formData.doctorId,
        fechaCita: formData.fechaCita,
        horaInicio: horarioSeleccionado.inicio,
        horaFin: horarioSeleccionado.fin,
        tipoCita: formData.tipoCita,
        sintomas: formData.sintomas,
        tiempoSintomas: formData.tiempoSintomas,
        notas: formData.notas
      };
      
      console.log("📝 Enviando datos:", datosEnvio);
      
      const response = await createClienteTemporalRequest(datosEnvio);
      console.log("✅ Respuesta:", response.data);
      
      toast.success('✅ Cita agendada exitosamente', {
        description: `Cliente: ${formData.username} - Mascota: ${formData.nombreMascota}`,
        duration: 4000,
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('❌ Error:', error);
      console.error('Detalle:', error.response?.data);
      setErrors([error?.response?.data?.message || 'Error al agendar cita']);
      toast.error('❌ Error al agendar cita');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📞 Agendar Cita Rápida</h2>
      
      <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-200">
        <p className="text-sm text-blue-700">
          ⚡ Agendamiento rápido - Solo datos básicos.
          Al llegar a la cita, podrá completar el registro completo del cliente.
        </p>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.map((err, i) => <p key={i}>❌ {err}</p>)}
        </div>
      )}

      {/* Datos del cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del dueño *</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            type="text"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+506 7098 3832"
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Incluye código de país (+506 Costa Rica)</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Datos de la mascota */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mascota *</label>
          <input
            type="text"
            name="nombreMascota"
            value={formData.nombreMascota}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
          <select
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
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
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
          >
            <option value="consulta">Consulta médica 🩺</option>
            <option value="estetica">Estética (baño/corte) ✂️</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la cita *</label>
          <input
            type="date"
            name="fechaCita"
            value={formData.fechaCita}
            onChange={handleChange}
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horario disponible *</label>
          {cargandoHorarios ? (
            <div className="text-center py-4 text-gray-500">Cargando horarios...</div>
          ) : horarios.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No hay horarios disponibles</div>
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
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
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
            className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
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
          placeholder="Información adicional que quieras proporcionar..."
          className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-cyan-600 text-white py-2.5 rounded-md hover:bg-cyan-700 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Agendando..." : "Agendar Cita Rápida"}
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