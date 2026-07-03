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

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Formato no permitido'), false);
    }
});

const router = Router();

router.use(validateToken);

router.get('/paciente/:pacienteId', getDocumentosByPaciente);
router.post('/', adminRequired, upload.single('archivo'), uploadDocumento);
router.get('/download/:id', downloadDocumento);
router.delete('/:id', adminRequired, deleteDocumento);

export default router;