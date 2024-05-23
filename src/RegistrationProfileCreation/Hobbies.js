import React, { useRef } from "react";
import { hobbyTypes } from "./images";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ArrowLeftCircleFill,
  ArrowRightCircleFill,
} from "react-bootstrap-icons";
import { version1Hobbies } from "./scopedCollections";
const Hobbies = ({
  onSelectHobby,
  selected,
  defaultSize = 300,
  noTitle = false,
  noChexbox = false,
}) => {
  const carouselRef = useRef(null);

  const handleSelect = (index) => {
    const newSelected = selected === index ? null : index;
    onSelectHobby(newSelected);
  };

  const scrollLeft = () => {
    carouselRef.current.scrollBy({
      left: -`${defaultSize}`,
      behavior: "smooth",
    });
  };

  const scrollRight = () => {
    carouselRef.current.scrollBy({
      left: `${defaultSize}`,
      behavior: "smooth",
    });
  };

  return (
    <div>
      {selected !== null ? (
        // Display only the selected item
        <div style={{ textAlign: "center" }}>
          <img
            src={hobbyTypes[selected]}
            alt={version1Hobbies[selected]}
            style={{
              width: "100%",
              maxHeight: `${defaultSize}px`,
              objectFit: "contain",
            }}
          />
          {!noTitle && <div>{version1Hobbies[selected]}</div>}
          {!noChexbox && (
            <input
              type="checkbox"
              checked={true}
              onChange={() => handleSelect(selected)}
              style={{ margin: "10px 0" }}
            />
          )}
        </div>
      ) : (
        // Display the entire carousel
        <div>
          <div
            ref={carouselRef}
            style={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              padding: "10px",
              maxWidth: "100%",
            }}
          >
            {hobbyTypes.map((imageSrc, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  textAlign: "center",
                  padding: "5px",
                }}
              >
                <img
                  src={imageSrc}
                  alt={version1Hobbies[index]}
                  onClick={() => handleSelect(index)}
                  style={{
                    width: "100%",
                    maxHeight: `${defaultSize}px`,
                    cursor: "pointer",
                    border: selected === index ? "3px solid blue" : "none",
                    objectFit: "contain",
                  }}
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
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "10px 0",
            }}
          >
            <Button
              variant="outline-info"
              className="btn-icon"
              onClick={scrollLeft}
            >
              <ArrowLeftCircleFill size={25} />
            </Button>
            <Button
              variant="outline-info"
              className="btn-icon"
              onClick={scrollRight}
            >
              <ArrowRightCircleFill size={25} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hobbies;
