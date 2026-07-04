import {Router} from 'express'
import { 
  login, 
  logout, 
  profile, 
  verifyToken, 
  forgotPassword, 
  resetPassword, 
  createRecepcion
} from '../controllers/auth.controller.js'
import { validateToken } from "../middlewares/validateToken.js";
import  { validateSchema} from '../middlewares/validator.middleware.js'
import {registerSchema, loginSchema} from '../schemas/auth.schema.js'

const router = Router()

// 🔥 RUTA DE PRUEBA - PRIMERO PARA VERIFICAR QUE EL ROUTER FUNCIONA
router.get('/test', (req, res) => {
  console.log('🔥🔥🔥 RUTA TEST FUNCIONA 🔥🔥🔥');
  res.json({ message: 'Auth router funciona' });
});

// 🔥 RUTAS ESPECÍFICAS - VAN DESPUÉS DE LAS DE PRUEBA
router.post('/create-recepcion', validateToken, createRecepcion);

// router.post('/register',validateSchema(registerSchema), register);
router.post('/login', validateSchema(loginSchema), login);
router.post('/logout', logout);
router.get('/profile', validateToken, profile)
router.get('/verify', validateToken, verifyToken)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;