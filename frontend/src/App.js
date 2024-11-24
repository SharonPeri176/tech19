import React, { useState, useEffect } from 'react'

function App(){

  const [data, setData] = useState([{}]);
  const [newTask, setNewTask] = useState({ title: "", description: "", completed: false }); // For creating a new task
  const [editingTask, setEditingTask] = useState(null); // To manage the task being edited
  const [taskValues, setTaskValues] = useState({ title: "", description: "", completed: false }); // Values for editing

  useEffect(() => {
    fetchTasks();
  }, []);
  
  
  const fetchTasks = async () => {
    try {
      fetch("/tasks/").then(
        res=> res.json()
      ).then(
        data => {
          setData(data)
          console.log(data)
        }
      )
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }
  
  const addTask = async () => {
    try {
      const response = await fetch("/tasks/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (response.ok) {
        fetchTasks(); // Refresh the task list
        setNewTask({ title: "", description: "", completed: false }); // Reset form
      }
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };


  // Start editing a task
  const startEditing = (task) => {
    setEditingTask(task.id);
    setTaskValues({ title: task.title, description: task.description, completed: task.completed });
  };

  // Save updated task
  const saveTask = async (id) => {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskValues),
      });
  
      if (response.ok) {
        fetchTasks(); // Refresh task list
        setEditingTask(null); // Exit edit mode
      } else {
        console.error("Failed to update task:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingTask(null);
    setTaskValues({ title: "", description: "", completed: false });
  };


  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/tasks/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTasks(); // Refresh the task list
      } else {
        console.error("Failed to delete task:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };
  

  return (
    <div>
      <h1>Task Manager</h1>

      {/* Add Task */}
      <div style={{ marginBottom: "20px" }}>
        <h2>Add New Task</h2>
        <input
          type="text"
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <label>
          <input
            type="checkbox"
            checked={newTask.completed}
            onChange={(e) => setNewTask({ ...newTask, completed: e.target.checked })}
          />
          Completed
        </label>
        <button onClick={addTask}>Add Task</button>
      </div>

      {/* Task List */}
      <div>
        <h2>Task List</h2>
        {data.map((task) => (
          <div key={task.id} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            {editingTask === task.id ? (
              // Edit Mode
              <div>
                <input
                  type="text"
                  value={taskValues.title}
                  onChange={(e) => setTaskValues({ ...taskValues, title: e.target.value })}
                />
                <input
                  type="text"
                  value={taskValues.description}
                  onChange={(e) => setTaskValues({ ...taskValues, description: e.target.value })}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={taskValues.completed}
                    onChange={(e) => setTaskValues({ ...taskValues, completed: e.target.checked })}
                  />
                  Completed
                </label>
                <button onClick={() => saveTask(task.id)}>Save</button>
                <button onClick={cancelEditing}>Cancel</button>
              </div>
            ) : (
              // View Mode
              <div>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Completed: {task.completed ? "Yes" : "No"}</p>
                <button onClick={() => startEditing(task)}>Edit</button>
                <button onClick={() => deleteTask(task.id)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App