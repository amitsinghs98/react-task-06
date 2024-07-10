// Import necessary modules and components
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";

const ListingPage = () => {
  const { handleCreateNewTodo, isLoggedIn, signout, listTodos, handleAddTask } =
    useFirebase();
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [priority, setPriority] = useState("Low");
  const [addedTasks, setAddedTasks] = useState([]); // State to store added tasks

  useEffect(() => {
    // Fetch todos when component mounts or when isLoggedIn changes
    if (isLoggedIn) {
      fetchTodos();
    }
  }, [isLoggedIn]);

  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const todosData = await listTodos();
      setTodos(todosData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching todos: ", error);
      setError("Failed to fetch todos. Please try again later.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleCreateNewTodo(listName);
      setListName(""); // Clear input field after creating new todo
      await fetchTodos(); // Fetch updated todos after adding new one
    } catch (error) {
      console.error("Error adding todo: ", error);
      setError("Failed to add todo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signout();
    navigate("/"); // Redirect to home page after logout
  };

  const handleTodoSubmit = async (e, todoId) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newTask = {
        todoId,
        taskTitle,
        taskDescription,
        selectedDate,
        priority,
      };
      await handleAddTask(
        todoId,
        taskTitle,
        taskDescription,
        selectedDate,
        priority
      );
      setTaskTitle(""); // Clear input fields after adding task
      setTaskDescription("");
      setSelectedDate("");
      setPriority("Low");
      setAddedTasks((prevTasks) => [...prevTasks, newTask]); // Add new task to addedTasks state
      await fetchTodos(); // Fetch updated todos after adding task
    } catch (error) {
      console.error("Error adding task: ", error);
      setError("Failed to add task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Add Todo List</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Todo-List</Form.Label>
          <Form.Control
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            type="text"
            placeholder="New List Name"
            disabled={loading}
          />
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Todo"}
        </Button>
      </Form>

      {/* Display todos */}
      <div className="mt-4">
        <h2>My Todos</h2>
        {todos.length === 0 && <p>No todos found.</p>}
        {todos.map((todo) => (
          <div key={todo.id} className="border p-3 mb-3">
            <h4>{todo.listName}</h4>

            {/* Form to add tasks */}
            <Form onSubmit={(e) => handleTodoSubmit(e, todo.id)}>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Add Task</Form.Label>
                <Form.Control
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task Title"
                />
                <Form.Control
                  type="text"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task Description"
                />
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
                <Form.Control
                  as="select"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Task"}
              </Button>
            </Form>
          </div>
        ))}
      </div>

      {/* Display added tasks */}
      <div className="mt-4">
        <h2>Added Tasks</h2>
        {addedTasks.length === 0 && <p>No tasks added yet.</p>}
        {addedTasks.map((task, index) => (
          <div key={index} className="border p-3 mb-3">
            <h4>Task Details</h4>

            <p>
              <strong>Title:</strong> {task.taskTitle}
            </p>
            <p>
              <strong>Description:</strong> {task.taskDescription}
            </p>
            <p>
              <strong>Date:</strong> {task.selectedDate}
            </p>
            <p>
              <strong>Priority:</strong> {task.priority}
            </p>
          </div>
        ))}
      </div>

      {/* Logout button */}
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default ListingPage;
