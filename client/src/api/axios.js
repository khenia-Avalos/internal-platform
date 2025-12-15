import axios from "axios";

const URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
).replace(/\/$/, "");
const instance = axios.create({
  baseURL: `${URL}/api`,
  withCredentials: true,
});

instance.interceptors.request.use(config => {
  // PRIMERO intenta con localStorage (funciona en incógnito)
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');
  
  // Si no hay token local, las cookies HTTP-Only se envían automáticamente
  // (gracias a withCredentials: true)
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
export default instance;