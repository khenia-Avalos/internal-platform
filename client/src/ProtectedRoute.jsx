import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../context/authContext";

function ProtectedRoute({ requireAdmin = false }) {
    const { loading, isAuthenticated, authChecked, user } = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute:", { 
        loading, 
        isAuthenticated, 
        authChecked,
        userRole: user?.role,
        requireAdmin,
        path: location.pathname 
    });

    // ✅ Solo mostrar loading cuando realmente está cargando Y no hemos verificado
    if (loading && !authChecked) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // ✅ Definir qué rutas son protegidas (si no estamos usando requireAdmin en todas)
    const protectedPaths = ["/tasks", "/profile", "/add-task", "/admin"];
    const isProtectedPath = protectedPaths.some(path => 
        location.pathname.startsWith(path)
    );

    // ✅ Solo redirigir si authChecked es true (ya verificamos)
    if (authChecked && !isAuthenticated && isProtectedPath) {
        console.log("Redirigiendo a login desde:", location.pathname);
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 🔴 Si la ruta requiere admin y el usuario NO es admin
    if (authChecked && isAuthenticated && requireAdmin && user?.role !== 'admin') {
        console.log("Acceso denegado: no es admin. Rol actual:", user?.role);
        return <Navigate to="/" replace />;
    }

    // ✅ Si estamos en /admin pero el usuario no es admin (por si alguien escribe la URL)
    if (authChecked && isAuthenticated && location.pathname.startsWith('/admin') && user?.role !== 'admin') {
        console.log("Intento de acceso a admin sin permisos:", user?.role);
        return <Navigate to="/" replace />;
    }

    // Todo bien, mostrar contenido
    return <Outlet />;
}

export default ProtectedRoute;