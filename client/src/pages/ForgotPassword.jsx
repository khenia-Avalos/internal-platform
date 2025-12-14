import React, { useState } from "react";
import axios from "axios"

function ForgotPassword() {
    const [email, setEmail] = React.useState("");
    const [resetToken, setResetToken] = React.useState("");
    const handleSubmit =  async(e) => {
        e.preventDefault();


try{
    const response = await axios.post(
        "http://localhost:3000/api/forgot-password",
        {
            email
        }
        );
     

             // ✅ GUARDA EL TOKEN SI VIENE EN LA RESPUESTA
            if (response.data.resetToken) {
                setResetToken(response.data.resetToken);
            } else if (response.data.resetLink) {
                // Si viene el link, extrae el token
                const url = new URL(response.data.resetLink);
                const token = url.searchParams.get("token");
                if (token) {
                    setResetToken(token);
                }
            }
    } catch (error) {
         console.error("❌ Error completo:", error);
        setResetToken("ERROR: " + error.message);
}

}

        
  return (
<div className="login-Container">

<form onSubmit={handleSubmit}>
   <h2>Forgot Password</h2> 
    <div className="form-group">
        <label>Email</label>
        <input type ="email" placeholder="Enter your email"
        value={email}
   onChange={(e) => setEmail(e.target.value)}
        
        required />
    </div>
    <button type="submit" className= 'login-btn'>Submit</button>
    </form> 
    {resetToken && (
    <div style={{marginTop: '20px', padding: '15px', background: '#f0f8ff'}}>
        <h3>Copy this token:</h3>
        <textarea 
            value={resetToken}
            readOnly
            style={{width: '100%', height: '80px', padding: '10px'}}
        />
    </div>
)}
</div>
  )
}
export default ForgotPassword;