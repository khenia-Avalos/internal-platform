import { useState, useEffect } from 'react';
import { getHorariosDisponiblesRequest } from '../api/citas';
import { manejarErrorResponse } from '../utils/apiErrorHandler';

export const HorariosDisponibles = ({ doctorId, fecha, onSelectHorario }) => {
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [errors, setErrors] = useState([]);

  const cargarHorarios = async () => {
    if (!doctorId || !fecha) {
      setHorarios([]);
      return;
    }
    
    setLoading(true);
    try {
      const response = await getHorariosDisponiblesRequest(doctorId, fecha, 30); // duración por defecto
      setHorarios(response.data);
    } catch (error) {
      manejarErrorResponse(error, setErrors);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHorarios();//cargar horarios cada vez que cambie el doctorId o la fecha   
  }, [doctorId, fecha]);

  const handleSelectHorario = (horario) => {
    setHorarioSeleccionado(horario);
    onSelectHorario(horario);
  };

  if (loading) {
    return <div className="text-center py-4">Cargando horarios...</div>;
  }

  if (horarios.length === 0) {
    return <div className="text-center py-4 text-gray-500">No hay horarios disponibles para esta fecha</div>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
      {horarios.map((horario, index) => (
        <button
          key={index}
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
  );
};