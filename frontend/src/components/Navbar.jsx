import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="brand">
                <span role="img" aria-label="logo" style={{ fontSize: '1.5rem' }}>🤝</span> HiMate
            </div>

            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/rooms" className="nav-link">Rooms</Link>
                {/* Auth Links (Placeholder for dynamic check) */}
                <Link to="/login" className="nav-link">Login</Link>
            </div>
        </nav>
    );
};

export default Navbar;
