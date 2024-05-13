// PasswordReset.js
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();
  const backToLogin = () => {
    navigate("/"); // Update for v6
  };
  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setType("warning");
      setAlertKey(prevKey => prevKey + 1); 
      return;
    }
    fetch("/api/update_user_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the server
        setMessage(data.message);
        setAlertKey(prevKey => prevKey + 1); 
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage(error);
        setType("error");
        setAlertKey(prevKey => prevKey + 1); 
      });
  };

  return (
    <div>
              <Button variant="danger" onClick={backToLogin} className="logout-button">
        Back to Login
      </Button>
      <h2 className="font-style-4">Reset Your Password</h2>
      <div className="wrapper-container">
        <form onSubmit={handlePasswordReset}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            required
          />
          <Button
            variant="outline-info"
            className="btn-sm view-profile-btn"
            type="submit"
          >
            Reset Password
          </Button>
        </form>
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default PasswordReset;
