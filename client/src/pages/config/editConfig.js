
export const editConfig = {
editDoctor: {
  title: "Editar Doctor",
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
  name: "especialidad",
  type: "select",
  label: "Especialidad",
  options: ["Medicina General", "Groomer", "Cirugía"],
  validation: { required: "La especialidad es requerida" }
}
  ],
  submitLabel: "Actualizar Doctor" 
},
editCliente: {
  title: "Editar Cliente",
  fields: [
    // Mismos campos, SIN password
    {
      name: "username",
      type: "text",
      label: "Nombre",
      validation: { required: "El nombre es requerido" }
    },
    {
      name: "lastname",
      type: "text",
      label: "Apellido",
      validation: { required: "El apellido es requerido" }
    },
    {
      name: "email",
      type: "email",
      label: "Correo electrónico",
      validation: { required: "El email es requerido" }
    },
    {
      name: "phoneNumber",
      type: "tel",
      label: "Teléfono",
      validation: { required: "El teléfono es requerido" }
    },
    {
      name: "cedula",
      type: "text",
      label: "Cédula",
      validation: { required: "La cédula es requerida" }
    },
    {
      name: "direccion",
      type: "text",
      label: "Dirección",
      validation: { required: "La dirección es requerida" }
    }
  ],
  submitLabel: "Actualizar Cliente"
}
};