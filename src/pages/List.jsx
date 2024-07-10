import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import "../index.css";

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
  const [addedTasks, setAddedTasks] = useState([]);

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
      if (!listName.trim()) {
        throw new Error("List Name cannot be empty");
      }
      await handleCreateNewTodo(listName);
      setListName("");
      await fetchTodos();
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

  const handleTodoSubmit = async (
    e,
    todoId,
    title,
    description,
    date,
    priority
  ) => {
    e.preventDefault();
    setError(null);
    try {
      const createdAt = new Date(); // Creation time
      const updatedAt = new Date(); // Initial updated time
      await handleAddTask(
        todoId,
        title,
        description,
        date,
        priority,
        createdAt,
        updatedAt // Pass updatedAt to the handleAddTask function
      );
      const newTask = {
        todoId,
        title,
        description,
        date,
        priority,
        createdAt,
        updatedAt,
      };
      setAddedTasks([...addedTasks, newTask]);
      const updatedData = todos.map((item) => {
        if (item.id === todoId) {
          return { ...item, loading: false, tasks: [...item.tasks, newTask] };
        }
        return item;
      });
      setTodos(updatedData);
    } catch (error) {
      console.error("Error adding task: ", error);
      setError("Failed to add task. Please try again.");
    }
  };

  const handleTitle = (e, id) => {
    const updatedData = todos.map((item) => {
      if (item.id === id) {
        return { ...item, title: e.target.value };
      }
      return item;
    });
    setTodos(updatedData);
  };

  const handleDescription = (e, id) => {
    const updatedData = todos.map((item) => {
      if (item.id === id) {
        return { ...item, description: e.target.value };
      }
      return item;
    });
    setTodos(updatedData);
  };

  const handleDate = (e, id) => {
    const updatedData = todos.map((item) => {
      if (item.id === id) {
        return { ...item, date: e.target.value };
      }
      return item;
    });
    setTodos(updatedData);
  };

  const handlePriority = (e, id) => {
    const updatedData = todos.map((item) => {
      if (item.id === id) {
        return { ...item, priority: e.target.value };
      }
      return item;
    });
    setTodos(updatedData);
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
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Todo"}
        </Button>
      </Form>

      {/* Display todos */}
      <h2>My Todos</h2>
      <div className="mt-4 todos-container">
        {todos.length === 0 && <p>No todos found.</p>}
        {todos.map((todo) => (
          <div key={todo.id} className="border p-3 mb-3">
            <h4>{todo.listName}</h4>
            <Form
              onSubmit={(e) =>
                handleTodoSubmit(
                  e,
                  todo.id,
                  todo.title,
                  todo.description,
                  todo.date,
                  todo.priority
                )
              }
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Add Task</Form.Label>
                <Form.Control
                  type="text"
                  value={todo.title}
                  onChange={(e) => handleTitle(e, todo.id)}
                  placeholder="Task Title"
                />
                <Form.Control
                  type="text"
                  value={todo.description}
                  onChange={(e) => handleDescription(e, todo.id)}
                  placeholder="Task Description"
                />
                <Form.Control
                  type="date"
                  value={todo.date}
                  onChange={(e) => handleDate(e, todo.id)}
                />
                <Form.Control
                  as="select"
                  value={todo.priority}
                  onChange={(e) => handlePriority(e, todo.id)}
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Control>
              </Form.Group>
              <Button variant="primary" type="submit" disabled={todo.loading}>
                {todo.loading ? "Adding..." : "Add Task"}
              </Button>
            </Form>

            {/* Display added tasks */}
            <div className="mt-4">
              <h2>Added Tasks</h2>
              <div className="priority-container">
                <div className="priority-section low-priority">
                  <h3>Low Priority</h3>
                  {todo.tasks &&
                    todo.tasks
                      .filter((task) => task.priority === "Low")
                      .map((task, index) => (
                        <div key={index} className="border p-3 mb-3">
                          <h4>Task Details</h4>
                          <p>
                            <strong>Title:</strong> {task.title}
                          </p>
                          <p>
                            <strong>Description:</strong> {task.description}
                          </p>
                          <p>
                            <strong>Date:</strong> {task.date}
                          </p>
                          <p>
                            <strong>Priority:</strong> {task.priority}
                          </p>
                        </div>
                      ))}
                </div>
                <div className="priority-section medium-priority">
                  <h3>Medium Priority</h3>
                  {todo.tasks &&
                    todo.tasks
                      .filter((task) => task.priority === "Medium")
                      .map((task, index) => (
                        <div key={index} className="border p-3 mb-3">
                          <h4>Task Details</h4>
                          <p>
                            <strong>Title:</strong> {task.title}
                          </p>
                          <p>
                            <strong>Description:</strong> {task.description}
                          </p>
                          <p>
                            <strong>Date:</strong> {task.date}
                          </p>
                          <p>
                            <strong>Priority:</strong> {task.priority}
                          </p>
                        </div>
                      ))}
                </div>
                <div className="priority-section high-priority">
                  <h3>High Priority</h3>
                  {todo.tasks &&
                    todo.tasks
                      .filter((task) => task.priority === "High")
                      .map((task, index) => (
                        <div key={index} className="border p-3 mb-3">
                          <h4>Task Details</h4>
                          <p>
                            <strong>Title:</strong> {task.title}
                          </p>
                          <p>
                            <strong>Description:</strong> {task.description}
                          </p>
                          <p>
                            <strong>Date:</strong> {task.date}
                          </p>
                          <p>
                            <strong>Priority:</strong> {task.priority}
                          </p>
                        </div>
                      ))}
                </div>
              </div>
            </div>
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
