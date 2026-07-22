// src/routes/documentos.routes.js

import { Router } from 'express';
import { 
    getDocumentosByPaciente,
    uploadDocumento,
    deleteDocumento,
    verDocumento
} from '../controllers/documento.controller.js';
import { 
    validateToken, 
    doctorOrRecepcionOrAdminRequired,
    canViewDocuments
} from '../middlewares/validateToken.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

// Todas las rutas requieren token
router.use(validateToken);

// GET - Clientes tambien pueden ver documentos
router.get('/paciente/:pacienteId', canViewDocuments, getDocumentosByPaciente);

// POST - Solo admin, doctor y recepcion pueden subir
router.post('/', doctorOrRecepcionOrAdminRequired, upload.single('archivo'), uploadDocumento);

// GET - Clientes tambien pueden ver documentos
router.get('/ver/:id', canViewDocuments, verDocumento);

// DELETE - Solo admin, doctor y recepcion pueden eliminar
router.delete('/:id', doctorOrRecepcionOrAdminRequired, deleteDocumento);

export default router;