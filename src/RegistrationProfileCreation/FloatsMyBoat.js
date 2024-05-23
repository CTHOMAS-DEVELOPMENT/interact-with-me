import React, { useState } from "react";
import { carousel_1, carousel_2, carousel_3, carousel_4 } from "./images";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ArrowRightCircleFill } from "react-bootstrap-icons";

const FloatsMyBoat = ({ onSelectCarousel, selectedCarousel, defaultSize=300, noChexbox=false }) => {
  const [carouselIndexes, setCarouselIndexes] = useState([0, 0, 0, 0]); // Indexes for each carousel
  const carousels = [carousel_1, carousel_2, carousel_3, carousel_4];
  const nextImage = (index) => {
    setCarouselIndexes((prev) => {
      const newIndexes = [...prev];
      newIndexes[index] = (newIndexes[index] + 1) % carousels[index].length;
      return newIndexes;
    });
  };

  const handleCheckboxChange = (idx) => {
    if (selectedCarousel === idx) {
      onSelectCarousel(null); // Deselect if it's already selected
    } else {
      onSelectCarousel(idx); // Select the carousel
    }
  };

  return (
    <div>
      { 
      carousels.map((carousel, idx) => (
        <div
          key={idx}
          style={{
            marginBottom: "20px",
            display:
              selectedCarousel === idx || selectedCarousel === null
                ? "block"
                : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <img
              src={carousel[carouselIndexes[idx]]}
              alt={`Carousel ${idx + 1}`}
              style={{ height: `${defaultSize}px`, width: "auto" }}
            />
            <div
              style={{
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Button
                variant="outline-info"
                className="btn-icon"
                onClick={() => nextImage(idx)}
              >
                <ArrowRightCircleFill size={25} />
              </Button>
              {!noChexbox && <input
                type="checkbox"
                checked={selectedCarousel === idx}
                onChange={() => handleCheckboxChange(idx)}
                style={{ marginLeft: "10px" }}
              />}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FloatsMyBoat;
