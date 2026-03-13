import { useState } from 'react';

export const useDelete = (deleteRequest, getRequest, setData) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id, nombre) => {
if (!window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) return;
    
    setLoading(true);
    try {
      await deleteRequest(id);
      const response = await getRequest();
      setData(response.data);
    } catch (error) {
      console.error("Error al eliminar:", error);
    } finally {
      setLoading(false);
    }
  };

  return { handleDelete, loading };
};