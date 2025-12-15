import {Navigate,Outlet, useLocation} from "react-router";
import { useAuth} from "./context/authContext";

function ProtectedRoute(){
    const {loading, isAuthenticated, authChecked } = useAuth();
    const location =useLocation();

  console.log("ProtectedRoute:", { loading, isAuthenticated, path: location.pathname });

 // ✅ Solo mostrar loading cuando realmente está cargando Y no hemos verificado
  if (loading && !authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }


 const protectedPaths = ["/tasks", "/profile", "/add-task"];
  const isProtectedPath = protectedPaths.some(path => 
    location.pathname.startsWith(path)
  );

    // ✅ Solo redirigir si authChecked es true (ya verificamos)
  if (authChecked && !isAuthenticated && isProtectedPath) {
    console.log("Redirigiendo a login desde:", location.pathname);
    return <Navigate to="/login" replace />;
  }
  
  
return <Outlet/>;
}
export default ProtectedRoute