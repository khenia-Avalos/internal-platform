// src/pages/Dashboard/MedicamentoDetallePage.jsx
import { useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useAuth } from "../../hooks/useAuth";
import { toast, Toaster } from 'sonner';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';
import { InfoCard } from "../../components/desCard";
import { 
  getMedicamentoByIdRequest,
  deleteMedicamentoRequest
} from "/src/api/medicamentos";

function MedicamentoDetallePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [medicamento, setMedicamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const cargarMedicamento = async () => {
      setLoading(true);
      try {
        const response = await getMedicamentoByIdRequest(id);
        setMedicamento(response.data);
      } catch (error) {
        console.error("Error cargando medicamento:", error);
        manejarErrorResponse(error, setErrors);
        toast.error("Error al cargar el medicamento");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarMedicamento();
    }
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${medicamento?.nombre}"?`)) return;
    
    try {
      await deleteMedicamentoRequest(id);
      toast.success(`Medicamento "${medicamento?.nombre}" eliminado`);
      navigate('/medicamentos');
    } catch (error) {
      manejarErrorResponse(error, setErrors);
      toast.error("Error al eliminar el medicamento");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!medicamento) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">Medicamento no encontrado</p>
        <button
          onClick={() => navigate('/medicamentos')}
          className="mt-4 text-cyan-600 hover:text-cyan-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 py-4 md:py-6 max-w-full">
      <Toaster position="top-right" richColors closeButton duration={3000} />

      {/* Botón de volver */}
      <button
        onClick={() => navigate('/medicamentos')}
        className="mb-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition text-sm md:text-base"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a Medicamentos
      </button>

      {/* Cabecera con foto y nombre */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-6">
        <div className="flex flex-col md:flex-row items-center gap-6 p-6">
          {/* Foto */}
          <div className="flex-shrink-0">
            {medicamento.foto ? (
              <img 
                src={medicamento.foto} 
                alt={medicamento.nombre}
                className="w-32 h-32 md:w-48 md:h-48 object-cover rounded-xl border border-gray-200"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-32 h-32 md:w-48 md:h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      <span class="text-6xl">💊</span>
                    </div>
                  `;
                }}
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                <span className="text-6xl">💊</span>
              </div>
            )}
          </div>

          {/* Nombre y acciones */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {medicamento.nombre}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">
                {medicamento.via}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {medicamento.presentacion}
              </span>
              {isAdmin && (
                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => navigate(`/medicamentos/editar/${medicamento._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Información General */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Información General</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="text-base font-medium text-gray-800">{medicamento.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Vía de administración</p>
                <p className="text-base font-medium text-gray-800">{medicamento.via}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Presentación</p>
                <p className="text-base font-medium text-gray-800">{medicamento.presentacion}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Dosis recomendada</p>
                <p className="text-base font-medium text-gray-800">{medicamento.dosis || 'No especificada'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Usos y Advertencias */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Usos y Advertencias</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">¿Para qué sirve?</p>
                <p className="text-base font-medium text-gray-800">{medicamento.paraQueSirve}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contraindicaciones</p>
                <p className="text-base font-medium text-gray-800">{medicamento.contraindicaciones || 'No especificadas'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Efectos secundarios</p>
                <p className="text-base font-medium text-gray-800">{medicamento.efectosSecundarios || 'No especificados'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Información adicional (ocupa todo el ancho) */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Información Adicional</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500">Fecha de creación</p>
                <p className="text-base font-medium text-gray-800">
                  {new Date(medicamento.createdAt).toLocaleDateString('es-CR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Última actualización</p>
                <p className="text-base font-medium text-gray-800">
                  {new Date(medicamento.updatedAt).toLocaleDateString('es-CR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className={`text-base font-medium ${medicamento.activo ? 'text-green-600' : 'text-red-600'}`}>
                  {medicamento.activo ? 'Activo' : 'Inactivo'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errores */}
      {errors.length > 0 && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {errors.map((err, i) => (
            <p key={i} className="text-sm">{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedicamentoDetallePage;
