import React from "react";
import {Dashboardconfig} from "../../pages/Dashboard/DashboardConfig";

function Sidebar ({activeModule, setActiveModule, userRole, modules, mobileOpen, setMobileOpen}) {
  console.log(" Sidebar - módulos recibidos:", modules);
console.log(" activeModule:", activeModule);
  return (
    <>
      {/* Overlay para móvil (fondo oscuro al abrir sidebar) */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-30 transition-transform duration-300 ease-in-out
        w-64
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Botón de cerrar (solo visible en móvil) */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 p-1 rounded-md text-gray-500 hover:text-gray-700 md:hidden"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-4 flex items-center gap-2">
          <span className="text-xl font-bold text-blue-600">Veterinaria El Éxito</span>
        </div>
        
        <div className="px-4 pb-2">
          <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
            {userRole}
          </span>
        </div>

        <ul className="mt-2">
          {modules.map((module) => (
            <li 
              key={module.id} 
              className={`p-3 mx-2 rounded-lg cursor-pointer transition-colors ${
                activeModule === module.id 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                setActiveModule(module.id);
                setMobileOpen(false); // Cierra sidebar en móvil al seleccionar un módulo
              }}
            >
              {module.name}
            </li>
          ))} 
        </ul>
      </div>
    </>
  );
}

export default Sidebar;