// Crear nuevo registro clínico
export const createHistorial = async (req, res) => {
  try {
    // 🔥 Verificar rol (solo admin y doctor)
    const userRole = req.user?.role;
    if (userRole !== 'admin' && userRole !== 'doctor') {
      return res.status(403).json({ 
        message: 'No tienes permisos para crear registros clínicos' 
      });
    }

    // ... resto del código igual
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Actualizar registro clínico
export const updateHistorial = async (req, res) => {
  try {
    // 🔥 Verificar rol (solo admin y doctor)
    const userRole = req.user?.role;
    if (userRole !== 'admin' && userRole !== 'doctor') {
      return res.status(403).json({ 
        message: 'No tienes permisos para actualizar registros clínicos' 
      });
    }

    // ... resto del código igual
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};

// Eliminar registro clínico
export const deleteHistorial = async (req, res) => {
  try {
    //  Verificar rol (solo admin)
    const userRole = req.user?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ 
        message: 'No tienes permisos para eliminar registros clínicos' 
      });
    }

    // ... resto del código igual
  } catch (error) {
    const errorResponse = manejarError(error);
    res.status(errorResponse.status).json({ 
      message: errorResponse.message 
    });
  }
};