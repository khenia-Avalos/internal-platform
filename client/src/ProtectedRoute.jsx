import {Navigate,Outlet, useLocation} from "react-router";
import { useAuth} from "./context/authContext";

function ProtectedRoute(){
    const {loading, isAuthenticated } = useAuth();
    const location =useLocation();

console.log(loading,isAuthenticated);

if (loading) return <h1>Loading...</h1>;

if (!isAuthenticated && location.pathname !=="/"){
    return <Navigate to ="/" replace/>;
}
return <Outlet/>;
}
export default ProtectedRoute