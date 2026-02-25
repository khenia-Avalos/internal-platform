import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import axios from "axios";

function DoctoresPage(){

const [doctores, setDoctores] = useState([]);  // ← array vacío para la lista

useEffect(() => {
  const obtenerDoctores = async () => {
    try {
      // 1. Hacer petición GET
      // 2. Guardar respuesta en setDoctores
    } catch (error) {
      // 3. Manejar error
    }
  };
  
  obtenerDoctores(); 
}, []);

   return (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold">Gestión de Doctores</h1>
      <button className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700">
        + Nuevo Doctor
      </button>
    </div>

    {doctores.length === 0 ? (
      <p className="text-gray-500">No hay doctores. Crea el primero.</p>
    ) : (
      <table>
        {/* aquí irá la tabla cuando haya datos */}
      </table>
    )}
  </div>
);
}
export default DoctoresPage