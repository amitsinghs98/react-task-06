import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";

const ListingPage = () => {
  const { handleCreateNewTodo, isLoggedIn, signout, listTodos } = useFirebase();
  const navigate = useNavigate();
  const [listName, setListName] = useState("");
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [priority, setPriority] = useState("Low");

  useEffect(() => {
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
    } catch (error) {
      console.error("Error fetching todos: ", error);
      setError("Failed to fetch todos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await handleCreateNewTodo(listName);
      await fetchTodos(); // Fetch updated todos after adding new one
      setListName(""); // Clear input field
    } catch (error) {
      console.error("Error adding todo list: ", error);
      setError("Failed to add todo list. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signout();
    navigate("/"); // Redirect to home page after logout
  };

  const handleTodoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Handle creating new todo
      const todoData = {
        title: taskTitle,
        description: taskDescription,
        date: selectedDate,
        priority: priority,
      };
      // Implement handleCreateNewTodo for creating individual todos
      await handleCreateNewTodo(listName, todoData);
      await fetchTodos(); // Fetch updated todos after adding new one
      // Clear input fields
      setTaskTitle("");
      setTaskDescription("");
      setSelectedDate("");
      setPriority("Low");
    } catch (error) {
      console.error("Error adding todo: ", error);
      setError("Failed to add todo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return null; // Render nothing if not logged in
  }

  return (
    <div className="container mt-5">
      <h1>Add Todo List</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="newListForm">
          <Form.Label>New Todo List</Form.Label>
          <Form.Control
            onChange={(e) => setListName(e.target.value)}
            value={listName}
            type="text"
            placeholder="Enter List Name"
            disabled={loading}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Todo List"}
        </Button>
      </Form>

      <div className="mt-4">
        <h2>My Todos</h2>
        {todos.length === 0 && <p>No todos found.</p>}
        {todos.map((todo) => (
          <div key={todo.id} className="border p-3 mb-3">
            <h4>{todo.listName}</h4>
            <Form onSubmit={handleTodoSubmit}>
              <Form.Group className="mb-3" controlId={`todoForm-${todo.id}`}>
                <Form.Label>Add Todo</Form.Label>
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
                {loading ? "Adding..." : "Add Todo"}
              </Button>
            </Form>
          </div>
        ))}
      </div>
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default ListingPage;
