import React from 'react';
import './HODLJarsList.css';

// Helper function to truncate text
const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
};

export const HODLJarsList = ({ hodlJars }) => {
    if (!hodlJars || hodlJars.length === 0) {
        return <div className="no-jars-message">No HODL Jars found.</div>;
    }

    return (
        <div className="jars-container">
            <h3>All HODL Jars</h3>
            <div className="jars-grid">
                {hodlJars.map((jar, index) => (
                    <div key={index} className="jar-card">
                        <h4>{jar.kidname}</h4>
                        {jar.imageurl && (
                            <img
                                src={jar.imageurl}
                                alt={jar.kidname}
                                className="jar-image"
                            />
                        )}
                        <p><strong>Age:</strong> {jar.age}</p>
                        <p><strong>Story:</strong> {jar.story}</p>
                        <p><strong>Address:</strong> {jar.address}</p>
                        <p><strong>Foster Home:</strong> {truncateText(jar.fosterHome, 20)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}; 