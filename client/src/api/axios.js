import axios from "axios";

const URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
).replace(/\/$/, "");
const instance = axios.create({
  baseURL: `${URL}/api`,
  withCredentials: true,
});

// Interceptor para manejar errores 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar estado de autenticación
      localStorage.removeItem("token"); // si usas localStorage
      // Redirigir solo si estamos en una página protegida
      if (!window.location.pathname.includes("/login") && 
          !window.location.pathname.includes("/register")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export default instance;