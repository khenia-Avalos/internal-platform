import { createContext, useState, useContext, useEffect } from 'react'
import { registerRequest, loginRequest, logoutRequest, verifyTokenRequest } from '../api/auth' // ✅ Agrega logoutRequest
import Cookies from 'js-cookie'

export const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ CORRIGE: "signup" no "singup"
  const signup = async(user) => {
    try {
      const res = await registerRequest(user);
      setUser(res.data);
      setIsAuthenticated(true);
      setErrors([]);
      return { ok: true };
    } catch (error) {
      setErrors(error.response.data || "Error registering");
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
      setErrors(error.response.data || "Login failed");
      return { ok: false };
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setUser(null);
      setIsAuthenticated(false);
      return { ok: true };
    } catch (error) {
      setErrors(error.response.data || "Logout failed");
      return { ok: false };
    }
  };

  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => {
        setErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  useEffect(() => {
    const checklogin = async () => {
      const cookies = Cookies.get();
      if(!cookies.token) {
        setIsAuthenticated(false); // ✅ Agrega esto
        setUser(null); // ✅ Agrega esto
        setLoading(false);
        return;
      }

      try {
        const res = await verifyTokenRequest();
        if(!res.data) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          setIsAuthenticated(true);
          setUser(res.data);
        }
      } catch (error) {
        console.log(error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false); // ✅ Añade finally para garantizar
      }
    };
    
    checklogin();
  }, []);

  return (
    <AuthContext.Provider 
      value={{
        signup, // ✅ CORRIGE: "signup" no "singup"
        signin,
        logout,
        user,
        isAuthenticated,
        errors,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};