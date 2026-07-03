import axios from 'axios';

const API_URL = 'https://el-exito-internal-platform.onrender.com';

export const getDocumentosByPacienteRequest = async (pacienteId) => {
    return await axios.get(`${API_URL}/api/documentos/paciente/${pacienteId}`);
};

export const uploadDocumentoRequest = async (formData) => {
    return await axios.post(`${API_URL}/api/documentos`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteDocumentoRequest = async (id) => {
    return await axios.delete(`${API_URL}/api/documentos/${id}`);
};

// 🔥 FUNCIÓN DE DESCARGA CORREGIDA
export const downloadDocumentoRequest = async (id) => {
    return await axios.get(`${API_URL}/api/documentos/download/${id}`, {
        responseType: 'blob' // ← Esto es CLAVE para que descargue el archivo
    });
};