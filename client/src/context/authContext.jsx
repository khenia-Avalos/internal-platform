import { createContext, useState, useContext, useEffect} from 'react'
import {registerRequest} from '../api/auth'
import {loginRequest, verifyTokenRequest} from '../api/auth'

import axios from '../api/axios'



export const AuthContext = createContext()


export const useAuth = () => {
    const context = useContext (AuthContext);
    if (!context){
        throw new Error ("useAuth must be used within an AuthProvider");
    }
    return context;
};



export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [errors, setErrors]= useState([]);
const [loading, setLoading]= useState(true);

    const singup = async(user) => {
        try{
const res = await registerRequest(user)
console.log(res.data)
setUser(res.data)
setIsAuthenticated(true);
    }catch (error ){
console.log(error.response)
        setErrors(error.response.data);



    }
    };

const signin = async (user) => {
    try{
        const res = await loginRequest(user)
        console.log(res)
        setIsAuthenticated(true)
        setUser(res.data)
    }catch (error){

if (Array.isArray(error.response.data)){
    return setErrors(error.response.data)
}
     setErrors([error.response.data.message])

    }
}



const logout = async () => {
    try {
        await axios.get('/auth/logout', { withCredentials: true });
    } catch (error) {
        console.error('Logout error:', error);
    }
    setIsAuthenticated(false);
    setUser(null);
    // ❌ NO USES: Cookies.remove("token");
};





useEffect(()=>{
    if (errors.length > 0){
       const timer= setTimeout(()=>{
            setErrors([])
        },5000)
        return () => clearTimeout(timer)
    }
},[errors])


useEffect(() =>{
  async  function checklogin() {
    const cookies=Cookies.get();
    if(!cookies.token){
        setIsAuthenticated(false);
        setLoading(false);

        return setUser(null);
        
        }

    try{
const res = await verifyTokenRequest();
console.log(res)
if(!res.data) {
 setIsAuthenticated(false);
setLoading(false);

return;
}

    setIsAuthenticated(true);
    setUser(res.data);
    setLoading(false);
    }catch (error){
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
    }

    }
    
    checklogin();
},[]);





return(
    <AuthContext.Provider 
    value ={{
        singup,
        signin,
        logout,
        user,
        isAuthenticated,
        errors,
        loading
    }}
    
    >
        {children}
        </AuthContext.Provider>
)

}