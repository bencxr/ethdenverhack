import React from 'react';
import './NFTGallery.css';

export const NFTGallery = ({ nfts, isLoading }) => {
    if (isLoading) {
        return <div className="nft-gallery-loading">Loading NFTs...</div>;
    }

    if (!nfts || nfts.length === 0) {
        return <div className="nft-gallery-empty">No NFTs found</div>;
    }

    return (
        <div className="nft-gallery">
            <h2>Some Paintings Gifted to our HODL Jar Sponsors</h2>
            <div className="nft-grid">
                {nfts.map((nft, index) => (
                    <div key={index} className="nft-card">
                        <div className="nft-image-container">
                            <img
                                src={nft.image || nft.metadata?.image}
                                alt={nft.name || nft.metadata?.name || 'NFT'}
                                className="nft-image"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/200?text=No+Image';
                                }}
                            />
                        </div>
                        <div className="nft-details">
                            <h3>{nft.name || nft.metadata?.name || 'Untitled NFT'}</h3>
                            <p className="nft-description">
                                {nft.description || nft.metadata?.description || 'No description available'}
                            </p>
                            {nft.tokenId && (
                                <p className="nft-token-id">Token ID: {nft.tokenId}</p>
                            )}
                            {nft.jarId && (
                                <p className="nft-jar-id">Jar ID: {nft.jarId}</p>
                            )}
                            {nft.contractAddress && (
                                <p className="nft-contract">
                                    Contract: <a
                                        href={`https://sepolia.etherscan.io/address/${nft.contractAddress}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {`${nft.contractAddress.substring(0, 6)}...${nft.contractAddress.substring(38)}`}
                                    </a>
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 