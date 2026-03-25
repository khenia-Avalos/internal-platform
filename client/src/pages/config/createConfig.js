  
  export const createConfig = {
  registerDoctor: {
  title: "Nuevo Doctor",
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
      },
  {
  name: "especialidad",
  type: "select",
  label: "Especialidad",
  options: ["Medicina General", "Groomer", "Cirugía"],
  validation: { required: "La especialidad es requerida" }
}
  ],
  submitLabel: "Crear Doctor",
  redirect: {}  
},

registerCliente: {
  title: "Nuevo Cliente",
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
      },
    {
      name: "cedula",
      type: "text",
      label: "Cédula",
      placeholder: "000000000",
      validation: { required: "La cédula es requerida" }
    },
    {
      name: "direccion",
      type: "text",
      label: "Dirección",
      placeholder: "Dirección exacta",
      validation: { required: "La dirección es requerida" }
    }
  ],
  submitLabel: "Crear Cliente",
  redirect: {}
},




registerPaciente: {
  title: "Nuevo Paciente",
  fields: [
   {
        name: "nombre",
        type: "text",
        label: "Nombre",
        placeholder: "Tu nombre",
        validation: {
          required: "El nombre es requerido"
        }
      },
    {
  name: "especie",
  type: "select",
  label: "Especie",
  options: ['perro', 'gato', 'ave', 'conejo', 'otro'],
  validation: { required: "La especie es requerida" }
},
      {
        name: "raza",
        type: "text",
        label: "Raza",
        placeholder: "Raza del paciente",
        validation: {
        }
      },
      {
        name: "edad",
        type: "number",
        label: "Edad",
        placeholder: "Edad del paciente",
        validation: {
          required: "La edad es requerida"
        }
      },
      {
        name: "sexo",
        type: "select",
        label: "Sexo",
        options: ["Macho", "Hembra"],
        validation: {
          required: "El sexo es requerido"
        }
      },
      {
        name: "colorPelaje",
        type: "text",
        label: "Color de pelaje",
        placeholder: "Color de pelaje del paciente",
        validation: {
        }
      },
      {
        name: "peso",
        type: "text",
        label: "Peso",
        placeholder: "Peso del paciente",
        validation: {
        }
      },
           {
        name: "pesoUnidad",
        type: "select",
        label: "Peso",
        placeholder: "Peso del paciente",
        options: ["kg", "lb", "g"],
        validation: {
        }
      },
      {
        name: "temperatura",
        type: "number",
        label: "Temperatura",
        placeholder: "Temperatura del paciente",
        validation: {
        }
      },
      {
        name: "antecedentesMedicos",
        type: "textarea",
        label: "Antecedentes Médicos",
        placeholder: "Antecedentes médicos del paciente",
        validation: {
        
        }
      },
      {
  name: "ownerId",
  type: "select",
  label: "Dueño",
  isSearchable: true,  
  options: [],  // ← Se llenará desde la BD
  validation: { required: "El dueño es requerido" }
}
           
    
  ],
  submitLabel: "Crear Cliente",
  redirect: {}
},
internado: {
  title: "Registrar Internado",
  fields: [
    {
      name: "fechaIngreso",
      type: "date",
      label: "Fecha de ingreso",
      validation: { required: "La fecha de ingreso es requerida" }
    },
    {
      name: "fechaEgreso",
      type: "date",
      label: "Fecha de egreso (opcional)"
    },
    {
      name: "medicamento",
      type: "text",
      label: "Medicamento",
      placeholder: "Nombre del medicamento"
    },
    {
      name: "via",
      type: "text",
      label: "Vía de administración",
      placeholder: "Oral, intravenosa, etc."
    },
    {
      name: "dosis",
      type: "text",
      label: "Dosis",
      placeholder: "500mg, 1 tableta, etc."
    },
    {
      name: "notas",
      type: "textarea",
      label: "Notas",
      placeholder: "Observaciones adicionales"
    }
  ],
  submitLabel: "Guardar Internado"
},
registerCita: {
  title: "Agendar Cita",
  fields: [
    {
      name: "titulo",
      type: "text",
      label: "Título de la cita",
      placeholder: "Ej: Consulta general",
      validation: { required: "El título es requerido" }
    },
    {
      name: "fecha",
      type: "date",
      label: "Fecha",
      validation: { required: "La fecha es requerida" }
    },
    {
      name: "doctorId",
      type: "select",
      label: "Veterinario",
      options: [], // se llena desde BD
      isSearchable: true,
      validation: { required: "El veterinario es requerido" }
    },
    {
      name: "tipoCita",
      type: "select",
      label: "Tipo de cita",
      options: [
        { value: "consulta", label: "Consulta general" },
        { value: "vacunacion", label: "Vacunación" },
        { value: "cirugia", label: "Cirugía" },
        { value: "estetica", label: "Estética (baño, corte)" }
      ],
      validation: { required: "El tipo de cita es requerido" }
    },
    {
      name: "descripcion",
      type: "textarea",
      label: "Descripción",
      placeholder: "Detalles adicionales sobre la cita"
    },
    {
      name: "notas",
      type: "textarea",
      label: "Notas adicionales",
      placeholder: "Observaciones importantes"
    }
  ],
  submitLabel: "Agendar Cita"
}
};
