import { useAuth } from '../../hooks/useAuth'
import { formConfig } from '../config/formConfig';
import { useState } from 'react';
import { DynamicForm } from '../../components/DynamicForm';
import { useNavigate } from 'react-router';
import { updateClienteRequest } from '/src/api/clientes';
import { updateDoctorRequest } from '/src/api/doctores';
import { manejarErrorResponse } from '../../utils/apiErrorHandler';

function PerfilPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setErrors([]);
    setLoading(true);
    
    try {
      const userId = user._id || user.id;
      let response;
      
      // ✅ Según el rol, usar la API correspondiente
      if (user.role === 'client') {
        response = await updateClienteRequest(userId, data);
      } else if (user.role === 'doctor') {
        response = await updateDoctorRequest(userId, data);
      } else {
        // Admin también está en User (igual que doctor)
        response = await updateDoctorRequest(userId, data);
      }
      
      // ✅ Actualizar el usuario en el contexto
      setUser(response.data);
      
      setSuccessMessage("Perfil actualizado correctamente");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditing(false);
    } catch (error) {
      manejarErrorResponse(error, setErrors, setSuccessMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      {isEditing ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Editar Perfil</h1>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancelar
            </button>
          </div>
          <DynamicForm 
            {...formConfig.perfil}
            layout="grid"
            defaultValues={{
              username: user?.username,
              lastname: user?.lastname,
              email: user?.email,
              phoneNumber: user?.phoneNumber
            }}
            errors={errors}
            successMessage={successMessage}
            onSubmit={handleSubmit}
            isLoading={loading}
          />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
              >
                Editar Perfil
              </button>
              <button
                onClick={() => navigate('/forgot-password')}
                className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
              >
                Cambiar contraseña
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Nombre</label>
              <p className="mt-1 text-lg text-gray-900">{user?.username} {user?.lastname}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1 text-lg text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Teléfono</label>
              <p className="mt-1 text-lg text-gray-900">{user?.phoneNumber}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">Rol</label>
              <p className="mt-1 text-lg text-gray-900 capitalize">{user?.role}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilPage;