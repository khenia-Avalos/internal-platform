export const formConfig = {
  register: {
    title:"Create your account",
    fields: [
      {
        name: "username",
        type: "text",
        label: "Nombre",
        placeholder: "Tu nombre",
        validation: {
          required: "El nombre es requerido"
        }
      },
      {
        name: "lastname",
        type: "text",
        label: "Apellido",
        placeholder: "Tu apellido",
        validation: {
          required: "El apellido es requerido"
        }
      },
      {
        name: "phoneNumber",
        type: "tel",
        label: "Número de teléfono",
        placeholder: "+50670983832",
        validation: {
          required: "El número de teléfono con código de país es requerido",
          pattern: {
            value: /^\+\d{1,4}[0-9\s\-]{8,15}$/,
            message: "Formato: +50670983832 o +506 7098 3832"
          },
          validate: {
            minDigits: (value) => {
              const digitsOnly = value.replace(/\D/g, '');
              return digitsOnly.length >= 9 || "Mínimo 9 dígitos en total";
            },
            validCountryCode: (value) => {
              return /^\+\d{1,4}/.test(value) || 
                "Debe comenzar con + y el código de país";
            }
          }
        },
        helperText: "Incluye código de país (+506 Costa Rica, +1 USA/Canadá, +52 México, etc.)"
      },
      {
        name: "email",
        type: "email",
        label: "Correo electrónico",
        placeholder: "tu@email.com",
        validation: {
          required: "El email es requerido",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email inválido"
          }
        }
      },
      {
        name: "password",
        type: "password",
        label: "Contraseña",
        placeholder: "••••••••",
        showToggle: true,
        validation: {
          required: "La contraseña es requerida"
        }
      }
      
    ],
     redirect: {  // ← AÑADE AQUÍ para register
      text: "¿Ya tienes una cuenta?",
      links: [
        {
          linkText: "login here",
          to: "/login",
          className: "text-cyan-600 font-semibold hover:text-cyan-700"
        }
      ]
    },
    submitLabel:"registrarse"
    
  },
    
 
  
  login: {
    title:"LOGIN",
    fields: [
      {
        name: "email",
        type: "email",
        label: "Correo electrónico",
        placeholder: "tu@email.com",
        validation: {
          required: "El email es requerido",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email inválido"
          }
        }
      },
      {
        name: "password",
        type: "password",
        label: "Contraseña",
        placeholder: "••••••••",
        showToggle: true,
        validation: {
          required: "La contraseña es requerida"
        }
      }
    ],
     redirect: {  // ← AÑADE AQUÍ para login
      text: "¿No tienes una cuenta?",
      links: [
        {
          linkText: "Regístrate",
          to: "/register",
          className: "inline-block bg-white text-cyan-600 border border-cyan-600 px-4 py-1 rounded-md hover:bg-cyan-50 transition"
        },
        { separator: true },
        {
          linkText: "¿Olvidaste tu contraseña?",
          to: "/forgot-password",
          className: "text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200 underline"
        }
      ]
    },
        submitLabel:"Iniciar sesion"
  },
  
  forgot: {
    title:"Forgot password",
    fields: [
      {
        name: "email",
        type: "email",
        label: "Correo electrónico",
        placeholder: "tu@email.com",
        validation: {
          required: "El email es requerido",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email inválido"
            
          }
        }
      }
    ],
     
  redirect: {  
    links: [
      {
        linkText: "← Back to Login",
        to: "/login",
        className: "text-cyan-600 hover:text-cyan-700 font-medium"
      }
    ]
  },
        submitLabel:"submit"
  },
  
  reset: {
    title:"Reset password",
    fields: [
      {
        name: "password",
        type: "password",
        label: "Nueva contraseña",
        placeholder: "••••••••",
        showToggle: true,
        validation: {
          required: "La nueva contraseña es requerida",
          minLength: {
            value: 6,
            message: "Mínimo 6 caracteres"
          }
        }
      },
      {
        name: "confirmPassword",
        type: "password",
        label: "Confirmar contraseña",
        placeholder: "••••••••",
        showToggle: true,
        validation: {
          required: "Confirma tu contraseña",
          validate: (value, allValues) => 
            value === allValues.password || "Las contraseñas no coinciden"
        }
      }
    ],
     redirect: {  // ← AÑADE AQUÍ para resetPassword
      text: "regresar al login",
      links: [
        {
          linkText: "login",
          to: "/login",
          className: "text-sm text-gray-600 hover:text-gray-800 underline"
        }
      ]
    },
        submitLabel:"enviar"
  }
};