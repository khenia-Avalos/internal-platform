import { useState } from 'react';

export const useEdit = (updateRequest, getRequest, setData, formConfig, resetForm) => {
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const handleEdit = (item) => {
    setItemToEdit(item);
    setShowForm(true);
  };

  const handleUpdate = async (data) => {
    try {
      await updateRequest(itemToEdit._id, data);
      setSuccessMessage("Actualizado correctamente");
      setErrors([]);
      
      setTimeout(async () => {
        setShowForm(false);
        setItemToEdit(null);
        setSuccessMessage("");
        const response = await getRequest();
        setData(response.data);
      }, 2000);
      
    } catch (error) {
      setErrors(["Error al actualizar"]);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setItemToEdit(null);
    setErrors([]);
    setSuccessMessage("");
    resetForm?.(); // Si necesitas resetear el formulario
  };

  return {
    itemToEdit,
    showForm,
    errors,
    successMessage,
    handleEdit,
    handleUpdate,
    handleCancel,
    setShowForm
  };
};