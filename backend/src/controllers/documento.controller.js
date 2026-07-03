import Documento from '../models/documento.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { manejarError } from '../utils/errorHandler.js';

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

// Subir documento - CON ACCESO PÚBLICO
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

        // Subir a Cloudinary con acceso público
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'expedientes',
            resource_type: 'auto',
            allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
            access_mode: 'public' // ← CLAVE: Hace el archivo público
        });

        console.log('✅ Subido a Cloudinary:', result.secure_url);

        const nuevoDocumento = new Documento({
            pacienteId,
            nombre: nombre || req.file.originalname,
            tipo: tipo || 'otro',
            descripcion: descripcion || '',
            url: result.secure_url,
            publicId: result.public_id,
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

        // Eliminar de Cloudinary
        if (documento.publicId) {
            await cloudinary.uploader.destroy(documento.publicId);
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