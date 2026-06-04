// frontend/src/utils/apiErrorHandler.js
import { toast } from 'sonner';

/**
 * Manejador genérico de errores de API para el frontend
 * Muestra notificaciones con toast y opcionalmente guarda en estado
 * @param {Error} error - El error de axios
 * @param {function} setErrors - (Opcional) Función para actualizar el estado de errores
 * @param {function} setSuccessMessage - (Opcional) Función para limpiar mensajes de éxito
 */
export const manejarErrorResponse = (error, setErrors = null, setSuccessMessage = null) => {
  console.error("Error en API:", error);
  
  // Limpiar mensaje de éxito si existe
  if (setSuccessMessage) {
    setSuccessMessage("");
  }

  let mensajes = [];

  if (error.response) {
    // El backend respondió con un error (status 4xx o 5xx)
    const { status, data } = error.response;
    
    // El backend YA envía mensajes traducidos en data.message
    if (data?.message) {
      // Si es un array, lo usamos directamente
      if (Array.isArray(data.message)) {
        mensajes = data.message;
      } else {
        // Si es string, lo convertimos a array
        mensajes = [data.message];
      }
    } else {
      // Si no hay mensaje, usamos uno genérico según el status
      switch (status) {
        case 400:
          mensajes = ["Solicitud incorrecta. Verifica los datos."];
          break;
        case 401:
          mensajes = ["Sesión expirada. Por favor inicia sesión nuevamente."];
          break;
        case 403:
          mensajes = ["No tienes permisos para realizar esta acción."];
          break;
        case 404:
          mensajes = ["El recurso solicitado no existe."];
          break;
        case 500:
          mensajes = ["Error interno del servidor. Intenta más tarde."];
          break;
        default:
          mensajes = [`Error ${status}`];
      }
    }
  } else if (error.request) {
    // La petición se hizo pero no se recibió respuesta
    mensajes = ["No se pudo conectar al servidor. Verifica tu conexión a internet."];
  } else {
    // Error al configurar la petición
    mensajes = ["Error al procesar la solicitud."];
  }

  // ✅ MOSTRAR CADA ERROR CON TOAST (notificación bonita)
  mensajes.forEach(mensaje => {
    toast.error(mensaje, { duration: 5000 });
  });

  // ✅ GUARDAR EN ESTADO (opcional, por si se necesita el bloque manual)
  if (setErrors) {
    setErrors(mensajes);
    
    // Auto-limpiar errores después de 5 segundos
    setTimeout(() => {
      setErrors([]);
    }, 5000);
  }
};

// Versión simplificada
export const manejarErrorSimple = (error, setErrors = null) => {
  const mensaje = error.response?.data?.message || "Error de conexión";
  const mensajes = Array.isArray(mensaje) ? mensaje : [mensaje];
  
  // Mostrar con toast
  mensajes.forEach(msg => toast.error(msg));
  
  // Guardar en estado si existe
  if (setErrors) {
    setErrors(mensajes);
    setTimeout(() => setErrors([]), 5000);
  }
};