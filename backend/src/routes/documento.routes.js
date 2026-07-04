import { Router } from 'express';
import { 
    getDocumentosByPaciente,
    uploadDocumento,
    deleteDocumento
} from '../controllers/documento.controller.js';
import { validateToken, adminRequired } from '../middlewares/validateToken.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

const router = Router();

router.use(validateToken);

router.get('/paciente/:pacienteId', getDocumentosByPaciente);
router.post('/', adminRequired, upload.single('archivo'), uploadDocumento);
router.delete('/:id', adminRequired, deleteDocumento);

export default router;