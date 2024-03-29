import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "./imageUploader";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
const RegistrationForm = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const navigate = useNavigate();
  const hobbyOptions = process.env.REACT_APP_HOBBY_TYPE.split(",");
  const sexualOrientationOptions =
    process.env.REACT_APP_SEXUAL_ORIENTATION_TYPE.split(",");
  const floatsMyBoatOptions =
    process.env.REACT_APP_FLOATS_MY_BOAT_TYPE.split("|");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hobby: "",
    sexualOrientation: "",
    floatsMyBoat: "",
    sex: "",
  });

  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const handleLoginScreenClick = () => {
    if (userId) {
      navigate("/", { state: { username: formData.username } });
    } else {
      navigate("/"); // Update for v6
    }
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const validationErrors = validateUser({ ...formData, [name]: value });

    if (validationErrors[name]) {
      // Use a functional update for setMessage to ensure the change is always applied
      setMessage((prevMessage) => {
        // Check if the new message is the same as the old one
        if (prevMessage === validationErrors[name]) {
          // If it's the same, prepend an invisible character to force a re-render
          return `\u200B${validationErrors[name]}`;
        }
        return validationErrors[name];
      });
      setType("error");
    } else {
      // Clear the message if the field passes validation on blur
      // Adding a functional update here as well for consistency
      setMessage((prevMessage) => (prevMessage ? "" : "\u200B")); // Toggle to force re-render
      setType("info");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateUser(formData);
    if (Object.keys(validationErrors).length === 0) {
      // Proceed with form submission
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
            setUserId(data.id);
            setMessage("Registration successful");
            setType("success");
            window.scrollTo(0, 0);
          } else if (data.message) {
            setMessage(data.message);
            setType("error");
          }
        })
        .catch((error) => {
          console.error("Registration error:", error);
          setMessage("Registration failed");
          setType("error");
        });
    } else {
      // Show the first validation error
      const firstErrorKey = Object.keys(validationErrors)[0];
      setMessage(validationErrors[firstErrorKey]);
      setType("error");
    }
  };

  return (
    <div>
      <h2 className="fontHeader">User Registration</h2>
      {userId && ( // Only render this section if userId exists
        <div className="dummy">
          <div className="button-container">
            <Button
              variant="danger"
              onClick={handleLoginScreenClick}
              className="logout-button"
            >
              {uploadedImageUrl
                ? `Login ${formData.username}`
                : `Login ${formData.username} without profile image`}
            </Button>

          </div>

          {!uploadedImageUrl && (
            <div className="profile-image-buttons">
              <ImageUploader userId={userId} onUpload={handleImageUpload} />
            </div>
          )}

          {uploadedImageUrl && (
            <div className="uploaded-image">
              <img
                src={`${
                  process.env.REACT_APP_IMAGE_HOST
                }/uploaded-images/${uploadedImageUrl.split("\\").pop()}`}
                alt="Uploaded Profile"
              />
            </div>
          )}
        </div>
      )}
      <form className="system-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          />
        </div>
        <div>
          <label htmlFor="sex">Sex</label>
          <select
            id="sex"
            name="sex"
            value={formData.sex}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your sex</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="hobby">Favourite Hobby</label>
          <select
            id="hobby"
            name="hobby"
            value={formData.hobby}
            onChange={handleInputChange}
            required
          >
            <option value="">Select a hobby</option>{" "}
            {/* Adds a default placeholder option */}
            {hobbyOptions.map((hobby) => (
              <option key={hobby} value={hobby}>
                {hobby}
              </option>
            ))}
          </select>
          {/* Display errors if any */}
        </div>
        <div>
          <label htmlFor="sexualOrientation">Sexual Orientation</label>
          <select
            id="sexualOrientation"
            name="sexualOrientation"
            value={formData.sexualOrientation}
            onChange={handleInputChange}
            required
          >
            <option value="">Select your sexual orientation</option>
            {sexualOrientationOptions.map((orientation) => (
              <option key={orientation} value={orientation}>
                {orientation}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="floatsMyBoat">Floats My Boat</label>
          <select
            id="floatsMyBoat"
            name="floatsMyBoat"
            value={formData.floatsMyBoat}
            onChange={handleInputChange}
            required
          >
            <option value="">Select what floats your boat</option>
            {floatsMyBoatOptions.map((preference) => (
              <option key={preference} value={preference}>
                {preference}
              </option>
            ))}
          </select>
        </div>
        {!userId && (
          <Button type="submit" variant="outline-info" className="btn-sm">
            Register
          </Button>
        )}
      </form>
      {message && <AlertMessage message={message} type={type} />}
    </div>
  );
};

export default RegistrationForm;
