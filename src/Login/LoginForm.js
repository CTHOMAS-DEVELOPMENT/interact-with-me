import React, { useState } from "react";
import { Link, useNavigate  } from "react-router-dom"; // Import Link from react-router-dom
import AlertMessage from "../system/AlertMessage";
import unLoggedMan from "./unLoggedMan.png";
import unLoggedWoman from "./unLoggedWoman.png";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // Default to 'info' or any type you prefer
  const [errors, setErrors] = useState({});
  const navigate = useNavigate ();
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("data", data)
          if (data.success) {
            setMessage("Login successful");
            setType("success");
            navigate('/userlist', { state: { userId: data.userId } }); // Update for v6
            //navigate('/feed', { state: { userId: data.userId } }); // Update for v6
          } else {
            setMessage(data.message || "Login failed");
            setType("error");
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          setMessage("Login failed due to network error");
          setType("error");
        });
    }
  };

  return (
    <div className="login-layout">
      <div className="image-panel">
        <img src={unLoggedMan} alt="Man" />
      </div>
      <div className="login-form">
        <div className="form-container">
          <h2 className="fontHeader">User Login</h2>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>

            <button type="submit">Login</button>
            <div className="register-link">
              <p>Don't have an account? <Link to="/register">Register here</Link></p>
            </div>
          </form>
          {message && <AlertMessage message={message} type={type} />}
        </div>
      </div>
      <div className="image-panel">
        {<img src={unLoggedWoman} alt="Woman" />}
      </div>
    </div>
  );
};

export default LoginForm;
