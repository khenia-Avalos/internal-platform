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