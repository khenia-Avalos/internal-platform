
import axios from "axios";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useState } from "react";

function ForgotPassword() {
    const {
        register,
        handleSubmit,
        formState:{errors,isSubmitting},
        reset,
     
    }=useForm();


const [message, setMessage]=useState("");
const [apiError, setApiError] = useState("");
const [resetToken, setResetToken] = useState("");

const onSubmit = async (data) => {
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

  return (
    <div className="flex h-[calc(100vh-100px)] justify-center items-center">
      <div className="bg-white max-w-md w-full p-10 rounded-md shadow-md">
       
      <form onSubmit={handleSubmit(onSubmit)}>

   <Link
  to="/"
  className="text-2xl font-bold text-cyan-600 text-center mb-6 block"
>
  AgendaPro
</Link>
          <h1 className="text-2xl font-bold text-zinc-300 text-center mb-6">
           Forgot Password
          </h1>


       
      <div className="mb-4">
            <input
              type="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              className="w-full bg-white text-zinc-700 px-4 py-2 rounded-md my-2 border border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 disabled:opacity-50"
              placeholder="Enter your email"
              disabled={isSubmitting}
            />
        
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>


 <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-cyan-600 text-white py-3 rounded-md hover:bg-cyan-700 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Enviando..." : "Submit"}
          </button>
        </form>

  
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h4 className="text-green-800 font-semibold">¡Email Enviado!</h4>
            </div>
            <p className="text-green-700 mt-2">{message}</p>
          </div>
        )}

    
        {apiError && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h4 className="text-red-800 font-semibold">Error</h4>
            </div>
            <p className="text-red-700 mt-2">{apiError}</p>
          </div>
        )}

  
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;