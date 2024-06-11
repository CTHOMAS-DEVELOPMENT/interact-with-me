import React, { useState } from "react";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections.js";

const FilterUsers = ({ applyFilter, closeWindow }) => {
  const [filters, setFilters] = useState({
    username: "",
    sexualOrientation: "",
    hobbies: "",
    floatsMyBoat: "",
    sex: "",
    aboutYou: "",
  });
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showOrientation, setShowOrientation] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [showHobbies, setShowHobbies] = useState(false);
  // Dropdown options extracted from environment variables
  const showButton =
    filters.username.length > 3 ||
    filters.sexualOrientation !== "" ||
    filters.hobbies !== "" ||
    filters.floatsMyBoat !== "" ||
    filters.sex !== "" ||
    filters.aboutYou.trim().length > 0;
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };
  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);

    setFilters((prevFilters) => ({
      ...prevFilters,
      floatsMyBoat: version1Keys[index],
    }));
  };
  const handleGenderSelection = (index) => {
    setSelectedGender(index);

    setFilters((prevFilters) => ({
      ...prevFilters,
      sex: version1Gender[index],
    }));
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFilters((prevFilters) => ({
      ...prevFilters,
      sexualOrientation: version1Orientations[index],
    }));
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFilters((prevFilters) => ({
      ...prevFilters,
      hobbies: version1Hobbies[index] || "", // Make sure version1Hobbies is accessible here
    }));
  };
  const svgStyle = {
    position: "absolute",
    left: "-40px",
    top: "50%",
    transform: "translateY(-50%)",
    animation: "float 2s ease-in-out infinite",
  };
  return (
    <div
      className="filter-users"
      style={{
        maxWidth: "500px",
        margin: "0 auto",
        padding: "20px",
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        name="username"
        className="form-control mb-2" // Added Bootstrap classes for styling
        value={filters.username}
        onChange={handleChange}
        placeholder="Username"
      />

      <div>
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={() => setShowOrientation(!showOrientation)}
        >
          {showOrientation
            ? "Hide Filter by Orientation"
            : "Show Filter by Orientation"}
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
          onClick={() => setShowHobbies(!showHobbies)}
        >
          {showHobbies ? "Hide Filter by Hobbies" : "*Show Filter by Hobbies"}
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
          onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
        >
          {showFloatsMyBoat
            ? "Hide Filter by Floats My Boat"
            : "Show Filter by Floats My Boat"}
        </Button>
      </div>

      {showFloatsMyBoat && (
        <FloatsMyBoat
          onSelectCarousel={handleCarouselSelection}
          selectedCarousel={selectedCarousel}
        />
      )}
      <div>
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={() => setShowGender(!showGender)}
        >
          {showGender ? "Hide Filter by Gender" : "Show Filter by Gender"}
        </Button>
      </div>

      {showGender && (
        <Gender
          onSelectGender={handleGenderSelection}
          selected={selectedGender}
        />
      )}

      <textarea
        name="aboutYou"
        className="form-control mb-2"
        value={filters.aboutYou}
        onChange={handleChange}
        placeholder="About You"
      />

      <div style={{ position: "relative", display: "inline-block" }}>
        {showButton && (
          <svg width="30" height="30" style={svgStyle}>
            <polygon points="0,0 30,15 0,30" fill="blue" />
          </svg>
        )}
        {showButton && (
          <Button variant="outline-info" onClick={() => applyFilter(filters)}>
            Apply Filters
          </Button>
        )}
      </div>
      <Button variant="outline-info" onClick={() => closeWindow()}>
        Close
      </Button>
    </div>
  );
};

export default FilterUsers;
