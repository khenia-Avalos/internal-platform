export const handleDuplicateError = (error, setErrors) => {
  // Opción 1: Por código (MongoDB)
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
  
  // Opción 2: Por mensaje de texto (nuevo)
  if (error.response?.data?.message?.includes("duplicate key error")) {
    if (error.response.data.message.includes("email")) {
      setErrors(["Este correo electrónico ya está registrado. Por favor, usa otro."]);
    } else if (error.response.data.message.includes("phoneNumber")) {
      setErrors(["Este número de teléfono ya está registrado. Por favor, usa otro."]);
    } else {
      setErrors(["Error: dato duplicado en la base de datos."]);
    }
    return true;
  }
  
  return false;
};