import Documento from '../models/documento.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { manejarError } from '../utils/errorHandler.js';
import { 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET 
} from '../config.js';

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

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

export const uploadDocumento = async (req, res) => {
    try {
        const { pacienteId, nombre, tipo, descripcion } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No se ha subido ningún archivo' 
            });
        }

        // 🔥 SUBIR A CLOUDINARY - USAR CARPETA PÚBLICA
  // Después de subir a Cloudinary, agrega esto:
const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
        {
            folder: 'public_pdfs',
            resource_type: 'raw',
            allowed_formats: ['pdf'],
            access_mode: 'public',
            type: 'upload',
            format: 'pdf', // ← FORZAR FORMATO PDF
            eager: [
                { format: 'pdf' } // ← CREAR VERSIÓN EN FORMATO PDF
            ]
        },
        (error, result) => {
            if (error) reject(error);
            else resolve(result);
        }
    );
    uploadStream.end(req.file.buffer);
});

// 🔥 Generar URL con formato PDF
const url = cloudinary.url(result.public_id, {
    resource_type: 'raw',
    format: 'pdf',
    secure: true
});

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