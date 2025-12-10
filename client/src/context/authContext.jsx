import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'  // ✅ Importación necesaria
import { registerRequest, loginRequest, verifyTokenRequest } from '../api/auth'

export const AuthContext = createContext()

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
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const singup = async (userData) => {
        try {
            const res = await registerRequest(userData)
            console.log('Register success:', res.data)
            setUser(res.data)
            setIsAuthenticated(true);
            setErrors([])
        } catch (error) {
            console.error('Register error:', error)
            if (error.response?.data) {
                setErrors(Array.isArray(error.response.data) 
                    ? error.response.data 
                    : [error.response.data.message || "Error en el registro"]
                );
            } else {
                setErrors(["Error de conexión con el servidor"])
            }
        }
    };

    const signin = async (userData) => {
        try {
            const res = await loginRequest(userData)
            console.log('Login success:', res.data)
            setIsAuthenticated(true)
            setUser(res.data)
            setErrors([])
        } catch (error) {
            console.error('Login error:', error)
            if (error.response?.data) {
                if (Array.isArray(error.response.data)) {
                    setErrors(error.response.data)
                } else {
                    setErrors([error.response.data.message || "Credenciales inválidas"])
                }
            } else {
                setErrors(["Error de conexión con el servidor"])
            }
        }
    }

    const logout = async () => {
        try {
            await axios.get('/auth/logout', { withCredentials: true });
            console.log('Logout successful')
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            setUser(null);
        }
    }

    // Limpiar errores automáticamente después de 5 segundos
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([])
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [errors])

    // Verificar autenticación al cargar la app
    useEffect(() => {
        async function checkLogin() {
            try {
                console.log('Checking authentication...')
                const res = await verifyTokenRequest();
                
                if (res.data) {
                    console.log('User authenticated:', res.data)
                    setIsAuthenticated(true);
                    setUser(res.data);
                } else {
                    console.log('No authenticated user found')
                    setIsAuthenticated(false);
                    setUser(null);
                }
            } catch (error) {
                console.log('Not authenticated:', error.message)
                setIsAuthenticated(false);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        
        checkLogin();
    }, []);

    return (
        <AuthContext.Provider
            value={{
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