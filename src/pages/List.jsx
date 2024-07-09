// Import necessary modules and components
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
      await fetchTodos(); // Fetch updated todos after adding new one
      setListName(""); // Clear input field
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

  if (!isLoggedIn) {
    return null; // Render nothing if not logged in
  }

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
            <p>Created by: {todo.displayName}</p>
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
