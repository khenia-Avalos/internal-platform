
import React from "react";
import axios from "axios";
import {useLocation} from "react-router";
import { useEffect } from "react";




function ResetPassword() {
    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [resetToken, setResetToken] = React.useState("");
    const location = useLocation();

useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
       
    console.log("Raw token from URL:", token); // ✅ Ver qué llega crudo
    console.log("Token includes '...':", token?.includes('…')); // ✅ Ver si está truncado
    if (token) {
        const decodedToken = decodeURIComponent(token);
        console.log("Token length:", decodedToken.length);
        console.log("Full token:", decodedToken);
        
        setResetToken(decodedToken);
    }else{
        alert("No token found in URL");
    }
}, [location.search]);

const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }   
    
try{
        const cleanToken = resetToken.replace(/['"]/g, '').trim();
        console.log("Cleaned token:", cleanToken);
    const response = await axios.post(
        "http://localhost:3000/api/reset-password",
        {
       token: cleanToken,
    password
        }
        );
        console.log(response.data);
    } catch (error) {
}

}



    return (
        <div className="login-Container">
            <form onSubmit={handleSubmit}>
            <h2>Reset Password Page</h2>
<div className="form-group">
        <label>New Password</label>
        <input type ="password" placeholder="Enter your new password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required />
    </div>
    <div className="form-group">
        <label>Confirm New Password</label>
        <input type ="password" placeholder="Confirm your new password"
         value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required />
    </div>
    <button type="submit" className= 'login-btn'>Reset Password</button>
</form>
        </div>
    )
}
export default ResetPassword;