import axios from 'axios';

// 🔥 URL COMPLETA DEL BACKEND
const API_URL = 'https://el-exito-internal-platform.onrender.com';

// Obtener documentos por paciente
export const getDocumentosByPacienteRequest = async (pacienteId) => {
    console.log('🔍 GET a:', `${API_URL}/api/documentos/paciente/${pacienteId}`);
    return await axios.get(`${API_URL}/api/documentos/paciente/${pacienteId}`);
};

// Subir documento
export const uploadDocumentoRequest = async (formData) => {
    console.log('📤 POST a:', `${API_URL}/api/documentos`);
    return await axios.post(`${API_URL}/api/documentos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

// Eliminar documento
export const deleteDocumentoRequest = async (id) => {
    console.log('🗑️ DELETE a:', `${API_URL}/api/documentos/${id}`);
    return await axios.delete(`${API_URL}/api/documentos/${id}`);
};