// src/pages/ClienteTemporalDetallePage.jsx
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { InfoCard } from "../../components/desCard";
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
// ✅ Importar las funciones que YA EXISTEN para clientes temporales
import { getClienteTemporalByIdRequest } from "/src/api/clientes-temporales";

function ClienteTemporalDetallePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        // Usar la función que YA EXISTE
        const clienteRes = await getClienteTemporalByIdRequest(id);
        console.log('📋 Cliente temporal:', clienteRes.data);
        setCliente(clienteRes.data);
      } catch (error) {
        manejarErrorResponse(error, setErrors, setSuccessMessage);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      cargarDatos();
    }
  }, [id]);

  // Función para mostrar todos los datos del formulario
  const obtenerDatosFormulario = () => {
    if (!cliente) return [];
    
    const datos = [];
    
    // Mapear todos los campos del formulario
    const camposMap = {
      username: 'Nombre',
      lastname: 'Apellido',
      email: 'Correo Electrónico',
      phoneNumber: 'Teléfono',
      cedula: 'Cédula',
      direccion: 'Dirección',
      fechaNacimiento: 'Fecha de Nacimiento',
      genero: 'Género',
      ocupacion: 'Ocupación'
    };
    
    Object.keys(camposMap).forEach(key => {
      if (cliente[key] && cliente[key] !== '') {
        let valor = cliente[key];
        if (key === 'fechaNacimiento' && valor) {
          valor = new Date(valor).toLocaleDateString('es-CR');
        }
        datos.push({ label: camposMap[key], value: valor });
      }
    });
    
    return datos;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      </div>
    );
  }

  if (!loading && !cliente) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">Cliente temporal no encontrado</p>
          <button
            onClick={() => navigate('/clientes-temporales')}
            className="mt-4 text-cyan-600 hover:text-cyan-700"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button
        onClick={() => navigate('/clientes-temporales')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Clientes Temporales
      </button>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.map((error, idx) => <p key={idx}>{error}</p>)}
        </div>
      )}

      <InfoCard
        title="Información del Cliente Temporal"
        data={obtenerDatosFormulario()}
      />
    </div>
  );
}

export default ClienteTemporalDetallePage;