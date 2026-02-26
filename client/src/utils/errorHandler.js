export const handleDuplicateError = (error, setErrors) => {
  if (error.response?.data?.code === 11000) {
    const campoDuplicado = Object.keys(error.response.data.keyPattern)[0];
    
    const mensajes = {
      email: "Este correo electrónico ya está registrado. Por favor, usa otro.",
      phoneNumber: "Este número de teléfono ya está registrado. Por favor, usa otro.",
    };
    
    const mensaje = mensajes[campoDuplicado] || `El campo ${campoDuplicado} ya está en uso.`;
    setErrors([mensaje]);
    return true;
  }
  return false;
};