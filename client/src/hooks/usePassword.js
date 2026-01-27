import axios from "axios";
import { useEffect, useState } from "react";


export const usePassword =()=>{
  const [resetToken, setResetToken] = useState("");
  const [apiError, setApiError] = useState("");
const [message, setMessage]=useState("");




const forgotPassword = async (data) => {
    setMessage("");
    setApiError("");
    setResetToken("");

    try {
      // Solución temporal para trabajar en ambos entornos
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/forgot-password`, {
        email: data.email,
      });

      // ✅ GUARDA EL TOKEN SI VIENE EN LA RESPUESTA
      if (response.data.resetToken) {
        setResetToken(response.data.resetToken);
      } else if (response.data.debug?.resetLink) {
        // Si viene el link, extrae el token
        const url = new URL(response.data.debug.resetLink);
        const token = url.searchParams.get("token");
        if (token) setResetToken(token);
        }else if (response.data.resetLink){
            const url= new URL(response.data.resetLink);
            const token = url.searchParams.get("token")
            if (token) setResetToken(token);

        }
      
      //MUESTRA MENSAJE DE CONFIRMACIÓN
      if (response.data.success) {
        setMessage(
          response.data.message ||
            "¡Email enviado! Revisa tu bandeja de entrada."
        );

        setTimeout(() => {
          setMessage(
            (prev) =>
              prev +
              " (Revisa la carpeta de SPAM o Promociones si no lo encuentras)"
          );
        }, 500);

   // Limpia el formulario
        reset({ email: "" });

        // Para desarrollo: muestra el token si existe
        if (resetToken && process.env.NODE_ENV === "development") {
          console.log("Token de desarrollo:", resetToken);
        }
      } else {
        // Si el backend devuelve error pero con success: false
        setApiError(response.data.message || "Hubo un error. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("❌ Error completo:", error);
      
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
    }
  };





   const resetPassword = async (data) => {
    setApiError("");

    if (!resetToken) {
      setApiError("No reset token available.");
      return;
    }

    try {
      const API_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:3000"
          : "https://backend-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/reset-password`, {
        token: resetToken,
        password: data.password,
      });

      if (
        response.data.success ||
        (Array.isArray(response.data) &&
          response.data.includes("Password reset successfully"))
      ) {
        setSuccess(true);
        reset(); // Limpia el formulario
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
    }
  };



}