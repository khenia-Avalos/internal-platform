import axios from 'axios';

export const getDocumentosByPacienteRequest = async (pacienteId) => {
    return await axios.get(`/api/documentos/paciente/${pacienteId}`);
};

export const uploadDocumentoRequest = async (formData) => {
    return await axios.post('/api/documentos', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};

export const deleteDocumentoRequest = async (id) => {
    return await axios.delete(`/api/documentos/${id}`);
};