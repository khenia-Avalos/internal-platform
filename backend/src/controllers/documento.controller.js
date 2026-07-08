import mongoose from 'mongoose';
import Documento from '../models/documento.model.js';
import { manejarError } from '../utils/errorHandler.js';

let gfs;
const conn = mongoose.connection;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });
});

// obtener documentos por paciente
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

// subir documento a gridfs
export const uploadDocumento = async (req, res) => {
    try {
        const { pacienteId, nombre, tipo, descripcion } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                message: 'No se ha subido ningún archivo' 
            });
        }

        // guardar en gridfs
        const uploadStream = gfs.openUploadStream(
            req.file.originalname,
            {
                metadata: {
                    pacienteId,
                    nombre: nombre || req.file.originalname,
                    tipo: tipo || 'otro',
                    descripcion: descripcion || '',
                    subidoPor: req.user.id
                }
            }
        );
        
        uploadStream.write(req.file.buffer);
        uploadStream.end();

        const nuevoDocumento = new Documento({
            pacienteId,
            nombre: nombre || req.file.originalname,
            tipo: tipo || 'otro',
            descripcion: descripcion || '',
            fileId: uploadStream.id,
            tamaño: req.file.size,
            subidoPor: req.user.id
        });

        const guardado = await nuevoDocumento.save();
        res.status(201).json({ 
            success: true, 
            message: 'Documento subido exitosamente',
            data: guardado 
        });
    } catch (error) {
        console.error('Error al subir documento:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// ver y descargar documento desde gridfs
export const verDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findById(id);
        
        if (!documento) {
            return res.status(404).json({ 
                success: false,
                message: 'Documento no encontrado' 
            });
        }

        const downloadStream = gfs.openDownloadStream(documento.fileId);
        
        // forzar el content-type para pdf
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(documento.nombre)}"`);
        
        downloadStream.pipe(res);
    } catch (error) {
        console.error('Error al ver documento:', error);
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            success: false,
            message: errorResponse.message 
        });
    }
};

// eliminar documento
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

        if (documento.fileId) {
            await gfs.delete(documento.fileId);
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