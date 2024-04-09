import React, { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useLocation, Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import AlertMessage from "../system/AlertMessage";
import unLoggedMan from "./unLoggedMan.png";
import unLoggedWoman from "./unLoggedWoman.png";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const LoginForm = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // Default to 'info' or any type you prefer
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation(); // To access the passed state
  // Initialize formData state with username from the navigation state if available
  const [formData, setFormData] = useState({
    username: location.state?.username || "", // Pre-populate username if it's passed in state
    password: "",
  });
  const [captchaValue, setCaptchaValue] = useState(null);
  const reCaptchaKey = "6Lc03a4pAAAAAJNt0mM_hutJ0XJL1079QVUREoNq"; // Replace YOUR_SITE_KEY_HERE with your actual site key

  // Other component logic remains the same

  const onCaptchaChange = (value) => {
    setCaptchaValue(value); // You might want to send this value to your backend for verification
  };
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
    if (!captchaValue) {
      setMessage("Please verify you are not a robot.");
      setType("error");
      return;
    }
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
          if (data.success) {
            setMessage("Login successful");
            setType("success");
            localStorage.setItem("token", data.token);
            navigate("/userlist", { state: { userId: data.userId } }); // Update for v6
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
      <ReCAPTCHA sitekey={reCaptchaKey} onChange={onCaptchaChange} />
      <div className="image-panel">
        <img src={unLoggedMan} alt="Man" />
      </div>
      <div className="login-form">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <div>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                placeholder="Username"
                onChange={handleInputChange}
                required
              />
              {errors.username && <p className="error">{errors.username}</p>}
            </div>
            <div>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                onChange={handleInputChange}
                required
              />
              {errors.password && <p className="error">{errors.password}</p>}
            </div>
            <Button variant="primary" onClick={handleSubmit}>
              Login
            </Button>{" "}
            <div className="login-page-link">
              <p>
                Don't have an account? <Link to="/register">Register here</Link>
              </p>
            </div>
            <div className="login-page-link">
              <p>
                <Link to="/password-reset-request">Forgotten password?</Link>
              </p>
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
