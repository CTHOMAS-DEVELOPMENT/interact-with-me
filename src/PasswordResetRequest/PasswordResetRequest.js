// PasswordResetRequest.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";
const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();
  const backToLogin = () => {
    navigate("/"); // Update for v6
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    // Implement the logic to handle the password reset request here.
    // Typically, you would send a POST request to your backend.
    fetch("/api/password_reset_request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessage("Please check your email for the password reset link.");
          setAlertKey(prevKey => prevKey + 1); 
        } else {
          setMessage(
            "Unable to send password reset link. Please try again later."
          );
          setType("error");
          setAlertKey(prevKey => prevKey + 1); 
        }
      })
      .catch((error) => {
        console.error("Password reset request error:", error);
        setMessage("Network error while trying to send reset link.");
        setType("error");
        setAlertKey(prevKey => prevKey + 1); 
      });
  };

  return (
    <div className="password-reset-request">
      <Button variant="danger" onClick={backToLogin} className="logout-button">
        Back to Login
      </Button>
      <h2 className="font-style-4">Password Reset</h2>
      <div className="wrapper-container">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <Button
            variant="outline-info"
            className="btn-sm view-profile-btn"
            type="submit"
          >
            Send Reset Link
          </Button>
        </form>
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default PasswordResetRequest;
