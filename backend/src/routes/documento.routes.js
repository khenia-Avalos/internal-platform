import { Router } from 'express';
import { 
    getDocumentosByPaciente,
    uploadDocumento,
    deleteDocumento
} from '../controllers/documento.controller.js';
import { validateToken, adminRequired } from '../middlewares/validateToken.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { 
    CLOUDINARY_CLOUD_NAME, 
    CLOUDINARY_API_KEY, 
    CLOUDINARY_API_SECRET 
} from '../config.js';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

// Configurar almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'expedientes',
        allowed_formats: ['pdf', 'jpg', 'jpeg', 'png'],
        resource_type: 'auto'
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const router = Router();

router.use(validateToken);

router.get('/paciente/:pacienteId', getDocumentosByPaciente);
router.post('/', adminRequired, upload.single('archivo'), uploadDocumento);
router.delete('/:id', adminRequired, deleteDocumento);

export default router;