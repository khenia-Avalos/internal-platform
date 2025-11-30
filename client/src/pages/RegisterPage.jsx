
import {useForm} from 'react-hook-form'
import {useAuth} from "../context/authContext"
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom"

function RegisterPage(){
const {register, handleSubmit, 
    formState:{errors},

}= useForm();
const {singup, isAuthenticated, errors: registerErrors}= useAuth();
const navigate= useNavigate()

useEffect(() => {
    if (isAuthenticated) navigate("/tasks");     
}, [isAuthenticated]);


const onSubmit = handleSubmit (async(values) =>{
singup(values);


});



    return (
        <div className="flex h-[calc(100vh-100px)] justify-center items-center">

           
        <div  className ="bg-zinc-800 max-w-md p-10 rounded-md">

{
    registerErrors.map ((error, i)=>(
        <div className='bg-red-500 p-2 text-white' key={i}>
            {error}
            </div>
    ))
}


<form onSubmit={onSubmit}>

 <h1 className="text-3xl font-bold mb-4">Register</h1>
    <input type = "text" {...register("username", {required: true })}
    className = "w-full bg-zinc-700 text-amber-50 px-4 py-2 rounded-md my-2"
    placeholder= "Username"
    />

{errors.username &&(
    <p className='text-red-500'>Username is required</p>
) }

    <input type = "email"   {...register("email", {required: true })} 
        className = "w-full bg-zinc-700 text-amber-50 px-4 py-2 rounded-md my-2"
    placeholder= "email"

/>

{errors.email &&(
    <p className='text-red-500'>email is required</p>
) }



    <input type = "password"   {...register("password", {required: true })}
        className = "w-full bg-zinc-700 text-amber-50 px-4 py-2 rounded-md my-2"
    placeholder= "password"

/>

{errors.password &&(
    <p className='text-red-500'>password is required</p>
) }


<button type = "submit">Register</button>

</form>
<p className= "flex gap-x-2 justify-between">
    Already have an account? <Link to = "/login"
    className="text-sky-500"> login  </Link> 
</p>



        </div>
        </div>
    )
}
export default RegisterPage
