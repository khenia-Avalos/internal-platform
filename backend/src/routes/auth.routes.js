import {Router} from 'express'
import { 
  login, 
  logout, 
  profile, 
  verifyToken, 
  forgotPassword, 
  resetPassword, 
  createRecepcion   // ← Asegúrate que esté importado
} from '../controllers/auth.controller.js'
import { validateToken } from "../middlewares/validateToken.js";
import  { validateSchema} from '../middlewares/validator.middleware.js'
import {registerSchema, loginSchema} from '../schemas/auth.schema.js'

const router = Router()

// 🔥 LA RUTA DEBE ESTAR ANTES DE CUALQUIER OTRA COSA
router.post('/create-recepcion', validateToken, createRecepcion);

// router.post('/register',validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);
router.get('/profile', validateToken, profile)
router.get('/verify', validateToken, verifyToken)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;