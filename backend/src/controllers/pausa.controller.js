
import { manejarError } from '../utils/errorHandler.js'; 
import Pausa from '../models/pausa.model.js';


export const iniciarPausa = async (req, res) => {
try{
    const { doctorId, motivo } = req.body;
    
  const nuevaPausa = new Pausa({
  doctorId,
  motivo: motivo || "almuerzo",
  fecha: new Date(),        // ← fecha actual
  inicio: new Date(),       // ← hora actual
  fin: null,                // ← aún no termina
  activa: true              // ← está activa
});
   
    const pausaGuardada = await nuevaPausa.save();
    res.status(201).json(pausaGuardada);


    

}catch (error) {
     const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });

}
};

export const terminarPausa = async (req, res) => {
    
    try{

    const { id } = req.params;
    
    const pausaActualizada = await Pausa.findByIdAndUpdate(
  id,
  { 
    fin: new Date(),  
    activa: false   
  },
  { new: true }
)
    
    if (!pausaActualizada) {
      return res.status(404).json({ 
        message: "Pausa no encontrada" 
      });
    }
    
    res.json(pausaActualizada);
    

    }catch (error) {
        const errorResponse = manejarError(error);
        res.status(errorResponse.status).json({ 
            message: errorResponse.message 
        });
    }
};

export const getPausasActivas = async (req, res) => {
try {

    const { doctorId } = req.params;
    
 const pausas = await Pausa.find({ doctorId, activo: true });
    res.json(pausas);
  

}catch (error) {
  const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });

}
};