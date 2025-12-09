import { createContext,useContext, useState} from 'react';
import { createTaskRequest, getTasksRequest, deleteTaskRequest, getTaskRequest,updateTaskRequest } from '../api/tasks';


const TaskContext = createContext();

export const useTasks = () => {
    const context = useContext(TaskContext);

if(!context)
{
    throw new Error("useTask must be used within a TaskProvider")
}
return context;
}





export const  TaskProvider = ({children}) => {
    const [tasks, setTasks]= useState([]);
    const [loading, setLoading]= useState(false);
    const [errors, setErrors]= useState([]);


  const getTasks =async () => {
        try{
            setLoading  (true);
  const res = await getTasksRequest()
    setTasks(res.data);
    return {ok: true};
 } catch (error) {
      setErrors(error.response.data || "Error loading tasks");
      return { ok: false };
    } finally {
      setLoading(false);
    }
  };

  



  

const createTask =async (task)=> {
try{
    await createTaskRequest(task);
    await getTasks(); // Vuelve a cargar todas las tareas
    return { ok: true };

}catch(error){
   console.error(error);
      setErrors(error.response.data || "Error creating task");
      return { ok: false };
    }
  };



    async function deleteTask(id) {
        try {
            await deleteTaskRequest(id);
               setTasks((prev) => prev.filter((task) => task._id !== id));
      return { ok: true };
      } catch (error) {
      setErrors(error.response.data || "Error deleting task");
      return { ok: false };
    }
  };


const getTask = async (id) => {
    try {
    const res = await getTaskRequest(id);
   return { ok: true, data: res.data };
} catch (error) {
  setErrors(error.response.data || "Error getting task");
      return { ok: false };
}
}

const updateTask = async (id, task) => {
    try {

        await updateTaskRequest(id, task);
        
        await getTasks(); // ✅ LÍNEA NUEVA - esto actualiza el estado
        
       return { ok: true }; 
    } catch (error) {
      setErrors(error.response.data || "Error updating task");
      return { ok: false };
    }

    };


return(
    <TaskContext.Provider value={{tasks,createTask, getTasks,deleteTask,getTask, updateTask, loading, errors}}>
        {children}
    </TaskContext.Provider>
)

    
}