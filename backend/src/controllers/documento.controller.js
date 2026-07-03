import Documento from '../models/documento.model.js';
import { manejarError } from '../utils/errorHandler.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Subir documento a carpeta local
export const uploadDocumento = async (req, res) => {
    try {
        console.log('📝 Subiendo documento...');
        console.log('📝 Body:', req.body);
        console.log('📝 File:', req.file);
        
        const { pacienteId, nombre, tipo, descripcion } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No se ha subido ningún archivo' 
            });
        }

        // Construir URL para acceder al archivo
        const url = `/uploads/${req.file.filename}`;

        const nuevoDocumento = new Documento({
            pacienteId,
            nombre: nombre || req.file.originalname,
            tipo: tipo || 'otro',
            descripcion: descripcion || '',
            url: url,
            filename: req.file.filename,
            subidoPor: req.user.id
        });

        const guardado = await nuevoDocumento.save();
        console.log('✅ Documento guardado en MongoDB');
        
        res.status(201).json({ 
            success: true, 
            message: 'Documento subido exitosamente',
            data: guardado 
        });
    } catch (error) {
        console.error('❌ Error al subir documento:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// Descargar documento
export const downloadDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findById(id);
        
        if (!documento) {
            return res.status(404).json({ 
                success: false,
                message: 'Documento no encontrado' 
            });
        }

        const filePath = path.join(__dirname, '../../uploads', documento.filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ 
                success: false,
                message: 'Archivo no encontrado en el servidor' 
            });
        }

        res.download(filePath, documento.nombre);
    } catch (error) {
        console.error('❌ Error al descargar documento:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
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

        // Eliminar archivo físico
        if (documento.filename) {
            const filePath = path.join(__dirname, '../../uploads', documento.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ Archivo eliminado del servidor');
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