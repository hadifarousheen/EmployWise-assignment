import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";

const API_BASE = "https://reqres.in/api";

function Login({ setToken }) {
  const [email, setEmail] = useState("eve.holt@reqres.in");
  const [password, setPassword] = useState("cityslicka");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE}/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      navigate("/users");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="container">
      <h2 className="title">Login</h2>
      <input
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        className="input"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      {error && <p className="error">{error}</p>}
      <button onClick={handleLogin} className="button">
        Login
      </button>
    </div>
  );
}

function Users() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users?page=${page}`);
      setUsers(res.data.data);
    } catch (err) {
      setError("Failed to fetch users.");
    }
  };

  const deleteUser = async (id) => {
    await axios.delete(`${API_BASE}/users/${id}`);
    setUsers(users.filter((user) => user.id !== id));
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <div className="container">
      <h2 className="title">Users</h2>
      {error && <p className="error">{error}</p>}
      <div className="user-grid">
        {users.map((user) => (
          <div key={user.id} className="card">
            <img src={user.avatar} alt={user.first_name} className="avatar" />
            <p>
              {user.first_name} {user.last_name}
            </p>
            <p>{user.email}</p>
            <button
              onClick={() => navigate(`/edit/${user.id}`, { state: user })}
              className="edit-btn"
            >
              Edit
            </button>
            <button
              onClick={() => deleteUser(user.id)}
              className="delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="button"
        >
          Prev
        </button>
        <button onClick={() => setPage(page + 1)} className="button">
          Next
        </button>
      </div>
    </div>
  );
}

function EditUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state;

  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [email, setEmail] = useState(user.email);

  const handleUpdate = async () => {
    await axios.put(`${API_BASE}/users/${user.id}`, {
      first_name: firstName,
      last_name: lastName,
      email,
    });
    navigate("/users");
  };

  return (
    <div className="container">
      <h2 className="title">Edit User</h2>
      <input
        className="input"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      <input
        className="input"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      <input
        className="input"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button onClick={handleUpdate} className="button">
        Update
      </button>
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={token ? <Navigate to="/users" /> : <Login setToken={setToken} />}
        />
        <Route
          path="/users"
          element={token ? <Users /> : <Navigate to="/" />}
        />
        <Route path="/edit/:id" element={<EditUser />} />
      </Routes>
    </Router>
  );
}
