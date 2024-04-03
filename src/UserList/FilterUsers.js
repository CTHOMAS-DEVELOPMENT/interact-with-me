import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

const FilterUsers = ({ applyFilter }) => {
  const [filters, setFilters] = useState({
    username: '',
    sexualOrientation: '',
    hobbies: '',
    floatsMyBoat: '',
    sex: '',
  });

  // Dropdown options extracted from environment variables
  const hobbyOptions = process.env.REACT_APP_HOBBY_TYPE.split(",");
  const sexualOrientationOptions = process.env.REACT_APP_SEXUAL_ORIENTATION_TYPE.split(",");
  const floatsMyBoatOptions = process.env.REACT_APP_FLOATS_MY_BOAT_TYPE.split("|");
  const showButton = filters.username.length > 3 ||
                      filters.sexualOrientation !== '' ||
                      filters.hobbies !== '' ||
                      filters.floatsMyBoat !== '' ||
                      filters.sex !== '';
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  return (
    <div className="filter-users">
      <input
        type="text"
        name="username"
        className="form-control mb-2" // Added Bootstrap classes for styling
        value={filters.username}
        onChange={handleChange}
        placeholder="Username"
      />
      <select name="sexualOrientation" className="form-control mb-2" value={filters.sexualOrientation} onChange={handleChange}>
        <option value="">Select Sexual Orientation</option>
        {sexualOrientationOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select name="hobbies" className="form-control mb-2" value={filters.hobbies} onChange={handleChange}>
        <option value="">Select Hobby</option>
        {hobbyOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select name="floatsMyBoat" className="form-control mb-2" value={filters.floatsMyBoat} onChange={handleChange}>
        <option value="">Select what floats your boat</option>
        {floatsMyBoatOptions.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      <select name="sex" className="form-control mb-3" value={filters.sex} onChange={handleChange}>
        <option value="">Select your sex</option>
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>

        {showButton && (
        <Button
          variant="outline-info"
          onClick={() => applyFilter(filters)}>Apply Filters
        </Button>
      )}
    </div>
  );

};

export default FilterUsers;
