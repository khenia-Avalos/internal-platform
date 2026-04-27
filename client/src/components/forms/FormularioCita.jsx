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
  const [fecha, setFecha] = useState(cita?.fecha ? cita.fecha.split('T')[0] : '');

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
    console.log("🕒 Horario seleccionado (NO se envía el formulario):", horarioSeleccionado);
    setHorario(horarioSeleccionado);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log("📝 Enviando formulario manualmente por click en botón");
    
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
      datosCita.fecha = fecha;
      datosCita.horaInicio = horario.inicio;
      datosCita.horaFin = horario.fin;
    }
    
    console.log("📦 Datos a enviar:", datosCita);
    
    setLoading(true);
    setErrors([]);
    
    try {
      await onSubmit(datosCita);
      console.log("✅ Envío exitoso");
      
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
            
            {/* VERSIÓN DE PRUEBA - COMENTA HORARIOSDISPONIBLES */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Selecciona un horario:</p>
              <div className="flex gap-2 flex-wrap">
                <button 
                  type="button"
                  onClick={() => handleSelectHorario({ inicio: "09:00", fin: "10:00" })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
                >
                  09:00 - 10:00
                </button>
                <button 
                  type="button"
                  onClick={() => handleSelectHorario({ inicio: "10:00", fin: "11:00" })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
                >
                  10:00 - 11:00
                </button>
                <button 
                  type="button"
                  onClick={() => handleSelectHorario({ inicio: "11:00", fin: "12:00" })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
                >
                  11:00 - 12:00
                </button>
                <button 
                  type="button"
                  onClick={() => handleSelectHorario({ inicio: "14:00", fin: "15:00" })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
                >
                  14:00 - 15:00
                </button>
                <button 
                  type="button"
                  onClick={() => handleSelectHorario({ inicio: "15:00", fin: "16:00" })}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-cyan-500 hover:text-white"
                >
                  15:00 - 16:00
                </button>
              </div>
            </div>
            
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
          <p className="text-sm text-gray-600">📅 <strong>Fecha actual:</strong> {new Date(cita.fecha).toLocaleDateString()}</p>
          <p className="text-sm text-gray-600">⏰ <strong>Horario actual:</strong> {cita.horaInicio} - {cita.horaFin}</p>
          <p className="text-sm text-gray-600">👨‍⚕️ <strong>Veterinario:</strong> {cita.doctorId?.username} {cita.doctorId?.lastname}</p>
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
            if (duenoSeleccionado) setCorreo(duenoSeleccionado.email || '');
            else setCorreo('');
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