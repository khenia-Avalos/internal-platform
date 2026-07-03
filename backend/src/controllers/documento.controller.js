import Documento from '../models/documento.model.js';
import { v2 as cloudinary } from 'cloudinary';
import { manejarError } from '../utils/errorHandler.js';

// Obtener documentos por paciente
export const getDocumentosByPaciente = async (req, res) => {
    try {
        const { pacienteId } = req.params;
        console.log('🔍 Buscando documentos para paciente:', pacienteId);
        
        const documentos = await Documento.find({ pacienteId })
            .populate('subidoPor', 'username')
            .sort({ createdAt: -1 });
        
        console.log(`✅ Encontrados ${documentos.length} documentos`);
        res.json({ success: true, data: documentos });
    } catch (error) {
        console.error('❌ Error en getDocumentosByPaciente:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// Subir documento - CORREGIDO para que sea público
export const uploadDocumento = async (req, res) => {
    try {
        console.log('📝 uploadDocumento - Inicio');
        console.log('📝 Body:', req.body);
        console.log('📝 File:', req.file);
        
        const { pacienteId, nombre, tipo, descripcion } = req.body;
        
        if (!req.file) {
            console.log('❌ No hay archivo');
            return res.status(400).json({ 
                success: false,
                message: 'No se ha subido ningún archivo' 
            });
        }

        console.log('✅ Archivo recibido:', req.file.originalname);
        console.log('📤 Subiendo a Cloudinary...');

        // 🔥 Subir con opciones para que sea público
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'expedientes',
            resource_type: 'auto',
            allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
            access_mode: 'public' // ← 🔥 ESTO HACE QUE EL ARCHIVO SEA PÚBLICO
        });

        console.log('✅ Subido a Cloudinary:', result.secure_url);
        console.log('📝 Public ID:', result.public_id);

        const nuevoDocumento = new Documento({
            pacienteId,
            nombre: nombre || req.file.originalname,
            tipo: tipo || 'otro',
            descripcion: descripcion || '',
            url: result.secure_url,
            publicId: result.public_id,
            subidoPor: req.user.id
        });

        console.log('📝 Guardando en MongoDB...');
        const guardado = await nuevoDocumento.save();
        console.log('✅ Documento guardado con ID:', guardado._id);
        
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
        console.log('🗑️ Eliminando documento:', id);
        
        const documento = await Documento.findById(id);
        
        if (!documento) {
            console.log('❌ Documento no encontrado');
            return res.status(404).json({ 
                success: false,
                message: 'Documento no encontrado' 
            });
        }

        console.log('📤 Eliminando de Cloudinary...');
        // Eliminar de Cloudinary
        if (documento.publicId) {
            await cloudinary.uploader.destroy(documento.publicId);
            console.log('✅ Eliminado de Cloudinary');
        }

        await documento.deleteOne();
        console.log('✅ Documento eliminado de MongoDB');
        
        res.json({ 
            success: true, 
            message: 'Documento eliminado exitosamente' 
        });
    } catch (error) {
        console.error('❌ Error al eliminar documento:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};