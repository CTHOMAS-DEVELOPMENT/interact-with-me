import React, { useRef } from "react";
import { hobbyTypes } from "./images";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowLeftCircleFill, ArrowRightCircleFill } from "react-bootstrap-icons";

const Hobbies = ({ onSelectHobby, selected }) => {
  const version1Hobbies = [
    "Arts", "Collecting", "Cooking", "Crafting", "Dance", "Education", "Fitness", "Gaming",
    "Gardening", "Meditation", "Music", "Other", "Photography", "Reading", "Sports", "Technology",
    "The Unknown", "Travel", "Volunteering", "Writing"
  ];

  const carouselRef = useRef(null);

  const handleSelect = (index) => {
    const newSelected = selected === index ? null : index;
    onSelectHobby(newSelected);
  };

  const scrollLeft = () => {
    carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
  };

  return (
    <div>
      {selected !== null ? (
        // Display only the selected item
        <div style={{ textAlign: "center" }}>
          <img
            src={hobbyTypes[selected]}
            alt={version1Hobbies[selected]}
            style={{ width: "auto", maxHeight: "300px" }}
          />
          <div>{version1Hobbies[selected]}</div>
          <input
            type="checkbox"
            checked={true}
            onChange={() => handleSelect(selected)}
            style={{ margin: "10px 0" }}
          />
        </div>
      ) : (
        // Display the entire carousel
        <div>
          <div ref={carouselRef} style={{ overflowX: "auto", whiteSpace: "nowrap", padding: "10px" }}>
            {hobbyTypes.map((imageSrc, index) => (
              <div key={index} style={{ display: "inline-block", width: "50%", textAlign: "center", padding: "5px" }}>
                <img
                  src={imageSrc}
                  alt={version1Hobbies[index]}
                  onClick={() => handleSelect(index)}
                  style={{ width: "100%", maxHeight: "300px", cursor: "pointer", border: selected === index ? '3px solid blue' : 'none' }}
                />
                <div>{version1Hobbies[index]}</div>
                <input
                  type="checkbox"
                  checked={selected === index}
                  onChange={() => handleSelect(index)}
                  style={{ margin: "10px 0" }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "center", margin: "10px 0" }}>
            <Button variant="outline-info" className="btn-icon" onClick={scrollLeft}>
              <ArrowLeftCircleFill size={25} />
            </Button>
            <Button variant="outline-info" className="btn-icon" onClick={scrollRight}>
              <ArrowRightCircleFill size={25} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hobbies;
