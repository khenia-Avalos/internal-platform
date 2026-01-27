import axios from "axios";
import { useEffect, useState } from "react";


export const usePassword =()=>{
  //resettoken no va porque cada componente lo usa diferente
  const [apiError, setApiError] = useState("");
const [message, setMessage]=useState("");
const [loading, setLoading] = useState(false);





const forgotPassword = async (email) => {//cambia data a email porque aqui no maneja form
    setMessage("");
    setApiError("");
setLoading(true);  // Para mostrar "cargando..."




    try {
      // Solución temporal para trabajar en ambos entornos
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/forgot-password`, {
        email: email,
      });

      //MUESTRA MENSAJE DE CONFIRMACIÓN
      if (response.data.success) {
        setMessage(
          response.data.message ||
            "¡Email enviado! Revisa tu bandeja de entrada."
        );
   
      } else {
        // Si el backend devuelve error pero con success: false
        setApiError(response.data.message || "Hubo un error. Intenta nuevamente.");
      }
    } catch (error) {
      
      
      // Manejo específico de errores de red o del servidor
      if (error.response) {
        // Error con respuesta del servidor
        setApiError(error.response.data.message || "Error del servidor");
      } else if (error.request) {
        // Error de red (sin respuesta)
        setApiError("Error de conexión. Verifica tu internet.");
      } else {
        // Error al configurar la petición
        setApiError("Error al procesar la solicitud.");
      }
   } finally {  
  setLoading(false);
}

}


   const resetPassword = async (token, newPassword) => {  // token: el token de la URL
  // newPassword: la nueva contraseña
    setApiError("");
    setLoading(true);  // Para mostrar "cargando..."
setMessage("");    // Limpia mensajes anteriores

/* 
    if (!resetToken) {
      setApiError("No reset token available.");
      return;
//     } */
// NO tienes estado resetToken

// NO es responsabilidad del hook validar si hay token

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/reset-password`, {
        token: token,
        password:newPassword,
      });

      if (
        response.data.success ||
        (Array.isArray(response.data) &&
        
          response.data.includes("Password reset successfully"))
          
      ) {
    setMessage("¡Contraseña cambiada exitosamente!"); 

      } else {
        setApiError(
          response.data?.[0] || response.data?.message || "Unknown error"
        );
      }
    } catch (error) {
      if (error.response) {
        const serverError =
          error.response.data?.[0] ||
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        setApiError(" " + serverError);
      } else if (error.request) {
        setApiError(
          " Cannot connect to server. Check your internet connection."
        );
      } else {
        setApiError(" Error: " + error.message);
      }
  } finally {
  setLoading(false);  // ✅ Se ejecuta SIEMPRE (éxito o error)
}

}

return {
  forgotPassword,
  resetPassword,
  message,
  error: apiError,  // Devuelve apiError como "error"
  loading,
};
};
