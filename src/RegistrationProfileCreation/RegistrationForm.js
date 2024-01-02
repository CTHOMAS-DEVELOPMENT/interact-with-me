import React, { useState } from "react";
import { Link } from "react-router-dom";
import interactivePeople from "./interactivepeople.png";
import ImageUploader from "./imageUploader";
import AlertMessage from "../system/AlertMessage";

const RegistrationForm = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // default to 'info' or any type you prefer

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [userId, setUserId] = useState(null); // State to store the user's ID
  const DOMAIN_NAME = "localhost:3002";
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleImageUpload = (url) => {
    //No url recieved
    console.log("handleImageUpload", url);
    setUploadedImageUrl(url);
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!formData.email.match(emailPattern)) {
      newErrors.email = "Invalid email format";
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
      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.id) {
            // Save the user's ID on successful registration
            setUserId(data.id);
            setMessage("Registration successful");
            setType("info");
          } else if (data.message) {
            // Handle other messages from the server
            setMessage(data.message);
            setType("error");
          }
        })
        .catch((error) => {
          // Handle network errors
          console.error("Registration error:", error);
          setMessage("Registration failed");
          setType("error");
        });
    }
  };

  return (
    <div className="registration-form">
      <h2 className="fontHeader">User Registration</h2>
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
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errors.email && <p className="error">{errors.email}</p>}
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
        <button type="submit">Register</button>
      </form>
      {message && <AlertMessage message={message} type={type} />}
      {type === "info" && (
        <p>
          <Link to="/">Login</Link> to your new account.
        </p>
      )}
      {!uploadedImageUrl && userId && (
        <ImageUploader userId={userId} onUpload={handleImageUpload} />
      )}
      {uploadedImageUrl && (
        <div className="uploaded-image">
          <img
            src={`http://${DOMAIN_NAME}/uploaded-images/${uploadedImageUrl
              .split("\\")
              .pop()}`}
            alt="Uploaded Profile"
          />
        </div>
      )}
      {!uploadedImageUrl && (
        <div className="image-panel">
          <img src={interactivePeople} alt="Diverse group of people" />
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
