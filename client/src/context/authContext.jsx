import { createContext, useEffect, useState, useContext, useRef } from "react";
import Cookies from "js-cookie";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

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
  const isMounted = useRef(true); // ✅ Para evitar actualizaciones después de desmontar

  const signup = async (userData) => { // ✅ Renombrar parámetro para evitar conflicto
    try {
      const res = await registerRequest(userData);
      if (isMounted.current) {
        setUser(res.data);
        setIsAuthenticated(true);
        setErrors([]);
      }
      return { ok: true };
    } catch (error) {
      if (isMounted.current) {
        setErrors(error.response?.data || ["Error registering"]); // ✅ Optional chaining
      }
      return { ok: false, error: error.response?.data };
    }
  };

  const signin = async (userData) => {
    try {
      const res = await loginRequest(userData);
      if (isMounted.current) {
        setUser(res.data);
        setIsAuthenticated(true);
        setErrors([]);
      }
      return { ok: true };
    } catch (error) {
      if (isMounted.current) {
        setErrors(error.response?.data || ["Login failed"]);
      }
      return { ok: false, error: error.response?.data };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      // Limpiar cookies en frontend también por si acaso
      Cookies.remove('token');
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
        setErrors([]);
      }
      return { ok: true };
    } catch (error) {
      // Aún así limpiamos el estado frontend
      Cookies.remove('token');
      if (isMounted.current) {
        setUser(null);
        setIsAuthenticated(false);
        setErrors(error.response?.data || ["Logout failed"]);
      }
      return { ok: false, error: error.response?.data };
    }
  };

  useEffect(() => {
    return () => {
      isMounted.current = false; // ✅ Cleanup al desmontar
    };
  }, []);

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          setErrors([]);
        }
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    let isSubscribed = true; // ✅ Controlar petición pendiente

    const checkLogin = async () => {
      // ✅ Verificación temprana con cookies
      const cookies = Cookies.get();
      if (!cookies.token) {
        if (isSubscribed) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await verifyTokenRequest();
        if (!isSubscribed) return;

        if (!res.data) {
          setIsAuthenticated(false);
          setUser(null);
          // Limpiar cookie inválida
          Cookies.remove('token');
        } else {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        if (!isSubscribed) return;
        console.log('Auth error:', error);
        setIsAuthenticated(false);
        setUser(null);
        Cookies.remove('token'); // ✅ Limpiar cookie en error
      } finally {
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    checkLogin();

    return () => {
      isSubscribed = false; // ✅ Cleanup
    };
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