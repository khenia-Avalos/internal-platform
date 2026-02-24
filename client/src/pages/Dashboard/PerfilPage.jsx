import {useAuth} from '../../hooks/useAuth'
import { formConfig } from '../formConfig';
import { useState } from 'react';
import { DynamicForm } from '../../components/DynamicForm';


function PerfilPage(){
    const {user} = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [errors,setErrors]= useState([]);
const [successMessage, setSuccessMessage] = useState(""); 

const handlesubmit= (data) => {// data es el objeto con los datos del formularioEs el nombre que tú eliges para recibir lo que DynamicForm te envía.
  setErrors([]);
  setSuccessMessage("Perfil actualizado correctamente");     }

 return (
  <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    {isEditing ? (
   
      <>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Editar Perfil</h1>
        <button onClick={() => setIsEditing(!isEditing)}className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Cancelar
        </button>
        <DynamicForm {...formConfig.perfil}
          defaultValues={{          // con valores inicialea
    username: user?.username,
    lastname: user?.lastname,
    email: user?.email,
    phoneNumber: user?.phoneNumber
  }}
   errors={errors} successMessage={successMessage} onSubmit={handlesubmit}  /> //toma las propiedades de formconfig y las pasa como props , igual pasa errors y successMessage para mostrar mensajes de error o éxito
      </>
    ) : (

      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
          <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">
            Editar Perfil
          </button>
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
</div>        </div>
      </>
    )}
  </div>
);
}

export default PerfilPage