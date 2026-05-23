import axios from "axios";
import { useEffect, useState } from "react";

export const usePassword = () => {
  const [apiError, setApiError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const forgotPassword = async (email) => {
    setMessage("");
    setApiError("");
    setLoading(true);

    try {
      // ✅ USAR LA URL CORRECTA DEL BACKEND
      const API_URL = "https://el-exito-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/forgot-password`, {
        email: email,
      });

      if (response.data.success) {
        setMessage(
          response.data.message ||
            "¡Email enviado! Revisa tu bandeja de entrada."
        );
      } else {
        setApiError(response.data.message || "Hubo un error. Intenta nuevamente.");
      }
    } catch (error) {
      console.error("Error en forgotPassword:", error);
      
      if (error.response) {
        setApiError(error.response.data.message || "Error del servidor");
      } else if (error.request) {
        setApiError("Error de conexión. Verifica tu internet.");
      } else {
        setApiError("Error al procesar la solicitud.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    setApiError("");
    setLoading(true);
    setMessage("");

    try {
      const API_URL = "https://el-exito-internal-platform.onrender.com";

      const response = await axios.post(`${API_URL}/api/reset-password`, {
        token: token,
        password: newPassword,
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
        setApiError("❌ " + serverError);
      } else if (error.request) {
        setApiError("❌ Cannot connect to server. Check your internet connection.");
      } else {
        setApiError("❌ Error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    forgotPassword,
    resetPassword,
    message,
    error: apiError,
    loading,
  };
};