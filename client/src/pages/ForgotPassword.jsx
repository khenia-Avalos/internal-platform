import React, { useState } from "react";
import axios from "axios"

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [resetToken, setResetToken] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [debugInfo, setDebugInfo] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResetToken("");
        setMessage("");
        setDebugInfo("");
        setLoading(true);

        try {
            // Solución temporal para trabajar en ambos entornos
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : 'https://backend-internal-platform.onrender.com';

            console.log("🔍 Enviando request a:", `${API_URL}/api/forgot-password`);
            console.log("📧 Email:", email);

            const response = await axios.post(
                `${API_URL}/api/forgot-password`,
                { email }
            );

            console.log("✅ Respuesta del backend:", response.data);
            setDebugInfo(JSON.stringify(response.data, null, 2));

            // ✅ GUARDA EL TOKEN SI VIENE EN LA RESPUESTA
            if (response.data.resetToken) {
                setResetToken(response.data.resetToken);
                setMessage("Token generado exitosamente!");
            } else if (response.data.resetLink) {
                // Si viene el link, extrae el token
                const url = new URL(response.data.resetLink);
                const token = url.searchParams.get("token");
                if (token) {
                    setResetToken(token);
                    setMessage("Token extraído del enlace!");
                }
            } else if (response.data.message) {
                // Si hay un mensaje normal
                setMessage(response.data.message);
            } else if (response.data.success) {
                setMessage("¡Correo de recuperación enviado!");
            } else {
                // Si no hay ninguna de las propiedades esperadas
                setMessage("Respuesta recibida pero no en el formato esperado.");
                setResetToken("DEBUG: " + JSON.stringify(response.data));
            }

        } catch (error) {
            console.error("❌ Error completo:", error);
            
            let errorMessage = "Error desconocido";
            
            if (error.response) {
                // El servidor respondió con un código de error
                console.log("📊 Error response data:", error.response.data);
                console.log("📊 Error response status:", error.response.status);
                
                errorMessage = `Error ${error.response.status}: `;
                if (error.response.data && Array.isArray(error.response.data)) {
                    errorMessage += error.response.data.join(", ");
                } else if (error.response.data && error.response.data.message) {
                    errorMessage += error.response.data.message;
                } else {
                    errorMessage += error.message;
                }
            } else if (error.request) {
                // La petición fue hecha pero no hubo respuesta
                errorMessage = "No se recibió respuesta del servidor. Verifica que el backend esté corriendo.";
            } else {
                // Algo pasó al configurar la petición
                errorMessage = error.message;
            }
            
            setResetToken("ERROR: " + errorMessage);
            setMessage("");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-Container">
            <form onSubmit={handleSubmit}>
                <h2>Forgot Password</h2> 
                <div className="form-group">
                    <label>Email</label>
                    <input 
                        type="email" 
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        disabled={loading}
                    />
                </div>
                <button 
                    type="submit" 
                    className='login-btn'
                    disabled={loading || !email}
                >
                    {loading ? "Enviando..." : "Submit"}
                </button>
            </form> 
            
            {/* Mostrar mensajes */}
            {message && (
                <div style={{
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    borderRadius: '4px'
                }}>
                    ✅ {message}
                </div>
            )}
            
            {/* Mostrar token si existe */}
            {resetToken && !resetToken.startsWith("ERROR:") && !resetToken.startsWith("DEBUG:") && (
                <div style={{marginTop: '20px', padding: '15px', background: '#f0f8ff'}}>
                    <h3>Copy this token:</h3>
                    <textarea 
                        value={resetToken}
                        readOnly
                        style={{width: '100%', height: '80px', padding: '10px'}}
                    />
                </div>
            )}
            
            {/* Mostrar error si existe */}
            {resetToken && resetToken.startsWith("ERROR:") && (
                <div style={{
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '4px'
                }}>
                    <h4>❌ Error:</h4>
                    <p>{resetToken.replace("ERROR: ", "")}</p>
                </div>
            )}
            
            {/* Debug info (solo en desarrollo) */}
            {debugInfo && window.location.hostname === 'localhost' && (
                <div style={{
                    marginTop: '20px', 
                    padding: '15px', 
                    background: '#fff3e0',
                    color: '#ef6c00',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace'
                }}>
                    <h4>🔧 Debug Info:</h4>
                    <pre>{debugInfo}</pre>
                </div>
            )}
            
            {/* Info de URL */}
            <div style={{
                marginTop: '20px',
                fontSize: '12px',
                color: '#666',
                padding: '10px',
                background: '#f5f5f5',
                borderRadius: '4px'
            }}>
                <strong>Información:</strong> Conectando a: {
                    window.location.hostname === 'localhost' 
                    ? 'http://localhost:3000' 
                    : 'https://backend-internal-platform.onrender.com'
                }
            </div>
        </div>
    );
}

export default ForgotPassword;