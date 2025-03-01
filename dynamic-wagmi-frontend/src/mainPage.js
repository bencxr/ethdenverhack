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
            initialDonationAmounts[jar.id || jar.address] = "0.01";
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
          <h1>Support the future of web3, one donation at a time.</h1>
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
                }`}
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
                      {jar.donor
                        ? `${jar.donor.substring(0, 6)}...${jar.donor.substring(
                            jar.donor.length - 4
                          )}`
                        : "Unknown sponsor"}
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
                      className="donate-button"
                      onClick={() => handleDonate(jar.id || jar.address)}
                      disabled={processingDonation === (jar.id || jar.address)}
                    >
                      {processingDonation === (jar.id || jar.address) ? (
                        <span className="processing-donation">
                          <span className="spinner"></span> Processing...
                        </span>
                      ) : (
                        "Donate"
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
