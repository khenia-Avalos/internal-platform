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





export function TaskProvider({children}) {
    const [tasks, setTasks]= useState([]);
  const getTasks =async () => {
        try{
  const res = await getTasksRequest()
  setTasks(res.data);

        }catch(error){
            console.error(error);
        }
  };


  



  

const createTask =async (task)=> {
const res = await createTaskRequest (task)
console.log(res)
}


    async function deleteTask(id) {
        try {
            const res = await deleteTaskRequest(id);
            if (res.status === 204) {
                await getTasks(); // Vuelve a cargar todas las tareas
            }
        } catch (error) {
            console.log(error);
        }
    }



const getTask = async (id) => {
    try {
    const res = await getTaskRequest(id);
    return res.data;
} catch (error) {
    console.log(error);
}
}

const updateTask = async (id, task) => {
    try {
        const res = await updateTaskRequest(id, task);
        
        await getTasks(); // ✅ LÍNEA NUEVA - esto actualiza el estado
        
        return res.data;
    } catch (error) {
        console.log(error);
    }
};


return(
    <TaskContext.Provider value={{tasks,createTask, getTasks,deleteTask,getTask, updateTask}}>
        {children}
    </TaskContext.Provider>
)

    
}