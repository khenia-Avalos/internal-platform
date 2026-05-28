import { createContext, useEffect, useState , useContext} from "react";

import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [authChecked, setAuthChecked] = useState(false);

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
        : ["el registro fallo. Por favor intente de nuevo."];
      setErrors(errorMessage);
      return { ok: false };
    }
  };

  const signin = async (user) => {
    setLoading(true);
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
      return { 
        ok: true,
        data: res.data
      };
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData 
        ? (Array.isArray(errorData) ? errorData : [errorData])
        : ["el inicio de sesion fallo. Por favor intente de nuevo."];
      setErrors(errorMessage);
      return { ok: false, error: errorMessage };
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      setTimeout(() => {
        window.location.href = "/";
      }, 50);
      return { ok: true };
    } catch (error) {
      const errorMessage = error.response?.data || ["la salida de sesion fallo"];
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
        if (error.response?.status !== 401) {
          console.error("Error inesperado:", error);
        }
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };
    checkLogin();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,  
        signup,
        signin,
        logout,
        isAuthenticated,
        errors,
        loading,
        authChecked,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};