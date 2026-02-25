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
        <div>doctoresPAGE</div>
    )
}
export default DoctoresPage