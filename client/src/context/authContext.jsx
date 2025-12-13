import { createContext, useState, useContext, useEffect} from 'react'
import {registerRequest} from '../api/auth'
import {loginRequest, verifyTokenRequest} from '../api/auth'
import Cookies from 'js-cookie'


export const AuthContext = createContext();

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
        console.log(error);
        setIsAuthenticated(false);
        setUser(null);
      } finally{
        setLoading(false);
      }
    
    };
    checkLogin();
  }, []);





return(
    <AuthContext.Provider 
    value ={{
        singup,
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
)

}