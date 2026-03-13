// frontend/src/utils/apiErrorHandler.js

/**
 * Manejador genérico de errores de API para el frontend
 * @param {Error} error - El error de axios
 * @param {function} setErrors - Función para actualizar el estado de errores
 * @param {function} setSuccessMessage - (Opcional) Función para limpiar mensajes de éxito
 */
export const manejarErrorResponse = (error, setErrors, setSuccessMessage = null) => {
  console.error("Error en API:", error);
  
  // Limpiar mensaje de éxito si existe
  if (setSuccessMessage) {
    setSuccessMessage("");
  }

  if (error.response) {
    // El backend respondió con un error (status 4xx o 5xx)
    const { status, data } = error.response;
    
    // El backend YA envía mensajes traducidos en data.message
    if (data?.message) {
      // Si es un array, lo usamos directamente
      if (Array.isArray(data.message)) {
        setErrors(data.message);
      } else {
        // Si es string, lo convertimos a array
        setErrors([data.message]);
      }
    } else {
      // Si no hay mensaje, usamos uno genérico según el status
      switch (status) {
        case 400:
          setErrors(["Solicitud incorrecta. Verifica los datos."]);
          break;
        case 401:
          setErrors(["Sesión expirada. Por favor inicia sesión nuevamente."]);
          break;
        case 403:
          setErrors(["No tienes permisos para realizar esta acción."]);
          break;
        case 404:
          setErrors(["El recurso solicitado no existe."]);
          break;
        case 500:
          setErrors(["Error interno del servidor. Intenta más tarde."]);
          break;
        default:
          setErrors([`Error ${status}`]);
      }
    }
  } else if (error.request) {
    // La petición se hizo pero no se recibió respuesta
    setErrors(["No se pudo conectar al servidor. Verifica tu conexión a internet."]);
  } else {
    // Error al configurar la petición
    setErrors(["Error al procesar la solicitud."]);
  }

  // Opcional: Limpiar errores automáticamente después de 5 segundos
  setTimeout(() => {
    setErrors([]);
  }, 5000);
};

// Versión simplificada si solo quieres lo básico
export const manejarErrorSimple = (error, setErrors) => {
  const mensaje = error.response?.data?.message || "Error de conexión";
  setErrors(Array.isArray(mensaje) ? mensaje : [mensaje]);
  
  // Auto-limpiar después de 5 segundos
  setTimeout(() => setErrors([]), 5000);
};