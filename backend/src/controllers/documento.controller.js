import Documento from '../models/documento.model.js';
import { manejarError } from '../utils/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');

// Obtener documentos por paciente
export const getDocumentosByPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        const documentos = await Documento.find({ pacienteId })
            .populate('subidoPor', 'username')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: documentos });
    } catch (error) {
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// Subir documento
export const uploadDocumento = async (req, res) => {
    try {
        const { pacienteId, nombre, tipo, descripcion } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No se ha subido ningún archivo' 
            });
        }

        const nuevoDocumento = new Documento({
            pacienteId,
            nombre: nombre || req.file.originalname,
            tipo: tipo || 'otro',
            descripcion: descripcion || '',
            url: `/uploads/${req.file.filename}`,
            filename: req.file.filename,
            subidoPor: req.user.id
        });

        const guardado = await nuevoDocumento.save();
        res.status(201).json({ 
            success: true, 
            message: 'Documento subido exitosamente',
            data: guardado 
        });
    } catch (error) {
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// 🔥 DOWNLOAD - VERSIÓN SIMPLIFICADA
export const downloadDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findById(id);
        
        if (!documento) {
            return res.status(404).json({ message: 'Documento no encontrado' });
        }

        const filePath = path.join(uploadDir, documento.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Archivo no encontrado' });
        }

        // 🔥 Enviar el archivo directamente
        res.download(filePath, documento.nombre);
        
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Eliminar documento
export const deleteDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findById(id);
        
        if (!documento) {
            return res.status(404).json({ 
                success: false,
                message: 'Documento no encontrado' 
            });
        }

        if (documento.filename) {
            const filePath = path.join(uploadDir, documento.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await documento.deleteOne();
        res.json({ 
            success: true, 
            message: 'Documento eliminado exitosamente' 
        });
    } catch (error) {
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};