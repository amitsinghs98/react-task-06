// Import necessary modules and components
import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { useFirebase } from "../context/Firebase";
import { useNavigate } from "react-router-dom";
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
      console.log(todosData);
      setTodos(todosData);
      // setAddedTasks(todosData[0].tasks);
      // console.log(todosData[0]?.tasks, "dfhdgfhsg");
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

  const handleTodoSubmit = async (
    e,
    todoId,
    title,
    description,
    date,
    priority
  ) => {
    const newTasksave = {
      todoId,
      title,
      description,
      date,
      priority,
    };
    console.log(newTasksave, "fghsj");

    const updatedData = todos.map((item) => {
      if (item.id === todoId) {
        const updatedItem = {
          ...item,
          loading: true,
          // Add your new object here
        };
        updatedItem.tasks.push(newTasksave);
        return updatedItem;
      }
      return item;
    });

    setTodos(updatedData);

    e.preventDefault();
    // setLoading(true);
    setError(null);
    try {
      const newTask = {
        todoId,
        title,
        description,
        date,
        priority,
      };
      console.log(newTask, "fghsj");
      await handleAddTask(todoId, title, description, date, priority);
      // setTaskTitle(""); // Clear input fields after adding task
      // setTaskDescription("");
      // setSelectedDate("");
      // setPriority("Low");
      setAddedTasks((prevTasks) => [...prevTasks, newTask]); // Add new task to addedTasks state
      // await fetchTodos(); // Fetch updated todos after adding task
      const updatedData = todos.map((item) => {
        if (item.id === todoId) {
          return { ...item, loading: false };
        }
        return item;
      });

      setTodos(updatedData);
    } catch (error) {
      console.error("Error adding task: ", error);
      setError("Failed to add task. Please try again.");
    } finally {
      // setLoading(false);
    }
  };
  console.log(todos);

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

            {/* Form to add tasks */}
            <Form
              onSubmit={(e) =>
                handleTodoSubmit(
                  e,
                  todo.id,
                  todo?.title,
                  todo?.description,
                  todo?.date,
                  todo?.priority
                )
              }
            >
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Add Task</Form.Label>
                <Form.Control
                  type="text"
                  value={todo?.title}
                  // onChange={(e) => setTaskTitle(e.target.value)}
                  onChange={(e) => {
                    handleTitle(e, todo.id);
                  }}
                  placeholder="Task Title"
                />
                <Form.Control
                  type="text"
                  value={todo?.description}
                  // onChange={(e) => setTaskDescription(e.target.value)}
                  onChange={(e) => handleDescription(e, todo.id)}
                  placeholder="Task Description"
                />
                <Form.Control
                  type="date"
                  value={todo?.date}
                  // onChange={(e) => setSelectedDate(e.target.value)}
                  onChange={(e) => {
                    handleDate(e, todo.id);
                  }}
                />
                <Form.Control
                  as="select"
                  value={todo?.priority}
                  onChange={(e) => handlePriority(e, todo.id)}
                  // onChange={(e) => setPriority(e.target.value)}
                >
                  {" "}
                  <option value="">Select Priority</option>{" "}
                  {/* Default option */}
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Control>
              </Form.Group>

              <Button variant="primary" type="submit" disabled={todo?.loading}>
                {todo?.loading ? "Adding..." : "Add Task"}
              </Button>
            </Form>
          </div>
        ))}
      </div>

      {/* Display added tasks */}
      <div className="mt-4">
        <h2>Added Tasks</h2>
        <div className="priority-container">
          <div className="priority-section low-priority">
            <h3>Low Priority</h3>
            {todos.map((todo) => (
              <div key={todo.id}>
                {todo.tasks &&
                  todo.tasks
                    .filter((task) => task.priority === "Low")
                    .map((task, index) => (
                      <div key={index} className="border p-3 mb-3">
                        <h4>Task Details</h4>
                        {/* <p>
                          <strong>Todo ID:</strong> {task.todoId}
                        </p> */}
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
            ))}
          </div>
          <div className="priority-section med-priority">
            <h3>Medium Priority</h3>
            {todos.map((todo) => (
              <div key={todo.id}>
                {todo.tasks &&
                  todo.tasks
                    .filter((task) => task.priority === "Medium")
                    .map((task, index) => (
                      <div key={index} className="border p-3 mb-3">
                        <h4>Task Details</h4>
                        {/* <p>
                          <strong>Todo ID:</strong> {task.todoId}
                        </p> */}
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
            ))}
          </div>
          <div className="priority-section high-priority">
            <h3>High Priority</h3>
            {todos.map((todo) => (
              <div key={todo.id}>
                {todo.tasks &&
                  todo.tasks
                    .filter((task) => task.priority === "High")
                    .map((task, index) => (
                      <div key={index} className="border p-3 mb-3">
                        <h4>Task Details</h4>
                        {/* <p>
                          <strong>Todo ID:</strong> {task.todoId}
                        </p> */}
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
            ))}
          </div>
        </div>
      </div>

      {/* Logout button */}
      <Button variant="danger" onClick={handleLogout}>
        Logout
      </Button>
    </div>
  );
};

export default ListingPage;
