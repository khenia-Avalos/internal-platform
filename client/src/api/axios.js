import axios from "axios";

const URL = (
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
).replace(/\/$/, "");
const instance = axios.create({
  baseURL: `${URL}/api`,
  withCredentials: true,
});

// Añade interceptor para debug
instance.interceptors.request.use(config => {
  console.log('Enviando request a:', config.url);
  console.log('Con cookies:', document.cookie);
  return config;
});
export default instance;