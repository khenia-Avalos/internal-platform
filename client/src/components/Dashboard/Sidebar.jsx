import React from "react";
import {Dashboardconfig} from "../../pages/Dashboard/DashboardConfig";



function Sidebar ({activeModule,setActiveModule,userRole, modules}) {

return (
    <div className ="w-64 bg-white shadow-md">
   <div> </div>
<img src={logo} alt="logo" className="w-10 h-10" />

<span className="text-xl font-bold text-gray-800">{userRole}</span>
<ul className="mt-4"> {modules.map((module) => (
    <li 
  key={module.id} 
  className={`p-2 cursor-pointer ${
    activeModule === module.id 
      ? 'bg-blue-500 text-white' 
      : 'hover:bg-gray-100'
  }`}
  onClick={() => setActiveModule(module.id)}
>
  {module.name}
</li>
))}
</ul>
    </div>
)
}
        



export default Sidebar