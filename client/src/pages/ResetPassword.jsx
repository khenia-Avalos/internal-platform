
import React from "react";
import axios from "axios";
import {useLocation, useNavigate} from "react-router";
import { useEffect, useState } from "react";
import { set } from "mongoose";




function ResetPassword() {
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [resetToken, setResetToken] = React.useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
       
    if (token) {
        const decodedToken = decodeURIComponent(token);
          const cleanToken = decodedToken.replace(/['"]/g, '').trim();
            setResetToken(cleanToken);
    }else{
        setError("No token provided in URL");
    }
}, [location.search]);

 const goToLogin = () => {
        navigate("/login");
    };


const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    if (password !== confirmPassword) {
        alert("Passwords do not match");
       setLoading(false);
        return;
    }   
    
    if (password.length < 6) {
            setError("Password must be at least 6 characters");
            setLoading(false);
            return;
        }
        
        if (!resetToken) {
            setError("No reset token available.");
            setLoading(false);
            return;
        }
    
        try {
            // ✅ MISMA LÓGICA DE URL QUE FORGOT-PASSWORD
            const API_URL = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000' 
                : 'https://backend-internal-platform.onrender.com';
            
            const response = await axios.post(
                `${API_URL}/api/reset-password`,
                {
                    token: resetToken,
                    password: password
                }
            );
            
            
            // Manejar respuesta
            if (response.data.success || 
                (Array.isArray(response.data) && response.data.includes("Password reset successfully"))) {
                
                setMessage("✅ Password reset successfully!");
                setSuccess(true);
               
            } else {
                setError(response.data?.[0] || response.data?.message || "Unknown error");
            }
            
        } catch (error) {
            
            if (error.response) {
                // Error del servidor
                const serverError = error.response.data?.[0] || 
                                   error.response.data?.message || 
                                   `Server error: ${error.response.status}`;
                setError("❌ " + serverError);
                
            } else if (error.request) {
                // Sin conexión
                setError("❌ Cannot connect to server. Check your internet connection.");
            } else {
                // Error de configuración
                setError("❌ Error: " + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

  return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h2>
                </div>

                {/* ✅ MENSAJE DE ÉXITO */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                        <h3 className="text-lg font-medium text-green-800 mb-3">
                            ✅ Password Reset Successful!
                        </h3>
                        <p className="text-green-700 mb-6">
                            Your password has been updated successfully.
                        </p>
                        <button
                            onClick={goToLogin}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Go to Login
                        </button>
                    </div>
                )}

                {/* ✅ MENSAJE DE ERROR */}
                {error && !success && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">{error}</p>
                    </div>
                )}

                {/* ✅ FORMULARIO SOLO SI NO HAY ÉXITO */}
                {!success && (
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Enter new password"
                                    disabled={loading}
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Confirm new password"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </div>

                        {/* ✅ BOTÓN PARA VOLVER AL LOGIN */}
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={goToLogin}
                                className="text-sm text-gray-600 hover:text-gray-900"
                            >
                                ← Back to Login
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
export default ResetPassword;