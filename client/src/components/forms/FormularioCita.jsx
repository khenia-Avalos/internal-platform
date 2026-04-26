import { useState, useEffect } from 'react';
import { HorariosDisponibles } from '../HorariosDisponibles';
import { getDoctoresRequest } from '../../api/doctores';
import { getClientesRequest } from '../../api/clientes';
import { getPacienteByOwnerRequest } from '../../api/pacientes';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';


export const FormularioCita = ({ onSubmit, cita }) => {
  console.log("🎯 FormularioCita - onSubmit recibido:", onSubmit);
  console.log("🎯 FormularioCita - cita recibida:", cita);
  

      const [doctores, setDoctores] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);


  // Extraer IDs correctamente (para creación y edición)
  const [doctorId, setDoctorId] = useState(cita?.doctorId?._id || cita?.doctorId || '');
  const [horario, setHorario] = useState(null);
const [duenoId, setDuenoId] = useState(cita?.pacienteId?.ownerId?._id || '');
const [mascotaId, setMascotaId] = useState(cita?.pacienteId?._id || '');
const [correo, setCorreo] = useState(cita?.pacienteId?.ownerId?.email || cita?.correo || '');
  const [titulo, setTitulo] = useState(cita?.titulo || '');
  const [tipoCita, setTipoCita] = useState(cita?.tipoCita || 'consulta');
  const [descripcion, setDescripcion] = useState(cita?.descripcion || '');
  const [notas, setNotas] = useState(cita?.notas || '');

    const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  // Formatear la fecha para el input type="date"
const fechaFormateada = cita?.fecha ? cita.fecha.split('T')[0] : '';
const [fecha, setFecha] = useState(fechaFormateada);


  // Cargar doctores y dueños al montar
useEffect(() => {
  cargarDoctores();
  cargarDuenos();
}, []);

// Cargar mascotas cuando cambia el dueño
useEffect(() => {
  if (duenoId) {
    cargarMascotas(duenoId);
  } else {
    setMascotas([]);
  }
}, [duenoId]);

const cargarDoctores = async () => {
  try {
    const res = await getDoctoresRequest();
    setDoctores(res.data);
  } catch (error) {
    manejarErrorResponse(error, setErrors);
  }
};

const cargarDuenos = async () => {
  try {
    const res = await getClientesRequest();
    setDuenos(res.data);
  } catch (error) {
    manejarErrorResponse(error, setErrors);
  }
};

const cargarMascotas = async (ownerId) => {
  try {
    const res = await getPacienteByOwnerRequest(ownerId);
    setMascotas(res.data);
  } catch (error) {
    manejarErrorResponse(error, setErrors);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!horario) {
    setErrors(["Por favor selecciona un horario"]);
    return;
  }
  
  const datosCita = {
    doctorId,
    fecha,
    horaInicio: horario.inicio,
    horaFin: horario.fin,
    pacienteId: mascotaId,
    titulo,
    tipoCita,
    descripcion,
    notas, 
    correo
  };
  
  setLoading(true);
  
  // ✅ LLAMAR DIRECTAMENTE A onSubmit
  const resultado = onSubmit(datosCita);
  
  // Si onSubmit es una promesa (async), esperarla
  if (resultado && typeof resultado.then === 'function') {
    await resultado;
  }
  
  setLoading(false);
  setShowForm(false);
};
return (
  <>
    {console.log("🎨 FormularioCita - el botón dirá:", cita ? "Actualizar Cita" : "Crear Cita")}

<form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
  <h2 className="text-xl font-semibold mb-4">
    {cita ? 'Editar Cita' : 'Nueva Cita'}
  </h2>

  {/* Campo 1: Doctores */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
    <select
      value={doctorId}
      onChange={(e) => setDoctorId(e.target.value)}
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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

  {/* Campo 2: Fecha */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
    <input
      type="date"
      value={fecha}
      onChange={(e) => setFecha(e.target.value)}
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      required
    />
  </div>

  {/* Campo 3: Horarios Disponibles */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Horario disponible *</label>
    <HorariosDisponibles
      doctorId={doctorId}
      fecha={fecha}
      onSelectHorario={setHorario}
    />
    {horario && (
      <p className="text-sm text-green-600 mt-1">
        Horario seleccionado: {horario.inicio} - {horario.fin}
      </p>
    )}
  </div>

  {/* Campo 4: Dueños (con buscador) */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Dueño de la mascota *</label>
 <select
  value={duenoId}
  onChange={(e) => {
    const duenoIdSeleccionado = e.target.value;
    setDuenoId(duenoIdSeleccionado);
    
    // 👇ESTO ES LO NUEVO: actualizar el correo
    const duenoSeleccionado = duenos.find(d => d._id === duenoIdSeleccionado);
    if (duenoSeleccionado) {
      setCorreo(duenoSeleccionado.email || '');
    } else {
      setCorreo('');
    }
  }}
  className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
  required
>
  <option value="">Selecciona un dueño</option>
  {duenos.map((dueno) => (
    <option key={dueno._id} value={dueno._id}>
      {dueno.username} {dueno.lastname} - {dueno.email}
    </option>
  ))}
</select>
  </div>

  {/* Campo 5: Mascotas (se muestra solo si hay dueño seleccionado) */}
  {duenoId && (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
      <select
        value={mascotaId}
        onChange={(e) => setMascotaId(e.target.value)}
        className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        required
      >
        <option value="">Selecciona una mascota</option>
        {mascotas.map((mascota) => (
          <option key={mascota._id} value={mascota._id}>
            {mascota.nombre} ({mascota.especie})
          </option>
        ))}
      </select>
    </div>
  )}

  {/* Campo de correo electrónico */}
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Correo electrónico *
  </label>
  <input
    type="email"
    value={correo}
    onChange={(e) => setCorreo(e.target.value)}
    placeholder="correo@ejemplo.com"
    className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    required
  />
</div>

  {/* Campo 6: Tipo de cita */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cita *</label>
    <select
      value={tipoCita}
      onChange={(e) => setTipoCita(e.target.value)}
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      required
    >
      <option value="consulta">Consulta general</option>
      <option value="vacunacion">Vacunación</option>
      <option value="cirugia">Cirugía</option>
      <option value="estetica">Estética (baño, corte)</option>
    </select>
  </div>

  {/* Campo 7: Título */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Título de la cita</label>
    <input
      type="text"
      value={titulo}
      onChange={(e) => setTitulo(e.target.value)}
      placeholder="Ej: Consulta de seguimiento"
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
    />
  </div>

  {/* Campo 8: Descripción */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
    <textarea
      value={descripcion}
      onChange={(e) => setDescripcion(e.target.value)}
      rows={3}
      placeholder="Detalles de la consulta, síntomas, etc."
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
    />
  </div>

  {/* Campo 9: Notas adicionales */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
    <textarea
      value={notas}
      onChange={(e) => setNotas(e.target.value)}
      rows={2}
      placeholder="Información adicional para el veterinario"
      className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
    />
  </div>

  {/* Campo 10: Botón de enviar */}
  <button
    type="submit"
    disabled={loading}
    className="w-full bg-cyan-600 text-white py-2.5 rounded-md hover:bg-cyan-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
  >
  {loading ? "Guardando..." : cita ? "Actualizar Cita" : "Crear Cita"}
  </button>
</form>
  </>
);
};


