import {useForm} from 'react-hook-form'
import { useTasks} from "../context/TasksContext"
import {useNavigate, useParams} from 'react-router'
import { use, useEffect } from 'react';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
dayjs.extend(utc);

function TaskFormPage() {
const {register, handleSubmit, setValue}= useForm();
 const{createTask,getTask, updateTask} =   useTasks()
const navigate = useNavigate();
const params = useParams();

useEffect (()=>{
    async function loadTask(){
    if(params.id){
        const task = await getTask (params.id);
        console.log(task)
        setValue ("title", task.title);
        setValue ("description", task.description);
        setValue ("date", dayjs(task.date).utc().format(""));
        
    }
    }
    loadTask();

},[])





const onSubmit = handleSubmit((data) =>{
     const dataValid={
    ...data,
     date:data.date ? dayjs.utc(data.date).format(): dayjs.utc().format(),
     };
    if(params.id){
        updateTask (params.id, dataValid);
    } else {
        createTask(dataValid);
    }
   navigate('/tasks');
});


    return (
        <div className="bg-zinc-800 maz-w-md w-full p-10 rounded-md">
        <form onSubmit={onSubmit}>
            <label htmlFor="title">Title</label>

<input type="text" placeholder="Title"
{...register("title")}




className= "w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"
autoFocus

/>
 <label htmlFor="description">Description</label>
<textarea rows="3" placeholder="Description"
{...register("description")}
className= "w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2"


>
</textarea>
 <label htmlFor="date">Date</label>
 <input type="date" {...register("date")} className= "w-full bg-zinc-700 text-white px-4 py-2 rounded-md my-2" />
<button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md mt-2">
    save
</button>


</form>


        </div>
    )
}
export default TaskFormPage