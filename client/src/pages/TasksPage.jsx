import { useEffect, useState } from "react";
import { useTasks } from "../context/TasksContext";
import TaskCard from "../components/TaskCard";

function TasksPage() {
  const { getTasks, tasks } = useTasks();
  const [hasLoaded, setHasLoaded] = useState(false);
  
  useEffect(() => {
    getTasks().then(() => {
      // Pequeño delay para asegurar render
      setTimeout(() => setHasLoaded(true), 50);
    });
  }, []);
  
  // ✅ PON ESTO AQUÍ:
  if (!hasLoaded) return null;
  
  if (tasks.length === 0) return <h1>NO TASKS</h1>;

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
      {tasks.map((task) => (
        <TaskCard task={task} key={task._id} />
      ))}
    </div>
  );
}

export default TasksPage;