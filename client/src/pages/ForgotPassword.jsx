import React, { useState } from "react";
import axios from "axios"

function ForgotPassword() {
    const [email, setEmail] = React.useState("");
    const [resetToken, setResetToken] = React.useState("");
      const [loading, setLoading] = useState(false); // <-- AÑADE ESTO
    const [message, setMessage] = useState("");
    
    const handleSubmit =  async(e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");
        setResetToken("");

try{
    // Solución temporal para trabajar en ambos entornos
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://backend-internal-platform.onrender.com';

const response = await axios.post(
    `${API_URL}/api/forgot-password`,
    { email },{
         timeout: 30000, // 30 segundos timeout para Render
    }
);
console.log("✅ Respuesta:", response.data);
     

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
            
            let errorMsg = "Unknown error";
            
            if (error.code === "ECONNABORTED") {
                errorMsg = "Request timed out. Render free tier can be slow.";
            } else if (error.code === "ERR_NETWORK") {
                errorMsg = "Network error. Backend might be sleeping.";
            } else if (error.response) {
                errorMsg = `Server error: ${error.response.status}`;
            } else {
                errorMsg = error.message;
            }
            
            setResetToken("ERROR: " + errorMsg);
            setMessage("Failed to send request.");
        } finally {
            setLoading(false); // <-- DESACTIVA LOADING
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
        
   required 
                        disabled={loading} // <-- DESHABILITA MIENTRAS CARGA
                    />
    </div>
      <button 
                    type="submit" 
                    className='login-btn'
                    disabled={loading || !email} // <-- DESHABILITA SI ESTÁ CARGANDO O EMAIL VACÍO
                >
                    {loading ? "Sending..." : "Submit"} {/* <-- CAMBIA TEXTO */}
                </button>
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
  {/* AÑADE ESTO PARA MOSTRAR ERRORES */}
            {resetToken && resetToken.startsWith("ERROR:") && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px'
                }}>
                    <h4>Error:</h4>
                    <p>{resetToken.replace("ERROR: ", "")}</p>
                    <small>Note: Render free tier can take 30-50 seconds to wake up.</small>
                </div>
            )}
            
            {/* INFO ADICIONAL */}
            <div style={{
                marginTop: '20px',
                fontSize: '12px',
                color: '#666',
                padding: '10px',
                background: '#f5f5f5',
                borderRadius: '4px'
            }}>
                <p><strong>Note:</strong> Backend on Render free tier may take 30-60 seconds to respond on first request.</p>
                <p>Current target: {window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000' 
                    : 'https://backend-internal-platform.onrender.com'}</p>
            </div>
        </div>
    );
}
export default ForgotPassword;