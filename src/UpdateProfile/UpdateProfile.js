import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import ViewImage from "./ViewImage.js";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections.js";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService"; // Ensure this path matches your file structure
import { convertToMediaPath } from "../system/utils";
const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [authError, setAuthError] = useState(false);
  const [profileVideo, setProfileVideo] = useState();
  const [profileImage, setProfileImage] = useState();
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [showOrientation, setShowOrientation] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [showHobbies, setShowHobbies] = useState(false);
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

  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);

  useEffect(() => {
    if (userId) {
      checkAuthorization(userId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
          // Optionally, you could navigate to a login page instead of setting an error
          // navigate("/login");
        } else {
          // If authorized, proceed to fetch user data
          fetchUserData();
        }
      });
    }
  }, [userId, navigate]);
  useEffect(() => {
    if (formData.sex) {
      const index = version1Gender.indexOf(formData.sex);
      setSelectedGender(index);
    }
  }, [formData.sex]);
  useEffect(() => {
    if (formData.floatsMyBoat) {
      const index = version1Keys.indexOf(formData.floatsMyBoat);
      setSelectedCarousel(index);
    }
  }, [formData.floatsMyBoat]);

  useEffect(() => {
    if (formData.sexualOrientation) {
      const index = version1Orientations.indexOf(formData.sexualOrientation);
      setSelectedOrientation(index);
    }
  }, [formData.sexualOrientation]);
  useEffect(() => {
    if (formData.hobby) {
      const index = version1Hobbies.indexOf(formData.hobby);
      setSelectedHobby(index);
    }
  }, [formData.hobby]);
  const fetchUserData = () => {
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
          sex: user.sex || "",
          aboutYou: user.about_you || "",
        });
        if (user.profile_video) {
          setProfileVideo(convertToMediaPath(user.profile_video));
        }
        if (user.profile_picture) {
          setProfileImage(convertToMediaPath(user.profile_picture));
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data");
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

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
      setAlertKey((prevKey) => prevKey + 1);
    }
  };
  const handleGenderSelection = (index) => {
    setSelectedGender(index);
    setFormData((prev) => ({
      ...prev,
      sex: version1Gender[index], // Update the sex in formData based on selected index
    }));
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFormData((prev) => ({
      ...prev,
      sexualOrientation: version1Orientations[index],
    }));
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      hobby: version1Hobbies[index] || "", // Make sure version1Hobbies is accessible here
    }));
  };
  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);

    setFormData((prevFormData) => ({
      ...prevFormData,
      floatsMyBoat: version1Keys[index],
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Reset the message and type to ensure the component re-renders
    setMessage("");
    setType("info");
    setAlertKey((prevKey) => prevKey + 1);
  
    const validationErrors = validateUser(formData, true);
    if (Object.keys(validationErrors).length === 0) {
      // No validation errors, proceed with form submission
      fetch(`/api/update_profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Profile update failed");
          }
          return response.json();
        })
        .then((data) => {
          setMessage("Profile updated successfully");
          setType("success");
          setAlertKey((prevKey) => prevKey + 1);
        })
        .catch((error) => {
          console.error("Update profile error:", error);
          setMessage("Profile update failed: " + error.message);
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        });
    } else {
      // Set the first validation error message
      const firstErrorKey = Object.keys(validationErrors)[0];
  
      setTimeout(() => {
        setMessage(validationErrors[firstErrorKey]);
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      }, 0);
    }
  };
  
  if (authError) {
    return <div>Unauthorized. Please log in.</div>;
  }
  return (
    <div>
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={() => navigate("/userlist", { state: { userId } })}
      >
        Back to messages
      </Button>

      <h2 className="font-style-4">Update Profile</h2>
      <div className="button-group">
        <ViewImage
          userId={userId}
          profileVideo={profileVideo}
          profileImage={profileImage}
        />
      </div>
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
          <div className="rounded-rectangle-wrapper">
            <h3 className="font-style-4">About You Survey</h3>
            <div>
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
            </div>
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
              <div>
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => setShowOrientation(!showOrientation)}
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
            </div>
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
                name="aboutYou"
                className="about-you-textarea"
                value={formData.aboutYou}
                placeholder="I am looking for a long term relationship. Look out for my Connection Request from the Communication Centre."
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                style={{ width: "100%", height: "100px" }} // Adjust styling as needed
              />
            </div>
          </div>
        </div>
        {message && (
          <AlertMessage key={alertKey} message={message} type={type} />
        )}
        <Button variant="outline-info" className="btn-sm" type="submit">
          Update Profile
        </Button>
      </form>
    </div>
  );
};

export default UpdateProfile;
