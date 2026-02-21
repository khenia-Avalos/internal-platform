import {useAuth} from '../../hooks/useAuth'


function PerfilPage(){
    const {user} = useAuth();

  return (
  <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
    <h1 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
    
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
  </div>
);
}
export default PerfilPage