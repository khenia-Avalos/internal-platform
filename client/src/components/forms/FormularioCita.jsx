import { useState, useEffect } from 'react';
import { HorariosDisponibles } from '../HorariosDisponibles';
import { getDoctoresRequest } from '../../api/doctores';
import { getClientesRequest } from '../../api/clientes';
import { getPacienteByOwnerRequest } from '../../api/pacientes';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';

export const FormularioCita = ({ onSubmit, cita, isEdit = false, onCancel }) => {
  const [doctores, setDoctores] = useState([]);
  const [duenos, setDuenos] = useState([]);
  const [mascotas, setMascotas] = useState([]);
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
  
  // Extraer fecha en formato YYYY-MM-DD
  const [fecha, setFecha] = useState(() => {
    if (cita?.fecha) {
      return cita.fecha.split('T')[0];
    }
    return '';
  });

  useEffect(() => {
    cargarDoctores();
    cargarDuenos();
  }, []);

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

  const handleSelectHorario = (horarioSeleccionado) => {
    setHorario(horarioSeleccionado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isEdit && !horario) {
      setErrors(["Por favor selecciona un horario"]);
      return;
    }
    
    if (!mascotaId) {
      setErrors(["Por favor selecciona una mascota"]);
      return;
    }
    
    const datosCita = {
      doctorId,
      pacienteId: mascotaId,
      titulo,
      tipoCita,
      descripcion,
      notas, 
      correo
    };
    
    if (!isEdit) {
      // 🔧 SOLUCIÓN DEFINITIVA: Enviar la fecha como string puro
      // El backend debe guardar EXACTAMENTE este string
      datosCita.fecha = fecha; // Ej: "2026-04-30"
      datosCita.horaInicio = horario.inicio;
      datosCita.horaFin = horario.fin;
    }
    
    console.log("📅 Fecha seleccionada (input):", fecha);
    console.log("📅 Fecha que se envía:", datosCita.fecha);
    
    setLoading(true);
    setErrors([]);
    
    try {
      await onSubmit(datosCita);
      console.log("✅ Cita guardada con fecha:", datosCita.fecha);
      
      if (!isEdit) {
        setDoctorId('');
        setHorario(null);
        setDuenoId('');
        setMascotaId('');
        setFecha('');
        setTitulo('');
        setTipoCita('consulta');
        setDescripcion('');
        setNotas('');
        setCorreo('');
      }
      
    } catch (error) {
      console.error("❌ Error:", error);
      setErrors([error?.response?.data?.message || error.message || "Error al guardar"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-semibold mb-4">
        {isEdit ? '✏️ Editar Cita' : '+ Nueva Cita'}
      </h2>

      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.map((err, i) => <p key={i}>❌ {err}</p>)}
        </div>
      )}

      {!isEdit && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
            <select
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
              className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
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

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Horario disponible *</label>
            <HorariosDisponibles
              doctorId={doctorId}
              fecha={fecha}
              onSelectHorario={handleSelectHorario}
            />
            {horario && (
              <p className="text-sm text-green-600 mt-1">
                ✅ Horario seleccionado: {horario.inicio} - {horario.fin}
              </p>
            )}
          </div>
        </>
      )}

      {isEdit && cita && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <p className="text-sm text-gray-600">
            📅 <strong>Fecha actual:</strong> {cita.fecha ? cita.fecha.split('T')[0] : ''}
          </p>
          <p className="text-sm text-gray-600">
            ⏰ <strong>Horario actual:</strong> {cita.horaInicio} - {cita.horaFin}
          </p>
          <p className="text-sm text-gray-600">
            👨‍⚕️ <strong>Veterinario:</strong> {cita.doctorId?.username} {cita.doctorId?.lastname}
          </p>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Dueño de la mascota *</label>
        <select
          value={duenoId}
          onChange={(e) => {
            const duenoIdSeleccionado = e.target.value;
            setDuenoId(duenoIdSeleccionado);
            const duenoSeleccionado = duenos.find(d => d._id === duenoIdSeleccionado);
            if (duenoSeleccionado) {
              setCorreo(duenoSeleccionado.email || '');
            } else {
              setCorreo('');
            }
          }}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
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

      {duenoId && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
          <select
            value={mascotaId}
            onChange={(e) => setMascotaId(e.target.value)}
            className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
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

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de cita *</label>
        <select
          value={tipoCita}
          onChange={(e) => setTipoCita(e.target.value)}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
          required
        >
          <option value="consulta">Consulta general</option>
          <option value="vacunacion">Vacunación</option>
          <option value="cirugia">Cirugía</option>
          <option value="estetica">Estética (baño, corte)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Título de la cita</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={2}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-cyan-600 text-white py-2.5 rounded-md hover:bg-cyan-700 transition disabled:opacity-50 font-medium"
        >
          {loading ? "Guardando..." : isEdit ? "Actualizar Cita" : "Crear Cita"}
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