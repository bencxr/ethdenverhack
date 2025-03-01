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
        });
      }

      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="landing-page">
      {/* Stars background - using inline styles to ensure visibility */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: -1,
          overflow: "hidden",
        }}
      >
        {stars.map((star) => (
          <div
            key={star.id}
            style={{
              position: "absolute",
              left: star.left,
              top: star.top,
              width:
                star.size === "small"
                  ? "1px"
                  : star.size === "medium"
                  ? "2px"
                  : "3px",
              height:
                star.size === "small"
                  ? "1px"
                  : star.size === "medium"
                  ? "2px"
                  : "3px",
              backgroundColor: "white",
              borderRadius: "50%",
            }}
          />
        ))}
      </div>

      <NavBar />

      <main>
        <h1>Sustainable support for foster youth</h1>
        <p className="subtitle">
          Create lasting impact through DeFi yield and receive unique NFT
          art
        </p>
        <div className="cta-form">
          <Link to="/main">
            <button className="cta-button glow-on-hover">
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

        {/* How It Works Section */}
        <section className="how-it-works">
          {/* <h2>How It Works</h2> */}
          <div className="process-cards">
            {/* Card 1 */}
            <div className="process-card">
              <div className="card-number">1</div>
              <div className="card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM12.31 11.14C10.54 10.69 9.97 10.2 9.97 9.47C9.97 8.63 10.76 8.04 12.07 8.04C13.45 8.04 13.97 8.7 14.01 9.68H15.72C15.67 8.34 14.85 7.11 13.23 6.71V5H10.9V6.69C9.39 7.01 8.18 7.99 8.18 9.5C8.18 11.29 9.67 12.19 11.84 12.71C13.79 13.17 14.18 13.86 14.18 14.58C14.18 15.11 13.79 15.97 12.08 15.97C10.48 15.97 9.85 15.25 9.76 14.33H8.04C8.14 16.03 9.4 16.99 10.9 17.3V19H13.24V17.33C14.76 17.04 15.98 16.17 15.98 14.56C15.98 12.36 14.07 11.6 12.31 11.14Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3>Sponsor Donates</h3>
              <p>
                Sponsor contributes USDC into a secure HODL Jar for a foster
                youth
              </p>
            </div>

            {/* Card 2 */}
            <div className="process-card">
              <div className="card-number">2</div>
              <div className="card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                    fill="currentColor"
                  />
                  <path d="M7 12H9V17H7V12Z" fill="currentColor" />
                  <path d="M11 7H13V17H11V7Z" fill="currentColor" />
                  <path d="M15 9H17V17H15V9Z" fill="currentColor" />
                </svg>
              </div>
              <h3>Yield Generation</h3>
              <p>
                Funds are supplied to a yield vault, generating sustainable
                returns
              </p>
            </div>

            {/* Card 3 */}
            <div className="process-card">
              <div className="card-number">3</div>
              <div className="card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                    fill="currentColor"
                  />
                  <path d="M12 11L10 8H14L12 11Z" fill="currentColor" />
                  <path d="M12 13L14 16H10L12 13Z" fill="currentColor" />
                </svg>
              </div>
              <h3>Monthly Distributions</h3>
              <p>
                Profits are automatically distributed to the youth each month
              </p>
            </div>

            {/* Card 4 */}
            <div className="process-card">
              <div className="card-number">4</div>
              <div className="card-icon">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z"
                    fill="currentColor"
                  />
                  <path
                    d="M14.5 11C15.33 11 16 10.33 16 9.5C16 8.67 15.33 8 14.5 8C13.67 8 13 8.67 13 9.5C13 10.33 13.67 11 14.5 11Z"
                    fill="currentColor"
                  />
                  <path
                    d="M7 16H17L13.5 12L11 14.5L9.5 13.5L7 16Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3>NFT Reward</h3>
              <p>
                Sponsors receive a special drawing from the youth that can be
                minted as an NFT
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2025 KryptoKids. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default KryptoKidsLanding;
