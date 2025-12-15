import {Navigate,Outlet, useLocation} from "react-router";
import { useAuth} from "./context/authContext";

function ProtectedRoute(){
    const {loading, isAuthenticated } = useAuth();
    const location =useLocation();

  console.log("ProtectedRoute:", { loading, isAuthenticated, path: location.pathname });
if (loading) return <h1>Loading...</h1>;
 const protectedPaths = ["/tasks", "/profile", "/add-task"];
  const isProtectedPath = protectedPaths.some(path => 
    location.pathname.startsWith(path)
  );

    if (!isAuthenticated && isProtectedPath) {
    console.log("Redirigiendo a login desde:", location.pathname);
    return <Navigate to="/login" replace />;
  }
  
return <Outlet/>;
}
export default ProtectedRoute