import { createContext, useEffect, useState , useContext} from "react";


import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

// ✅ ✅ ✅ AÑADE ESTE HOOK - ES LO QUE FALTA ✅ ✅ ✅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);


  const signup = async (user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
  
      return { ok: true };
    } catch (error) {
     const errorData = error.response?.data;
      const errorMessage = errorData 
        ? (Array.isArray(errorData) ? errorData : [errorData])
        : ["Registration failed. Please try again."];
      
      setErrors(errorMessage);
      return { ok: false };
    }
  };
  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
     
 return { 
        ok: true,
        data: res.data // Asegúrate de devolver data
      };
    } catch (error) {
    // MANEJO SEGURO DEL ERROR
      const errorData = error.response?.data;
      const errorMessage = errorData 
        ? (Array.isArray(errorData) ? errorData : [errorData])
        : ["Login failed. Check your credentials."];
      
      setErrors(errorMessage);
      return { ok: false , 
        error: errorMessage
      };
    }
  };
  const logout = async () => {
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
   localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // ✅ FORZAR recarga para limpiar estado completamente
    window.location.href = "/";  // Esto es CRÍTICO
    
    return { ok: true };
    } catch (error) {
     // MANEJO SEGURO DEL ERROR
      const errorMessage = error.response?.data || ["Logout failed"];
      setErrors(Array.isArray(errorMessage) ? errorMessage : [errorMessage]);
      return { ok: false };
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await verifyTokenRequest();
        if (!res.data) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        console.log("Error verificando token:", error.message);
        // Si es 401, simplemente no estamos autenticados
        if (error.response?.status !== 401) {
          console.error("Error inesperado:", error);
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        signup,
        signin,
        logout,
        isAuthenticated,
        errors,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 