import { createContext, useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
import {
  loginRequest,
  logoutRequest,
  registerRequest,
  verifyTokenRequest,
} from "../api/auth";

export const AuthContext = createContext();

// ✅ AÑADE ESTO - Soluciona el error de build
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {  // ✅ Mantiene 'children'
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
      setErrors(error.response?.data || ["Error registering"]); // ✅ Optional chaining
      return { ok: false };
    }
  };

  const signin = async (user) => {
    try {
      const res = await loginRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
      return { ok: true };
    } catch (error) {
      setErrors(error.response?.data || ["Login failed"]);
      return { ok: false };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      Cookies.remove('token'); // ✅ Limpieza opcional
      setUser(null);
      setIsAuthenticated(false);
      return { ok: true };
    } catch (error) {
      setErrors(error.response?.data || ["Logout failed"]);
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
    let isActive = true; // ✅ Simple cleanup

    const checkLogin = async () => {
      // ✅ Verificación optimizada con cookies
      const cookies = Cookies.get();
      if (!cookies.token) {
        if (isActive) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
        }
        return;
      }

      try {
        const res = await verifyTokenRequest();
        if (!isActive) return;

        if (!res.data) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        if (!isActive) return;
        console.log(error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    checkLogin();

    return () => {
      isActive = false; // ✅ Cleanup simple
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