import React from "react";
import { useState, useEffect } from "react";
import { DynamicForm } from "../../components/DynamicForm";
import { formConfig } from "../formConfig";
import { 
  getDoctoresRequest, 
  createDoctorRequest, 
  updateDoctorRequest, 
  deleteDoctorRequest 
} from "/src/api/doctores";
import { DataTable } from "../../components/DataTable";
import { useDelete } from "../../hooks/useDelete";
import { useEdit } from "../../hooks/useEdit";

function DoctoresPage() {
  const [doctores, setDoctores] = useState([]);//lista de doctores obtenida del backend
  const [mostrarFormulario, setMostrarFormulario] = useState(false);//controla la visibilidad del formulario de creación
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);//almacena el doctor seleccionado para edición

  const handleCreateDoctor = async (data) => {
    try {
      await createDoctorRequest(data);
      setMostrarFormulario(false);
      const response = await getDoctoresRequest();
      setDoctores(response.data);
    } catch (error) {
      console.error("Error al crear doctor:", error);
    }
  };

  useEffect(() => {
    const obtenerDoctores = async () => {
      try {
        const response = await getDoctoresRequest();
        setDoctores(response.data);
      } catch (error) {
        console.error("Error al obtener doctores:", error);
      }
    };
    obtenerDoctores();
  }, []);

  const { handleDelete: handleDeleteDoctor } = useDelete(
    deleteDoctorRequest,
    getDoctoresRequest,
    setDoctores
  );

  const {
    showForm: showEditForm,
    errors: editErrors,
    successMessage: editSuccessMessage,
    handleEdit,
    handleUpdate,
    handleCancel
  } = useEdit({
    itemToEdit: doctorSeleccionado,
    config: formConfig.registerDoctor,
    updateRequest: updateDoctorRequest,
    onSuccess: async () => {
      const response = await getDoctoresRequest();
      setDoctores(response.data);
    },
    successMessageText: "Doctor actualizado correctamente"
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Doctores</h1>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          + Nuevo Doctor
        </button>
      </div>

      {/* Formulario de creación */}
      {mostrarFormulario && (
        <div className="mb-6">
          <DynamicForm
            {...formConfig.registerDoctor}
            onSubmit={handleCreateDoctor}
          />
        </div>
      )}

      {/* Formulario de edición */}
      {showEditForm && (
        <div className="mb-6">
          <DynamicForm
            {...formConfig.registerDoctor}
            defaultValues={doctorSeleccionado}
            errors={editErrors}
            successMessage={editSuccessMessage}
            onSubmit={handleUpdate}
          />
          <button
            onClick={handleCancel}
            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      )}

      {doctores.length === 0 ? (
        <p className="text-gray-500">No hay doctores. Crea el primero.</p>
      ) : (
        <DataTable
          columns={[
            { header: "Nombre", accessor: "username" },
            { header: "Apellido", accessor: "lastname" },
            { header: "Email", accessor: "email" },
            { header: "Teléfono", accessor: "phoneNumber" },
            { header: "Especialidad", accessor: "especialidad" }
          ]}
          data={doctores}
          onEdit={(doctor) => {
            setDoctorSeleccionado(doctor);
            handleEdit(doctor);
          }}
          onDelete={handleDeleteDoctor}
        />
      )}
    </div>
  );
}

export default DoctoresPage;