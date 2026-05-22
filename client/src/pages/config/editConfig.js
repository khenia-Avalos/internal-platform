
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
},




editpaciente: {
  title: "Editar Paciente",
  fields: [
    {
      name: "nombre",
      type: "text",
      label: "Nombre",
      placeholder: "Tu nombre",
      validation: { required: "El nombre es requerido" }
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
      placeholder: "Raza del paciente"
    },
    {
      name: "edad",
      type: "number",
      label: "Edad",
      placeholder: "Edad del paciente",
      validation: { required: "La edad es requerida" }
    },
    {
      name: "sexo",
      type: "select",
      label: "Sexo",
      options: ["Macho", "Hembra"],
      validation: { required: "El sexo es requerido" }
    },
    {
      name: "colorPelaje",
      type: "text",
      label: "Color de pelaje",
      placeholder: "Color de pelaje del paciente"
    },
    {
      name: "peso",
      type: "text",
      label: "Peso",
      placeholder: "Peso del paciente"
    },
    {
      name: "pesoUnidad",
      type: "select",
      label: "Unidad de peso",
      options: ["kg", "lb", "g"]
    },
    {
      name: "temperatura",
      type: "number",
      label: "Temperatura",
      placeholder: "Temperatura del paciente"
    },
    {
      name: "antecedentesMedicos",
      type: "textarea",
      label: "Antecedentes Médicos",
      placeholder: "Antecedentes médicos del paciente"
    },
    {
      name: "ownerId",
      type: "select",
      label: "Dueño",
      isSearchable: true,
      options: [],
      disabled: true, // ← Campo de solo lectura
      validation: { required: "El dueño es requerido" }
    }
  ],
  submitLabel: "Actualizar Paciente",
  transformData: (formData) => {
    // Convertir peso y pesoUnidad en objeto peso
    if (formData.peso) {
      return {
        ...formData,
        peso: {
          valor: parseFloat(formData.peso),
          unidad: formData.pesoUnidad || 'kg'
        }
      };
    }
    return formData;
  }
},
//para edithorario se crea en backend en horario por defecto, luego se edita solo hora inicio, fin, intervalo y activo, el doctor no se puede cambiar, ni el dia, para no complicar la logica de horarios

editHorario: {
  title: "Editar Horario",
  fields: [
    {
      name: "horaInicio",
      type: "time",
      label: "Hora de inicio",
      validation: { required: "La hora de inicio es requerida" }
    },
    {
      name: "horaFin",
      type: "time",
      label: "Hora de fin",
      validation: { required: "La hora de fin es requerida" }
    },
    {
      name: "intervalo",
      type: "number",
      label: "Intervalo (minutos)",
      validation: { 
        required: "El intervalo es requerido",
        min: { value: 15, message: "Mínimo 15 minutos" },
        max: { value: 120, message: "Máximo 120 minutos" }
      }
    },
    {
      name: "activo",
      type: "checkbox",
      label: "Activo"
    }
  ],
  submitLabel: "Actualizar Horario"
},



editCita: {
  title: "Editar Cita",
  fields: [
    {
      name: "pacienteId",
      type: "select",
      label: "Mascota",
      isSearchable: true,
      options: [],
      disabled: true, // ← Solo lectura, no se puede cambiar la mascota
      validation: { required: "La mascota es requerida" }
    },
    {
      name: "ownerId",
      type: "select",
      label: "Dueño de la mascota",
      isSearchable: true,
      options: [],
      disabled: true,
      validation: { required: "El dueño es requerido" }
    },
    {
      name: "tipoCita",
      type: "select",
      label: "Tipo de cita",
      options: ["consulta", "vacunacion", "cirugia", "estetica"],
      validation: { required: "El tipo de cita es requerido" }
    },
    {
      name: "titulo",
      type: "text",
      label: "Título de la cita",
      placeholder: "Ej: Consulta de seguimiento"
    },
    {
      name: "descripcion",
      type: "textarea",
      label: "Descripción",
      rows: 3,
      placeholder: "Detalles de la consulta, síntomas, etc."
    },
    {
      name: "notas",
      type: "textarea",
      label: "Notas adicionales",
      rows: 2,
      placeholder: "Información adicional para el veterinario"
    }
  ],
  submitLabel: "Actualizar Cita"
}
};


