
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import {createAccessToken } from '../libs/jwt.js'
import jwt from 'jsonwebtoken'
import {NODE_ENV, TOKEN_SECRET} from '../config.js'
import { sendResetPasswordEmail } from '../services/authService.js'



const cookieOptions = {
    httpOnly: NODE_ENV === "production",
    secure: NODE_ENV === "production",
    sameSite: NODE_ENV === "production" ? "none" : "lax",
     path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
  };




export const register = async ( req, res)=>{
   const {email, password, username} = req.body

  if(!username || !email || !password){
        return res.status(400).json(["All fields are required"])
    }
    const userFound = await User.findOne({email})
    if(userFound) return res.status(400).json(["The email already exists"])




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
   
    res.cookie('token',token,cookieOptions)

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
    if(!email || !password){
        return res.status(400).json(["Email and password are required"])
    }

try{

const userFound = await User.findOne({email});

if (!userFound)  return res.status(400).json({message: "user not found"});

const isMatch = await bcrypt.compare(password, userFound.password);
if (!isMatch) return res.status(400).json({message:"incorrect password"});


   const token = await createAccessToken({id: userFound._id})
   
       res.cookie('token',token, cookieOptions)


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


export const logout = (req,res)=>{
     
    res.clearCookie('token',cookieOptions)
    return res.json({message:"logout"})

}

export const profile = async (req, res) => {

try{


 const userFound =  await User.findById(req.user.id)
 if (!userFound ) return res.status(400).json({message: "user not found"});

 return res.json({
  id: userFound._id,
  username: userFound.username,
  email: userFound.email,
  createdAt: userFound.createdAt,
  updatedAt: userFound.updatedAt,
 });
 } catch (error){
    res.status(500).json({message: error.message});
 }
};

export const verifyToken = async ( req, res) => {
  const {token}= req.cookies

  if (!token) return res.status(401).json({message: "Unauthorized"});

  try{

 
        const decoded = jwt.verify(token,TOKEN_SECRET)

  const userFound = await User.findById(decoded.id)
  if (!userFound)  return res.status(401).json({ message:"Unauthorized"});

return res.json({
  id:userFound._id,
  username: userFound.username,
  email:userFound.email,

});
  } catch (error){  
   
        return res.status(403).json("Invalid Token")
  }

};


export const forgotPassword = async ( req, res)=> {console.log(req.body)
   
   const {email} = req.body

   if (!email) return res.status(400).json({success:false, message:"Email is required"  });
try{
        const response = await sendResetPasswordEmail(email);
        


 if (response.success) {
      return res.status(200).json({
        success: true,
    message: "If an account exists with this email, you will receive password reset instructions."
      });
  }else{
    return res.status(200).json({
                success: true,
                message: "If an account exists with this email, you will receive password reset instructions."
              });
  }
} catch (error){
   console.error('Error in forgot password:', error);
  return res.status(200).json({
    success:true,
     message: "If an account exists with this email, you will receive password reset instructions."
  });
}
  };


export const resetPassword = async (req, res) => {
    const {token,password} = req.body


    if (!token || !password) {
        return res.status(400).json({ 
            success: false, 
            message: "Token and new password are required" 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: "Password must be at least 6 characters long" 
        });
    }



    try {
        const decoded = jwt.verify(token, TOKEN_SECRET);

        const user = await User.findOne({//utilizo findOne en lugar de findById para verificar el token y su expiracion
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token no expirado
        });

 
    if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        user.password = passwordHash;
        user.resetPasswordToken = undefined;//no usar null para evitar problemas con mongoose, lo marca como campo existente
        user.resetPasswordExpires = undefined;
        await user.save();

        return res.status(200).json({success: true, message: "Password reset successfully"});

    } catch (error) {
        console.error('Error in reset password:', error);
        return res.status(500).json({success: false, message: "FAILED"});
    }
};



