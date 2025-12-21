import {Link} from "react-router"
import{useAuth} from "../context/authContext"


function Navbar(){
    const {isAuthenticated, logout, user}= useAuth();
      const handleLogout = async () => {
    await logout();  // ✅ Esperar a que termine
    // El logout ya debería redirigir automáticamente
  };

    return(
       
<nav className="bg-zinc-700 my-3 flex justify-between py-5 px-10 rounded-lg">
  
  
<Link to= {
  isAuthenticated ? '/tasks' : '/'
}>

<Link to="/">
  <h1 className="text-2xl font-bold text-cyan-600 hover:text-cyan-700 transition">
    AgendaPro
  </h1>
</Link>

</Link>   
    <ul className = "flex gap-x-2">
{isAuthenticated ?(
    <>
<li>
   Welcome {user.username}
</li>
<li>
     <Link to= '/add-task'
       className="bg-indigo-500 px-4 py-1 rounded-sm"
     > ADD TASK</Link> 
     </li>
     <li>
         <button 
                onClick={handleLogout}  // ✅ Usar función async
                className="text-white hover:text-red-300 transition"
              > 
                Logout
              </button> 
            </li>
</>
     ) :(
        <>
        <li>
   <Link to= '/login'
   className="bg-indigo-500 px-4 py-1 rounded-sm"
   
   >Login</Link> 
</li>
<li>
     <Link to= '/Register'
       className="bg-indigo-500 px-4 py-1 rounded-sm"
     >Register</Link> 
     </li>
     </>
     )}
</ul>

</nav>

    )
}
export default Navbar