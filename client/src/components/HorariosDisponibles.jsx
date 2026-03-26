import { useState, useEffect } from 'react';

export const HorariosDisponibles = ({ doctorId, fecha, onSelectHorario }) => {
  // 1. Estados
  const [horarios, setHorarios] = useState([]);
const [loading, setLoading] = useState(false);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);


  // 2. useEffect para cargar horarios cuando cambie doctorId o fecha

 useEffect(() => {
    const cargarHorarios = async () => {
        if (!doctorId || !fecha) {
            setHorarios([]);
            return;
        }
        if (horarios.length > 0) return; // ya los cargamos
        setLoading(true);   
      try {
        const response = await getHorario();
        setHorarios(response.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      }
    };
    cargarHorarios();
  }, [doctorId, fecha]);//ejecuta cada vez que cambie doctorId o fecha


  // 3. Función para cargar horarios desde API
  // 4. Función para seleccionar horario
  // 5. Renderizado condicional (loading, sin horarios, lista de horarios)

  return (
    <div>
      {/* Aquí va el contenido */}
    </div>
  );
};