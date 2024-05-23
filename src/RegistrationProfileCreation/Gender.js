import React from "react";
import { genderTypes } from "./images";
import "bootstrap/dist/css/bootstrap.min.css";

const Gender = ({ onSelectGender, selected, defaultSize=300, noChexbox=false}) => {

  const handleSelect = (index) => {
    const newSelected = selected === index ? null : index;
    onSelectGender(newSelected);
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {genderTypes.map((imageSrc, index) => (
        <li key={index} style={{ display: selected !== null && selected !== index ? 'none' : 'block', cursor: 'pointer', textAlign: 'center' }}>
          <img 
            src={imageSrc} 
            alt={`Orientation ${index + 1}`} 
            onClick={() => handleSelect(index)}
            style={{ border: selected === index ? '3px solid blue' : 'none', height: `${defaultSize}px`, width: "auto" }}
          />
          {!noChexbox && <div>
            <input
              type="checkbox"
              checked={selected === index}
              onChange={() => handleSelect(index)}
              style={{ marginTop: '10px' }}
            />
          </div>}
        </li>
      ))}
    </ul>
  );
};

export default Gender;
