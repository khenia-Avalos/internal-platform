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
const [mobileOpen, setMobileOpen] = useState(false); //  para sidebar en móvil
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
  console.log(" Módulos recibidos en DynamicDashboard:", modules);
console.log(" userRole recibido:", userRole);
  return(
  <div className="flex h-screen bg-gray-100">

  {/*  Botón para abrir sidebar en móvil - ajustado para no interferir con Navbar */}
  <button
    onClick={() => setMobileOpen(true)}
    className="fixed top-20 left-4 z-20 p-2 rounded-md bg-cyan-600 text-white md:hidden shadow-md"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <Sidebar 
  modules={modules}
    userRole={userRole}
    activeModule={activeModule}
    setActiveModule={setActiveModule}//el sidebar llamara a esta funcion para cambiar el modulo activo cuando el usuaurio elija un modulo
    mobileOpen={mobileOpen}
    setMobileOpen={setMobileOpen}
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