import User from '../models/user.model.js';

// Obtener todos los doctores (usuarios con rol "doctor")
export const getDoctores = async (req, res) => {
  try {
    const doctores = await User.find({ role: "doctor" }).select('-password');
    res.json(doctores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo doctor
export const createDoctor = async (req, res) => {
  try {
    const { username, lastname, email, password, phoneNumber, especialidad } = req.body;

    const newDoctor = new User({
      username,
      lastname,
      email,
      password,
      phoneNumber,
      role: "doctor",
      especialidad
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
console.log("ERROR COMPLETO:", error);
res.status(500).json({ 
  message: error.message,
  stack: error.stack 
});  }

};
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const doctorActualizado = await User.findByIdAndUpdate(id, data, { new: true });
    res.json(doctorActualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    
    const doctorEliminado = await User.findByIdAndDelete(id);
    
    if (!doctorEliminado) {
      return res.status(404).json({ message: "Doctor no encontrado" });
    }
    
    res.json({ message: "Doctor eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};