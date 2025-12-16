import React, { useState } from "react";
import axios from "axios"


function ForgotPassword() {
    const [email, setEmail] = React.useState("");
    const [resetToken, setResetToken] = React.useState("");
    const [message, setMessage] = React.useState("");
    const [error, setError] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const handleSubmit =  async(e) => {
        e.preventDefault();
        setLoading (true);
        setMessage("");
        setError("");
        setResetToken("");


try{
    // Solución temporal para trabajar en ambos entornos
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://backend-internal-platform.onrender.com';

const response = await axios.post(
    `${API_URL}/api/forgot-password`,
    { email }
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
             //MUESTRA MENSAJE DE CONFIRMACIÓN
            if (response.data.success) {
                setMessage(response.data.message || "¡Email enviado! Revisa tu bandeja de entrada.");
                
                // Mensaje adicional sobre SPAM
                setTimeout(() => {
                    setMessage(prev => prev + " (Revisa la carpeta de SPAM o Promociones si no lo encuentras)");
                }, 500);
                
                // Limpia el formulario después de 3 segundos
                setTimeout(() => {
                    setEmail("");
                }, 3000);
            } else {
                setError(response.data.message || "Hubo un error. Intenta nuevamente.");
            }
    } catch (error) {
         console.error("❌ Error completo:", error);
        setResetToken("ERROR: " + error.message);
           } finally {  // ← ¡ESTE BLOQUE FALTA!
            setLoading(false); // ¡IMPORTANTE! Desactiva el loading
        }
    };


        
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
        disabled={loading} />
    </div>
    <button 
                    type="submit" 
                    className='login-btn'
                    disabled={loading} // Deshabilitar mientras carga
                >
                    {loading ? "Enviando..." : "Submit"}
                </button>
    </form> 
   {/* ✅ MENSAJE DE CONFIRMACIÓN */}
            {message && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#e8f5e9',
                    border: '1px solid #4caf50',
                    borderRadius: '8px',
                    color: '#2e7d32'
                }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>✅ ¡Email Enviado!</h4>
                    <p style={{ margin: '5px 0' }}>{message}</p>
                </div>
            )}

            {/* ✅ MENSAJE DE ERROR */}
            {error && (
                <div style={{
                    marginTop: '20px',
                    padding: '15px',
                    background: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '8px',
                    color: '#d32f2f'
                }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>❌ Error</h4>
                    <p>{error}</p>
                </div>
            )}
</div>
  )
}
export default ForgotPassword;