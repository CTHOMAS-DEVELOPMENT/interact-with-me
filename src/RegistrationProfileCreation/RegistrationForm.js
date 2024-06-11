import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ImageUploader from "./imageUploader";
import FloatsMyBoat from "./FloatsMyBoat";
import Orientation from "./Orientation"; // Make sure to import the Orientation component
import Gender from "./Gender.js"; // Make sure to import the Orientation component
import Hobbies from "./Hobbies.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "./scopedCollections.js";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const RegistrationForm = () => {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [showOrientation, setShowOrientation] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showHobbies, setShowHobbies] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hobby: "",
    sexualOrientation: "",
    floatsMyBoat: "",
    sex: "",
    aboutYou: "",
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
      setAlertKey((prevKey) => prevKey + 1);
      setType("error");
    } else {
      // Clear the message if the field passes validation on blur
      // Adding a functional update here as well for consistency
      setMessage((prevMessage) => (prevMessage ? "" : "\u200B")); // Toggle to force re-render
      setType("info");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };

  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);

    setFormData((prevFormData) => ({
      ...prevFormData,
      floatsMyBoat: version1Keys[index],
    }));
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      sexualOrientation: version1Orientations[index],
    }));
  };
  const handleGenderSelection = (index) => {
    setSelectedGender(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      sex: version1Gender[index],
    }));
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      hobby: version1Hobbies[index] || "", // Make sure version1Hobbies is accessible here
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateUser(formData);
    if (Object.keys(validationErrors).length === 0) {
      // Proceed with form submission
      //fetch("/test-db", {
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
            setAlertKey((prevKey) => prevKey + 1);
            window.scrollTo(0, 0);
          } else if (data.message) {
            setMessage(data.message);
            setType("error");
            setAlertKey((prevKey) => prevKey + 1);
          }
        })
        .catch((error) => {
          console.error("Registration error:", error);
          setMessage("Registration failed");
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        });
    } else {
      // Show the first validation error
      const firstErrorKey = Object.keys(validationErrors)[0];
      setMessage(validationErrors[firstErrorKey]);
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <div>
      <h2 className="font-style-4">User Registration</h2>
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
        <div className="rounded-rectangle-wrapper">
          <h3 className="font-style-4">About You Survey</h3>
          <div>
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={() => setShowGender(!showGender)}
            >
              {showGender
                ? "Hide Most Like You"
                : "Show Most Like You Selection"}
            </Button>
          </div>
          {showGender && (
            <Gender
              onSelectGender={handleGenderSelection}
              selected={selectedGender}
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={() => setShowHobbies(!showHobbies)}
            >
              {showHobbies
                ? "Hide Your Favourite Hobby"
                : "Show Your Favourite Hobby Selection"}
            </Button>
          </div>
          {showHobbies && (
            <Hobbies
              onSelectHobby={handleHobbySelection}
              selected={selectedHobby}
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={() => setShowOrientation(!showOrientation)} // State to control visibility
            >
              {showOrientation
                ? "Hide Your Preferred Company"
                : "Show Your Preferred Company Selection"}
            </Button>
          </div>
          {showOrientation && (
            <Orientation
              onSelectOrientation={handleOrientationSelection}
              selected={selectedOrientation}
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm"
              onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
            >
              {showFloatsMyBoat
                ? "Hide Floats Your Boat"
                : "Show Floats Your Boat Selection"}
            </Button>
          </div>

          {showFloatsMyBoat && (
            <FloatsMyBoat
              onSelectCarousel={handleCarouselSelection}
              selectedCarousel={selectedCarousel}
            />
          )}
          <div>
            <textarea
              id="aboutYou"
              className="about-you-textarea"
              placeholder="I am looking for a long term relationship. Look out for my Connection Request from the Communication Centre."
              name="aboutYou"
              value={formData.aboutYou}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              style={{ width: "100%", height: "100px" }} // Adjust styling as needed
            />
          </div>
        </div>
        {!userId && (
          <Button type="submit" variant="outline-info" className="btn-sm">
            Register
          </Button>
        )}
      </form>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default RegistrationForm;
