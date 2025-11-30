
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {createAccessToken } from '../libs/jwt.js'
import jwt from 'jsonwebtoken'
import {TOKEN_SECRET} from '../config.js'
import { sendResetPasswordEmail } from '../services/authService.js'


export const register = async ( req, res)=> {console.log(req.body)
   
   const {email, password, username} = req.body
try{

const userFound = await User.findOne ({ email });
if (userFound )
return res.status (400).json([" the emails is already in use"]);

const passwordHash = await bcrypt.hash(password, 10)

 const newUser = new User({
    username,
    email,
    password: passwordHash,
});
   const  userSaved = await newUser.save();
   const token = await createAccessToken({id: userSaved._id})
   
  res.cookie('token', token)

   res.json(
      {
        id: userSaved._id,
        username: userSaved.username,
        email: userSaved.email,
        createdAt: userSaved.createdAt,
        updatedAt: userSaved.updatedAt,
      }
    );



  } catch (error){
    res.status(500).json({message: error.message});
  } 
   
};



export const login = async ( req, res)=> {console.log(req.body)
   
   const {email, password} = req.body
try{

const userFound = await User.findOne({email});

if (!userFound)  return res.status(400).json({message: "user not found"});

const isMatch = await bcrypt.compare(password, userFound.password);
if (!isMatch) return res.status(400).json({message:"incorrect password"});


   const token = await createAccessToken({id: userFound._id})
   
  res.cookie('token', token);

   res.json(
      {
        id: userFound._id,
        username: userFound.username,
        email: userFound.email,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      }
    );



  } catch (error){
    res.status(500).json({message: error.message});
  } 
   
};


export const logout = (req, res) =>{
  res.cookie('token', "",{
    expires: new Date(0)
  });
  return res.sendStatus(200);
};

export const profile = async (req, res) => {


 const userFound =  await User.findById(req.user.id)
 if (!userFound ) return res.status(400).json({message: "user not found"});

 return res.json({
  id: userFound._id,
  username: userFound.username,
  email: userFound.email,
  createdAt: userFound.createdAt,
  updatedAt: userFound.updatedAt,
 });
};

export const verifyToken = async ( req, res) => {
  const {token}= req.cookies

  if (!token) return res.status(401).json({message: "Unauthorized"});

jwt.verify(token, TOKEN_SECRET, async(err, user)=>{
  if (err) return res.status(401).json({message: "Unauthorized"});

  const userFound = await User.findById(user.id)
  if (!userFound)  return res.status(401).json({ message:"Unauthorized"});

return res.json({
  id:userFound._id,
  username: userFound.username,
  email:userFound.email,

});
});

};


export const forgotPassword = async ( req, res)=> {console.log(req.body)
   
   const {email} = req.body

   if (!email) return res.status(400).json({success:false, message:"Email is required"  });
try{

     console.log("🔍 Llamando a sendResetPasswordEmail...");
        const response = await sendResetPasswordEmail(email);
        
        console.log("🔍 Respuesta de sendResetPasswordEmail:", response);


 if (response.success) {
      return res.status(200).json({
        success: true,
        message: response.message,
    resetLink: response.resetLink,
                resetToken: response.resetToken || "NO_TOKEN" // Para debug
      });
  }else{
    return res.status(401).json(response);
  }
} catch (error){
  console.error('Error in user login:', error);
  return res.status(500).json({
    success:false,
    message:"FAILED"
  });
}
  };


export const resetPassword = async (req, res) => {
    const {token,password} = req.body
    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        // ✅ CORRECCIÓN: Elimina las líneas con 'response' y agrega:
        if (!user || user.resetPasswordToken !== token) {
            return res.status(400).json({success: false, message: "Invalid token"});
        }

        const passwordHash = await bcrypt.hash(password, 10);
        user.password = passwordHash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        return res.status(200).json({success: true, message: "Password reset successfully"});

    } catch (error) {
        console.error('Error in reset password:', error);
        return res.status(500).json({success: false, message: "FAILED"});
    }
};



