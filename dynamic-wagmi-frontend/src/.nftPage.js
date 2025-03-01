import { useState, useEffect } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import { fetchAllCollectionNFTs } from './utils/nftFetching';
import { NavBar } from "./components/NavBar";
import './nftPage.css';

/**
 * @typedef {Object} NFT
 * @property {string} id
 * @property {string} name
 * @property {string} description
 * @property {string} image
 * @property {Array<{trait_type: string, value: string}>} [attributes]
 */

export function NFTGalleryPage() {
  const { primaryWallet } = useDynamicContext();
  const [nfts, setNfts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    async function loadNFTs() {
      if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
        setError("No Ethereum wallet connected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await fetchAllCollectionNFTs(primaryWallet);
        
        if (result.success) {
          setNfts(result.nfts);
          setError(null);
        } else {
          setError(result.message || "Failed to fetch NFTs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    loadNFTs();
  }, [primaryWallet]);

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  return (
    <div className="nft-gallery-page">
      <NavBar />
      <header className="gallery-header">
        <h1>Art for Sponsors</h1>
        <p>Browse some of the art that kids drew for their sponsors</p>
      </header>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your NFT collection...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {!isLoading && !error && nfts.length === 0 && (
        <div className="empty-collection">
          <h2>No NFTs Found</h2>
          <p>You don't have any NFTs in your collection yet.</p>
        </div>
      )}

      <div className="nft-grid">
        {nfts.map((nft) => (
          <div 
            key={nft.id} 
            className="nft-card" 
            onClick={() => handleNFTClick(nft)}
          >
            <div className="nft-image-container">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="nft-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
            <div className="nft-info">
              <h3 className="nft-title">{nft.name}</h3>
              <p className="nft-description">{nft.description.substring(0, 60)}...</p>
            </div>
          </div>
        ))}
      </div>

      {selectedNFT && (
        <div className="nft-modal-overlay" onClick={closeModal}>
          <div className="nft-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>×</button>
            <div className="nft-modal-content">
              <div className="nft-modal-image">
                <img src={selectedNFT.image} alt={selectedNFT.name} />
              </div>
              <div className="nft-modal-details">
                <h2>{selectedNFT.name}</h2>
                <p className="nft-full-description">{selectedNFT.description}</p>
                
                {selectedNFT.attributes && selectedNFT.attributes.length > 0 && (
                  <div className="nft-attributes">
                    <h3>Attributes</h3>
                    <div className="attributes-grid">
                      {selectedNFT.attributes.map((attr, index) => (
                        <div key={index} className="attribute-item">
                          <span className="attribute-type">{attr.trait_type}</span>
                          <span className="attribute-value">{attr.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}