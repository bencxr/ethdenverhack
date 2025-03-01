import React, { useState, useEffect } from "react";
import "./landingPage.css";
import { Link } from "react-router-dom";
import { NavBar } from "./components/NavBar";

const KryptoKidsLanding = () => {
  const [email, setEmail] = useState("");
  const [stars, setStars] = useState([]);

  // Generate stars on component mount
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      const starCount = 100; // Adjust number of stars as needed

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size:
            Math.random() < 0.6
              ? "small"
              : Math.random() < 0.9
              ? "medium"
              : "large",
          animationDelay: `${Math.random() * 4}s`,
        });
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="landing-page">
      {/* Stars background */}
      <div className="stars-container">
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star ${star.size}`}
            style={{
              left: star.left,
              top: star.top,
              animationDelay: star.animationDelay,
            }}
          />
        ))}
      </div>

      <NavBar />

      <main>
        <h1>Empower Foster Kids with Crypto</h1>
        <p className="subtitle">
          Create lasting impact through smart-contract staking and unique NFT
          art
        </p>
        <div className="cta-form">
          <Link to="/main">
            <button className="cta-button">
              Sponsor a Kid
              <svg
                className="arrow-icon"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19M19 12L12 5M19 12L12 19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div>
      </main>

      <footer>
        <p>&copy; 2025 KryptoKids. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default KryptoKidsLanding;
