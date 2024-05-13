import React from "react";
import { genderTypes } from "./images";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const Gender = ({ onSelectGender, selected }) => {

  const handleSelect = (index) => {
    const newSelected = selected === index ? null : index;
    onSelectGender(newSelected);
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {genderTypes.map((imageSrc, index) => (
        <li key={index} style={{ display: selected !== null && selected !== index ? 'none' : 'block', margin: '10px', cursor: 'pointer', textAlign: 'center' }}>
          <img 
            src={imageSrc} 
            alt={`Orientation ${index + 1}`} 
            onClick={() => handleSelect(index)}
            style={{ border: selected === index ? '3px solid blue' : 'none', height: "300px", width: "auto" }}
          />
          <div>
            <input
              type="checkbox"
              checked={selected === index}
              onChange={() => handleSelect(index)}
              style={{ marginTop: '10px' }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

export default Gender;
