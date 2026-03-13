import { useState } from 'react';

export const useDelete = ({
  deleteRequest,
  getRequest,
  setData,
  itemName = "el elemento", // ← Nombre del item para mensajes
  confirmMessage = "¿Estás seguro de eliminar {item}?", // ← Mensaje personalizable
  onSuccessMessage = "{item} eliminado correctamente", // ← Mensaje de éxito
  setSuccessMessage, // ← Función para mostrar éxito
  setErrors // ← Función para mostrar errores
}) => {
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // ← Para saber qué item se está eliminando

  const handleDelete = async (id, nombreItem = "este elemento") => {
    // Reemplazar {item} en los mensajes
    const mensajeConfirmacion = confirmMessage.replace('{item}', nombreItem);
    
    if (!window.confirm(mensajeConfirmacion)) return;
    
    setLoading(true);
    setDeletingId(id);
    
    try {
      await deleteRequest(id);
      
      // Mensaje de éxito personalizado
      if (setSuccessMessage) {
        const mensajeExito = onSuccessMessage.replace('{item}', nombreItem);
        setSuccessMessage(mensajeExito);
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      
      // Recargar lista
      const response = await getRequest();
      setData(response.data);
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      
      // Mostrar error si se proporciona la función
      if (setErrors) {
        const mensajeError = error.response?.data?.message || `Error al eliminar ${nombreItem}`;
        setErrors([mensajeError]);
        
        // Limpiar error después de 5 segundos
        setTimeout(() => setErrors([]), 5000);
      }
      
    } finally {
      setLoading(false);
      setDeletingId(null);
    }
  };

  return { 
    handleDelete, 
    loading,
    deletingId  // ← Para saber qué item está siendo eliminado
  };
};