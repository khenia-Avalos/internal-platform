import { Router } from 'express';
import { 
    getDocumentosByPaciente,
    uploadDocumento,
    deleteDocumento,
    downloadDocumento
} from '../controllers/documento.controller.js';
import { validateToken, adminRequired } from '../middlewares/validateToken.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de multer para archivos locales
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos PDF, JPEG o PNG'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter
});

const router = Router();

router.use(validateToken);

router.get('/paciente/:pacienteId', getDocumentosByPaciente);
router.post('/', adminRequired, upload.single('archivo'), uploadDocumento);
router.delete('/:id', adminRequired, deleteDocumento);
router.get('/download/:id', downloadDocumento);

export default router;