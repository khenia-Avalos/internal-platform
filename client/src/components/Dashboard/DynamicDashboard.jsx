import { Link, useLocation, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";

export const DynamicDashboard = ({
modules = [],
userRole,
   isLoading = false


}) => {
//EL ORDEN DE LAS LINEAS IMPORTA
const [activeModule, setActiveModule] = useState(null);
  const location = useLocation();
    const navigate = useNavigate();
const activeModuleObj = modules.find(m => m.id === activeModule);//busca el modulo activo en el arrray de modulos
    const ComponenteActivo = activeModuleObj?.component;//guarda el componente activo



    if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  console.log("🚀 Módulos recibidos en DynamicDashboard:", modules);
console.log("🎯 userRole recibido:", userRole);
  return(
  <div className="flex h-screen bg-gray-100">

  <Sidebar 
  modules={modules}
    userRole={userRole}
    activeModule={activeModule}
    setActiveModule={setActiveModule}//el sidebar llamara a esta funcion para cambiar el modulo activo cuando el usuaurio elija un modulo
  />
      <div className="flex-1 overflow-auto">
        
        {ComponenteActivo && <ComponenteActivo />} 
        {!ComponenteActivo && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Selecciona un módulo del menú</p>
          </div>
        )}
    </div>
  </div>
  )
}