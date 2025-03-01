import { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import { fetchAllHODLJars } from "./utils/hodlJarFetching";
import { donateToHODLJar } from "./utils/hodlJarDonation";
import { NavBar } from "./components/NavBar";
import "./HODLJarListingPage.css";

/**
 * @typedef {Object} HODLJar
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} targetAmount
 * @property {string} currentAmount
 * @property {string} deadline
 * @property {string} donor
 * @property {boolean} isCompleted
 */

export function HODLJarListingsPage() {
  const { primaryWallet, isAuthenticated } = useDynamicContext();
  const [hodlJars, setHodlJars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donationAmounts, setDonationAmounts] = useState({});
  const [processingDonation, setProcessingDonation] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationJar, setCelebrationJar] = useState(null);

  useEffect(() => {
    async function loadHODLJars() {
      try {
        setIsLoading(true);

        // Skip fetching if wallet isn't ready yet, but don't show an error
        if (!primaryWallet) {
          setIsLoading(false);
          return; // Just return without setting an error
        }

        const result = await fetchAllHODLJars(primaryWallet);

        if (result.success) {
          setHodlJars(result.jars);
          // Initialize donation amounts
          const initialDonationAmounts = {};
          result.jars.forEach((jar) => {
            initialDonationAmounts[jar.id || jar.address] = "500";
          });
          setDonationAmounts(initialDonationAmounts);
          // Clear any previous errors when successful
          setError(null);
        } else {
          // Don't set error if it's about wallet connection
          if (!result.message?.includes("Wallet not connected")) {
            setError(result.message || "Failed to fetch HODL jars");
          }
        }
      } catch (err) {
        // Don't set error for wallet connection issues
        if (!err.message?.includes("Wallet not connected")) {
          setError("An unexpected error occurred while fetching HODL jars");
        }
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadHODLJars();
  }, [primaryWallet]);

  const handleDonationAmountChange = (jarId, amount) => {
    setDonationAmounts((prev) => ({
      ...prev,
      [jarId]: amount,
    }));
  };

  const handleDonate = async (jarId) => {
    try {
      setProcessingDonation(jarId);
      setError(null);
      setSuccessMessage(null);

      const result = await donateToHODLJar(primaryWallet, {
        jarId,
        amount: donationAmounts[jarId],
      });

      if (result.success) {
        setSuccessMessage(result.message || "Donation successful!");

        // Find the jar that was donated to
        const donatedJar = hodlJars.find(
          (jar) => (jar.id || jar.address) === jarId
        );
        setCelebrationJar(donatedJar);
        setShowCelebration(true);

        // Hide celebration after 5 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 5000);

        // Refresh the HODL jars to show updated amounts
        const updatedJars = await fetchAllHODLJars(primaryWallet);
        if (updatedJars.success) {
          setHodlJars(updatedJars.jars);
        }
      } else {
        setError(result.message || "Donation failed");
      }
    } catch (err) {
      setError("An unexpected error occurred during donation");
      console.error(err);
    } finally {
      setProcessingDonation(null);
    }
  };

  const formatDeadline = (deadline) => {
    return new Date(parseInt(deadline) * 1000).toLocaleDateString();
  };

  const calculateProgress = (current, target) => {
    const currentValue = parseFloat(current);
    const targetValue = parseFloat(target);
    return targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
  };

  if (isLoading) {
    return (
      <>
        <NavBar />
        <div className="hodl-jar-listings-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading HODL jars...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="hodl-jar-listings-page">
        <header className="page-header">
          <h1>Support the future of web3</h1>
          <h1>One HODL Jar at a time</h1>
        </header>

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)}>Dismiss</button>
          </div>
        )}

        {/* Celebration Popup */}
        {showCelebration && celebrationJar && (
          <div className="celebration-overlay">
            <div className="celebration-popup">
              <div className="confetti-container">
                {[...Array(50)].map((_, i) => (
                  <div key={i} className={`confetti confetti-${i % 5}`}></div>
                ))}
              </div>
              <div className="celebration-content">
                <div className="celebration-icon">🎉</div>
                <h2>Amazing! You're a Hero!</h2>
                <p>
                  Your donation to{" "}
                  <strong>
                    {celebrationJar.name ||
                      celebrationJar.kidname ||
                      "this HODL Jar"}
                  </strong>{" "}
                  will make a real difference!
                </p>
                <div className="impact-message">
                  <div className="impact-icon">💖</div>
                  <p>You've just helped build a brighter future in web3!</p>
                </div>
                <button
                  className="close-celebration-btn"
                  onClick={() => setShowCelebration(false)}
                >
                  Continue Being Awesome
                </button>
              </div>
            </div>
          </div>
        )}

        {hodlJars.length === 0 && !isLoading && !error ? (
          <div className="empty-state">
            <p>No HODL jars found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="hodl-jars-grid">
            {hodlJars.map((jar) => (
              <div
                key={jar.id || jar.address}
                className={`hodl-jar-card ${
                  jar.isCompleted ? "completed" : ""
                } animate-on-hover`}
              >
                <div className="jar-header">
                  <h2>{jar.name || jar.kidname}</h2>
                  {jar.isCompleted && (
                    <span className="completed-badge">Completed</span>
                  )}
                </div>

                {jar.imageurl && (
                  <div className="jar-image-container">
                    <img
                      src={jar.imageurl}
                      alt={jar.name || jar.kidname || "HODL Jar"}
                      className="jar-image"
                    />
                  </div>
                )}

                <p className="jar-description">
                  {jar.description || jar.story}
                </p>

                <div className="jar-progress-container">
                  <div
                    className="jar-progress-bar"
                    style={{
                      width: `${Math.min(
                        calculateProgress(jar.currentAmount, jar.targetAmount),
                        100
                      )}%`,
                    }}
                  ></div>
                  <div className="jar-progress-text">
                    <span>{parseFloat(jar.currentAmount).toFixed(2)} USDC</span>
                    <span>
                      of {parseFloat(jar.targetAmount).toFixed(2)} USDC
                    </span>
                  </div>
                </div>

                <div className="jar-details">
                  {/* <div className="jar-detail">
                    <span className="detail-label">Deadline:</span>
                    <span className="detail-value">
                      {formatDeadline(jar.deadline)}
                    </span>
                  </div> */}
                  <div className="jar-detail">
                    <span className="detail-label">Sponsor:</span>
                    <span className="detail-value address">
                      {jar.donor &&
                      jar.donor !== "0x0000000000000000000000000000000000000000"
                        ? `${jar.donor.substring(0, 6)}...${jar.donor.substring(
                            jar.donor.length - 4
                          )}`
                        : "You?"}
                    </span>
                  </div>
                  {jar.age && (
                    <div className="jar-detail">
                      <span className="detail-label">Age:</span>
                      <span className="detail-value">{jar.age}</span>
                    </div>
                  )}
                  {jar.fosterHome && (
                    <div className="jar-detail">
                      <span className="detail-label">Foster Home:</span>
                      <span className="detail-value address">
                        {`${jar.fosterHome.substring(
                          0,
                          6
                        )}...${jar.fosterHome.substring(
                          jar.fosterHome.length - 4
                        )}`}
                      </span>
                    </div>
                  )}
                </div>

                {!jar.isCompleted && (
                  <div className="donation-controls">
                    {jar.donor &&
                    jar.donor !==
                      "0x0000000000000000000000000000000000000000" ? (
                      <div className="filled-jar-status">
                        <span className="green-tick">✓</span>
                        <span className="filled-text">HODL Jar filled</span>
                      </div>
                    ) : (
                      <>
                        <div className="donation-input-group">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={donationAmounts[jar.id || jar.address]}
                            onChange={(e) =>
                              handleDonationAmountChange(
                                jar.id || jar.address,
                                e.target.value
                              )
                            }
                            className="donation-amount-input"
                          />
                          <span className="eth-label">USDC</span>
                        </div>
                        <button
                          className="donate-button coin-animation"
                          onClick={() => handleDonate(jar.id || jar.address)}
                          disabled={
                            processingDonation === (jar.id || jar.address)
                          }
                        >
                          {processingDonation === (jar.id || jar.address) ? (
                            <span className="processing-donation">
                              <span className="spinner"></span> Processing...
                            </span>
                          ) : (
                            <>
                              <span className="coin-icon">🪙</span>
                              <span>Fill HODL Jar</span>
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <style jsx global>{`
        /* Card hover animation */
        .animate-on-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .animate-on-hover:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
        }

        /* Coin animation for donation button */
        .coin-animation {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .coin-animation:hover {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          transform: scale(1.05);
        }

        .coin-animation:hover::before {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(45deg);
          animation: shine 1.5s infinite;
        }

        .coin-icon {
          display: inline-block;
          margin-right: 8px;
          animation: bounce 0.6s ease infinite alternate;
        }

        @keyframes bounce {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-4px);
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%) rotate(45deg);
          }
          100% {
            transform: translateX(100%) rotate(45deg);
          }
        }

        /* Progress bar animation */
        .jar-progress-bar {
          transition: width 1s ease-in-out;
          background: linear-gradient(90deg, #4caf50, #45a049);
        }

        /* Celebration Overlay */
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          animation: fadeIn 0.5s ease-out;
        }

        .celebration-popup {
          background: linear-gradient(135deg, #ffffff, #f5f7ff);
          border-radius: 20px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
          text-align: center;
          position: relative;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .celebration-content {
          position: relative;
          z-index: 10;
        }

        .celebration-icon {
          font-size: 60px;
          margin-bottom: 20px;
          animation: bounce 1s ease infinite alternate;
        }

        .celebration-popup h2 {
          color: #4a4a4a;
          margin-bottom: 15px;
          font-size: 28px;
        }

        .celebration-popup p {
          color: #666;
          margin-bottom: 20px;
          font-size: 18px;
        }

        .impact-message {
          background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
          padding: 15px;
          border-radius: 12px;
          margin: 20px 0;
          display: flex;
          align-items: center;
          animation: pulse 2s infinite;
        }

        .impact-icon {
          font-size: 30px;
          margin-right: 15px;
        }

        .impact-message p {
          margin: 0;
          color: #2e7d32;
          font-weight: 500;
        }

        .close-celebration-btn {
          background: linear-gradient(135deg, #6e8efb, #a777e3);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 30px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .close-celebration-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 7px 20px rgba(0, 0, 0, 0.2);
        }

        /* Confetti Animation */
        .confetti-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: #f00;
          opacity: 0.7;
          animation: confetti-fall 5s linear infinite;
        }

        .confetti-0 {
          background-color: #f44336;
        }
        .confetti-1 {
          background-color: #2196f3;
        }
        .confetti-2 {
          background-color: #ffeb3b;
        }
        .confetti-3 {
          background-color: #4caf50;
        }
        .confetti-4 {
          background-color: #9c27b0;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes popIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.03);
          }
        }

        /* Position each confetti piece differently */
        ${[...Array(50)]
          .map(
            (_, i) => `
          .confetti-${i} {
            left: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
            animation-duration: ${3 + Math.random() * 4}s;
            width: ${5 + Math.random() * 10}px;
            height: ${5 + Math.random() * 10}px;
            border-radius: ${Math.random() > 0.5 ? "50%" : "0"};
          }
        `
          )
          .join("")}
      `}</style>
    </>
  );
}
