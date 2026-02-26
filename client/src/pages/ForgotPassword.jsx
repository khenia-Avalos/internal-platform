import { DynamicForm } from "../components/DynamicForm";
import { usePassword } from "../hooks/usePassword";
import { formConfig } from "../config/formConfig";

function ForgotPassword() {
const { forgotPassword, message, error, loading } = usePassword();


const handleSubmit = async (data) => {
  await forgotPassword(data.email);  
};

  return (
   
<DynamicForm
  {...formConfig.forgot}        // Campos
  onSubmit={handleSubmit}       // Función claramente nombrada
  errors={error ? [error] : []} // Error visible
  successMessage={message}      // Mensaje visible  
  isLoading={loading}           // Loading visible
/>
  );
}

export default ForgotPassword;