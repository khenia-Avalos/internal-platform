import React from "react";
import { useState, useEffect } from "react";
import {DynamicForm} from "../../components/DynamicForm";
import { formConfig } from "../formConfig";
import { getDoctoresRequest } from "/src/api/doctores";
import { createDoctorRequest } from "/src/api/doctores"

function DoctoresPage(){

const [doctores, setDoctores] = useState([]);  // ← array vacío para la lista
const [mostrarFormulario, setMostrarFormulario] = useState(false);// ← para controlar el formulario

const handleCreateDoctor = async (data) => {
  try {
 await createDoctorRequest(data);      // 1. Crear el doctor
  setMostrarFormulario(false);           // 2. Ocultar formulario
  const response = await getDoctoresRequest(); // 3. Recargar lista
  setDoctores(response.data);            // 4. Actualizar estado
  }catch(error){
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

   return (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gestión de Doctores</h1>
      <button   onClick={() => setMostrarFormulario(true)} 
      className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">
        + Nuevo Doctor
      </button>
    </div>


{mostrarFormulario && (
  <div className="mb-6">
    <DynamicForm 
      {...formConfig.registerDoctor}
      onSubmit={handleCreateDoctor}
    />
  </div>
)}
    {doctores.length === 0 ? (



      <p className="text-gray-500">No hay doctores. Crea el primero.</p>
    ) : (
      <table>
      </table>
    )}
  </div>
);
}
export default DoctoresPage