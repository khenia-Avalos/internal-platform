
import { useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { usePassword } from "../hooks/usePassword";
import { DynamicForm } from "../components/DynamicForm";
import { formConfig } from "./formConfig"; 

function ResetPassword() {
  const [resetToken, setResetToken] = useState("");
  const [success, setSuccess] = useState(false);
    const [urlError, setUrlError] = useState("");  // Para error de token en URL

  const { resetPassword, message, error, loading } = usePassword();

  const location = useLocation();
  const navigate = useNavigate();

  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      const decodedToken = decodeURIComponent(token);
      const cleanToken = decodedToken.replace(/['"]/g, "").trim();
      setResetToken(cleanToken);
    } else {
      setUrlError("No se encontró token en la URL. Verifica el link del email.");


    }
  }, [location.search]);

  const goToLogin = () => {
    navigate("/login");
  };

 
const handleSubmit = async (data) => {
  if (!resetToken) {

    return;
  }
  
  // Llama al hook
  await resetPassword(resetToken, data.password);
  
  // ✅ Verifica si fue exitoso (si hay mensaje y no hay error)
    if (message && !error) {
      setSuccess(true);
    }
  };

  // Pantalla verde de éxito
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center max-w-md w-full">
          <h3 className="text-lg font-medium text-green-800 mb-3">
            ¡Contraseña Restablecida!
          </h3>
          <p className="text-green-700 mb-6">
            Tu contraseña ha sido actualizada exitosamente.
          </p>
        
        </div>
      </div>
    );
  }

  // Combina errores: de URL y de API
  const allErrors = [];
  if (urlError) allErrors.push(urlError);
  if (error) allErrors.push(error);

  return (
    <DynamicForm
      {...formConfig.reset}
      onSubmit={handleSubmit}
      errors={allErrors}  // ✅ Combina ambos tipos de error
      successMessage={message}
      isLoading={loading}
    />
  );
}

export default ResetPassword;