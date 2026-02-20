import { useAuth } from "../hooks/useAuth"; 
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { DynamicForm } from "../components/DynamicForm";
import { formConfig } from "./formConfig";


 export const AuthPage = () => {
    const location = useLocation();
    const navigate =useNavigate ();
  const { signup,signin , isAuthenticated, errors,loading } = useAuth();
  
  const { pathname } = location;//destructurado
  const isRegister = pathname === "/register";
  
  


const pageConfig = {

        title: isRegister ? formConfig.register.title : formConfig.login.title,
    fields: isRegister ? formConfig.register.fields : formConfig.login.fields,//este ya incluye validacion , placeholder etc
    redirect: isRegister ? formConfig.register.redirect :formConfig.login.redirect,
    submitLabel: isRegister ? formConfig.register.submitLabel : formConfig.login.submitLabel,
    onSubmit : isRegister ? signup : signin,
    errors: errors ,                     
isLoading: loading 

}

useEffect(() => {
  
  if (isAuthenticated) {
 
    navigate("/dashboard"); 
  }
}, [isAuthenticated, navigate]); 

return (
    <DynamicForm {...pageConfig} />
)


};

