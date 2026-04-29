import { useState } from 'react';
import { FormularioCita } from "../../components/forms/FormularioCita";
import { createClienteTemporalRequest } from '../../api/ClientesTemporales';
import { toast } from 'sonner';

export const FormularioCitaTemporal = ({ onCancel, onSuccess }) => {
  const [datosCliente, setDatosCliente] = useState({
    username: '',
    phoneNumber: '',
    email: '',
    nombreMascota: '',
    especie: ''
  });

  const [errors, setErrors] = useState([]);

  const handleSubmitCita = async (datosCita) => {
    // Validar datos del cliente
    if (!datosCliente.username) {
      setErrors(['El nombre del dueño es requerido']);
      return;
    }
    if (!datosCliente.phoneNumber) {
      setErrors(['El teléfono es requerido']);
      return;
    }
    if (!datosCliente.nombreMascota) {
      setErrors(['El nombre de la mascota es requerido']);
      return;
    }
    if (!datosCliente.especie) {
      setErrors(['La especie es requerida']);
      return;
    }

    // Combinar datos del cliente temporal con datos de la cita
    const datosCompletos = {
      ...datosCliente,
      ...datosCita
    };

    try {
      await createClienteTemporalRequest(datosCompletos);
      toast.success('✅ Cita agendada exitosamente', {
        description: `Cliente: ${datosCliente.username} - Mascota: ${datosCliente.nombreMascota}`,
        duration: 4000,
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error al agendar cita');
      setErrors([error?.response?.data?.message || 'Error al agendar cita']);
    }
  };

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {errors.map((err, i) => <p key={i}>❌ {err}</p>)}
        </div>
      )}

      {/* Formulario de datos del cliente temporal */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">📋 Datos del cliente (mínimos)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del dueño *</label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={datosCliente.username}
              onChange={(e) => setDatosCliente({...datosCliente, username: e.target.value})}
              className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
            <input
              type="tel"
              placeholder="+506 7098 3832"
              value={datosCliente.phoneNumber}
              onChange={(e) => setDatosCliente({...datosCliente, phoneNumber: e.target.value})}
              className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Incluye código de país (+506 Costa Rica)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (opcional)</label>
            <input
              type="email"
              placeholder="cliente@ejemplo.com"
              value={datosCliente.email}
              onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
              className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la mascota *</label>
            <input
              type="text"
              placeholder="Ej: Firulais"
              value={datosCliente.nombreMascota}
              onChange={(e) => setDatosCliente({...datosCliente, nombreMascota: e.target.value})}
              className="w-full border border-cyan-400 rounded-md px-3 py-2 focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especie *</label>
            <select
              value={datosCliente.especie}
              onChange={(e) => setDatosCliente({...datosCliente, especie: e.target.value})}
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
      </div>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          ⚡ Complete los datos de la cita. Solo veterinarios de Medicina General y Groomer están disponibles.
        </p>
      </div>

      {/* Reutilizar FormularioCita con prop esTemporal */}
      <FormularioCita 
        onSubmit={handleSubmitCita}
        esTemporal={true}
        onCancel={onCancel}
      />
    </div>
  );
};