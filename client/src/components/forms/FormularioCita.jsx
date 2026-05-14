import { useState, useEffect } from 'react';
import { HorariosDisponibles } from '../HorariosDisponibles';
import { getDoctoresRequest } from '../../api/doctores';
import { getClientesRequest } from '../../api/clientes';
import { getPacienteByOwnerRequest } from '../../api/pacientes';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';

export const FormularioCita = ({ onSubmit, cita, isEdit = false, onCancel, datosPrecargados = null }) => {
  console.log("📋 COMPONENTE FORMULARIO CITA - RENDERIZADO");
  console.log("📋 isEdit:", isEdit);
  console.log("📋 cita:", cita);
  console.log("📋 datosPrecargados:", datosPrecargados);
  
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
  const [sintomas, setSintomas] = useState(cita?.sintomas || '');
  const [tiempoSintomas, setTiempoSintomas] = useState(cita?.tiempoSintomas || '');
  const [fecha, setFecha] = useState(() => {
    if (cita?.fecha) {
      const fechaStr = cita.fecha.split('T')[0];
      console.log("📅 Fecha inicial desde cita:", fechaStr);
      return fechaStr;
    }
    return '';
  });

  // ✅ PRECARGAR DATOS DEL CLIENTE SI EXISTEN (para rol cliente)
  useEffect(() => {
    if (datosPrecargados && !isEdit) {
      console.log("📋 Precargando datos del cliente:", datosPrecargados);
      if (datosPrecargados.duenoId) {
        setDuenoId(datosPrecargados.duenoId);
      }
      if (datosPrecargados.correo) {
        setCorreo(datosPrecargados.correo);
      }
      if (datosPrecargados.mascotas && datosPrecargados.mascotas.length > 0) {
        setMascotas(datosPrecargados.mascotas);
      }
    }
  }, [datosPrecargados, isEdit]);

  // Cargar doctores
  useEffect(() => {
    console.log("🔄 useEffect - cargando doctores");
    cargarDoctores();
  }, []);

  // Cargar dueños (solo para admin, no para clientes con datos precargados)
  useEffect(() => {
    if (!datosPrecargados && !isEdit) {
      console.log("🔄 useEffect - cargando dueños");
      cargarDuenos();
    }
  }, [datosPrecargados, isEdit]);

  // Cargar mascotas cuando cambia el dueño (si no hay datos precargados)
  useEffect(() => {
    if (duenoId && !datosPrecargados) {
      console.log("🔄 useEffect - duenoId cambió a:", duenoId);
      cargarMascotas(duenoId);
    } else if (duenoId && datosPrecargados && mascotas.length === 0) {
      // Si hay datos precargados pero no mascotas, cargarlas
      cargarMascotas(duenoId);
    }
  }, [duenoId, datosPrecargados]);

  const cargarDoctores = async () => {
    try {
      const res = await getDoctoresRequest();
      setDoctores(res.data);
      console.log("👨‍⚕️ Doctores cargados:", res.data.length);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
    }
  };

  const cargarDuenos = async () => {
    try {
      const res = await getClientesRequest();
      setDuenos(res.data);
      console.log("👤 Dueños cargados:", res.data.length);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
    }
  };

  const cargarMascotas = async (ownerId) => {
    try {
      console.log("🔍 Buscando mascotas para ownerId:", ownerId);
      const res = await getPacienteByOwnerRequest(ownerId);
      setMascotas(res.data);
      console.log("🐾 Mascotas cargadas para dueño", ownerId, ":", res.data.length);
    } catch (error) {
      console.error("❌ Error cargando mascotas:", error);
      manejarErrorResponse(error, setErrors);
      setMascotas([]);
    }
  };

  const handleSelectHorario = (horarioSeleccionado) => {
    console.log("⏰ HANDLE_SELECT_HORARIO - EJECUTADO");
    console.log("⏰ Horario seleccionado:", horarioSeleccionado);
    setHorario(horarioSeleccionado);
  };

  const handleSubmit = async (e) => {
    console.log("📤 HANDLE_SUBMIT - EJECUTADO");
    e.preventDefault();
    e.stopPropagation();
    
    console.log("✅ Validando campos...");
    console.log("✅ isEdit:", isEdit);
    console.log("✅ horario:", horario);
    console.log("✅ mascotaId:", mascotaId);
    
    if (!isEdit && !horario) {
      console.log("❌ Error: No hay horario seleccionado");
      setErrors(["Por favor selecciona un horario"]);
      return;
    }
    
    if (!mascotaId) {
      console.log("❌ Error: No hay mascota seleccionada");
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
      correo,
      sintomas,
      tiempoSintomas
    };
    
    if (!isEdit) {
      datosCita.fecha = fecha;
      datosCita.horaInicio = horario.inicio;
      datosCita.horaFin = horario.fin;
    }
    
    console.log("📦 Datos a enviar:", JSON.stringify(datosCita, null, 2));
    console.log("📅 Fecha seleccionada por usuario:", fecha);
    
    setLoading(true);
    setErrors([]);
    
    try {
      console.log("🚀 Llamando a onSubmit...");
      await onSubmit(datosCita);
      console.log("✅ onSubmit completado con éxito");
      
      if (!isEdit) {
        console.log("🧹 Limpiando formulario...");
        setDoctorId('');
        setHorario(null);
        if (!datosPrecargados) {
          setDuenoId('');
        }
        setMascotaId('');
        setFecha('');
        setTitulo('');
        setTipoCita('consulta');
        setDescripcion('');
        setNotas('');
        if (!datosPrecargados) {
          setCorreo('');
        }
        setSintomas('');
        setTiempoSintomas('');
      }
      
    } catch (error) {
      console.error("❌ Error en onSubmit:", error);
      setErrors([error?.response?.data?.message || error.message || "Error al guardar"]);
    } finally {
      setLoading(false);
      console.log("handleSubmit finalizado");
    }
  };

  return (
    <form className="space-y-4 bg-white p-6 rounded-lg shadow" onSubmit={handleSubmit}>
      {console.log("🎨 RENDERIZANDO FORMULARIO - isEdit:", isEdit)}
      
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
            <select
              value={doctorId}
              onChange={(e) => {
                console.log("👨‍⚕️ Veterinario cambiado a:", e.target.value);
                setDoctorId(e.target.value);
              }}
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => {
                console.log("📅 Fecha cambiada a:", e.target.value);
                setFecha(e.target.value);
              }}
              className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
              required
            />
          </div>

          <div>
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
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
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

      {/* Select de Dueños - Oculto si hay datos precargados (cliente) */}
      {!datosPrecargados && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dueño de la mascota *</label>
          <select
            value={duenoId}
            onChange={(e) => {
              const nuevoDuenoId = e.target.value;
              console.log("👤 Dueño seleccionado:", nuevoDuenoId);
              setDuenoId(nuevoDuenoId);
              const duenoSeleccionado = duenos.find(d => d._id === nuevoDuenoId);
              if (duenoSeleccionado) {
                setCorreo(duenoSeleccionado.email || '');
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
          {duenos.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">⚠️ No hay dueños registrados. Debes crear un cliente primero.</p>
          )}
        </div>
      )}

      {/* Mostrar información del dueño si hay datos precargados */}
      {datosPrecargados && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-700">
            <strong>👤 Dueño:</strong> {datosPrecargados.duenoNombre || 'No especificado'}
          </p>
          <p className="text-sm text-gray-700">
            <strong>📧 Correo:</strong> {datosPrecargados.correo || 'No especificado'}
          </p>
        </div>
      )}

      {/* Select de Mascotas */}
      {(duenoId || datosPrecargados) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mascota *</label>
          <select
            value={mascotaId}
            onChange={(e) => {
              console.log("🐾 Mascota seleccionada:", e.target.value);
              setMascotaId(e.target.value);
            }}
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
          {mascotas.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">⚠️ Este dueño no tiene mascotas registradas.</p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
          required
          disabled={!!datosPrecargados}
        />
      </div>

      <div>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Título de la cita</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
        />
      </div>

      {/* Síntomas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Síntomas</label>
          <select
            value={sintomas}
            onChange={(e) => setSintomas(e.target.value)}
            className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
          >
            <option value="">Selecciona un síntoma (opcional)</option>
            <option value="vomito">Vómito</option>
            <option value="Diarrea">Diarrea</option>
            <option value="Falta de apetito">Falta de apetito</option>
            <option value="tos">Tos</option>
            <option value="fiebre">Fiebre</option>
            <option value="decaimiento">Decaimiento</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">¿Hace cuánto comenzaron los síntomas?</label>
          <input
            type="text"
            value={tiempoSintomas}
            onChange={(e) => setTiempoSintomas(e.target.value)}
            className="w-full bg-white text-zinc-700 px-4 py-2.5 rounded-md border border-cyan-400"
            placeholder="Ej: 2 días, 1 semana..."
          />
        </div>
      </div>

      <div>
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