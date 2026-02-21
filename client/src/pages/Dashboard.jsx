import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import {DynamicDashboard} from "./components/DynamicDashboard";
import { ROLES,dashboardModules } from "./Dashboard/DashboardConfig";  
import { useAuth } from "../hooks/useAuth";//este creo que usare pero mas adelante cuando las pages ya tengan funciones de crear , editar , eliminar tareas etc


export const Dashboard = () => {
    const location = useLocation();
    const navigate =useNavigate ();
const { user,isAuthenticated } = useAuth();
const modules = user ? dashboardModules[user.role] : [];
//                ↑            ↑                      ↑
//           Si user existe   entonces usa los     si no, 
//                            módulos de su rol    array vacío

useEffect(() => {
  
  if (!isAuthenticated) {
 
    navigate("/login"); 
  }
}, [isAuthenticated, navigate]); 

return (
<DynamicDashboard 
      modules={modules}
      userRole={user?.role}
      isLoading={!user}  // ← mientras carga el usuario
    />)


}