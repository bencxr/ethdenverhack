// src/components/NavBar.js
import { useState } from 'react';
import { Link } from "react-router-dom";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import "./NavBar.css";

export function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/" className="logo-link">
            KryptoKids
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="navbar-links">
          <Link to="/main" className="nav-link">
            Donate
          </Link>
          <Link to="/nfts" className="nav-link">
            NFTs
          </Link>
        </nav>

        {/* Wallet connection widget */}
        <div className="navbar-auth">
          <DynamicWidget />
        </div>

        {/* Mobile menu button */}
        <button 
          className="menu-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <span className={`menu-icon ${isMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="mobile-menu">
          <Link 
            to="/" 
            className="mobile-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/jars" 
            className="mobile-link"
            onClick={() => setIsMenuOpen(false)}
          >
            Kids
          </Link>
          <Link 
            to="/nfts" 
            className="mobile-link"
            onClick={() => setIsMenuOpen(false)}
          >
            NFTs
          </Link>
          <div className="mobile-auth">
            <DynamicWidget />
          </div>
        </div>
      )}
    </header>
  );
}

