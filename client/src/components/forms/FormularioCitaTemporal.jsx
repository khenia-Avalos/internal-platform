// src/components/forms/FormularioCitaTemporal.jsx
import { useState } from 'react';
import { FormularioCita } from './FormularioCita';
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

  const handleSubmitCita = async (datosCita) => {
    // Combinar datos del cliente temporal con datos de la cita
    const datosCompletos = {
      ...datosCliente,
      ...datosCita
    };
    
    try {
      await createClienteTemporalRequest(datosCompletos);
      toast.success('✅ Cita agendada exitosamente');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error('❌ Error al agendar cita');
    }
  };

  return (
    <div className="space-y-4">
      {/* Formulario de datos del cliente temporal */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Datos del cliente</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del dueño *"
            value={datosCliente.username}
            onChange={(e) => setDatosCliente({...datosCliente, username: e.target.value})}
            className="border border-cyan-400 rounded-md px-3 py-2"
            required
          />
          <input
            type="tel"
            placeholder="Teléfono *"
            value={datosCliente.phoneNumber}
            onChange={(e) => setDatosCliente({...datosCliente, phoneNumber: e.target.value})}
            className="border border-cyan-400 rounded-md px-3 py-2"
            required
          />
          <input
            type="email"
            placeholder="Email (opcional)"
            value={datosCliente.email}
            onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
            className="border border-cyan-400 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Nombre de la mascota *"
            value={datosCliente.nombreMascota}
            onChange={(e) => setDatosCliente({...datosCliente, nombreMascota: e.target.value})}
            className="border border-cyan-400 rounded-md px-3 py-2"
            required
          />
          <select
            value={datosCliente.especie}
            onChange={(e) => setDatosCliente({...datosCliente, especie: e.target.value})}
            className="border border-cyan-400 rounded-md px-3 py-2"
            required
          >
            <option value="">Selecciona especie</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="conejo">Conejo</option>
            <option value="ave">Ave</option>
            <option value="otro">Otro</option>
          </select>
        </div>
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