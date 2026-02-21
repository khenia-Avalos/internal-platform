import React from "react";
import {Dashboardconfig} from "../../pages/Dashboard/DashboardConfig";

function Sidebar ({activeModule, setActiveModule, userRole, modules}) {
  console.log("📋 Sidebar - módulos recibidos:", modules);
console.log("🔵 activeModule:", activeModule);
  return (
    <div className="w-64 bg-white shadow-md">
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
            onClick={() => setActiveModule(module.id)}
          >
            {module.name}
          </li>
        ))} 
      </ul>
    </div>
  );
}

export default Sidebar;