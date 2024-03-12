import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import ViewImage from "./ViewImage.js";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  // Dropdown options extracted from environment variables
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
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");

  useEffect(() => {
    if (userId) {
      fetch(`/api/users/${userId}`)
        .then((response) => response.json())
        .then((user) => {
          setFormData({
            username: user.username || "",
            email: user.email || "",
            password: "", // Password should not be fetched for security reasons
            hobby: user.hobbies || "",
            sexualOrientation: user.sexual_orientation || "",
            floatsMyBoat: user.floats_my_boat || "",
          });
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setMessage("Failed to load user data");
          setType("error");
        });
    }
  }, [userId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const validationErrors = validateUser({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setMessage(validationErrors[name]);
      setType("error");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Reset the message and type to ensure the component re-renders
    setMessage("");
    setType("info");

    // Use a brief timeout to ensure the reset happens before setting the new message

    console.log("formData", formData);
    const validationErrors = validateUser(formData);
    console.log("validationErrors", validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      // No validation errors, proceed with form submission
      fetch(`/api/update_profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          setMessage("Profile updated successfully");
          setType("success");
        })
        .catch((error) => {
          console.error("Update profile error:", error);
          setMessage("Profile update failed");
          setType("error");
        });
    } else {
      // Set the first validation error message
      const firstErrorKey = Object.keys(validationErrors)[0];
      console.log("setMessage validationErrors[firstErrorKey]",validationErrors[firstErrorKey])
      setTimeout(()=>{
        setMessage(validationErrors[firstErrorKey]);
        setType("error");
      },0)
      
    }
  };

  return (
    <div>
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={() => navigate("/userlist", { state: { userId } })}
      >
        Back to messages
      </Button>

      <h2>Update Profile</h2>
      <ViewImage userId={userId} />
      <form onSubmit={handleSubmit}>
        <div className="system-form">
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
            <label htmlFor="password">
              Password (leave blank to keep the same)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="hobby">Favourite Hobby</label>
            <select
              id="hobby"
              name="hobby"
              value={formData.hobby}
              onChange={handleInputChange}
            >
              {hobbyOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sexualOrientation">Sexual Orientation</label>
            <select
              id="sexualOrientation"
              name="sexualOrientation"
              value={formData.sexualOrientation}
              onChange={handleInputChange}
            >
              {sexualOrientationOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
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
            >
              {floatsMyBoatOptions.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
        {message && <AlertMessage message={message} type={type} />}
        <Button variant="outline-info" className="btn-sm" type="submit">
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default UpdateProfile;
