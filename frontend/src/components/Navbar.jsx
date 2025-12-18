import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    return (
        <nav className="navbar">
            <div className="brand">
                <span role="img" aria-label="logo" style={{ fontSize: '1.5rem' }}>🤝</span> HiMate
            </div>

            <div className="nav-links">
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/rooms" className="nav-link">Rooms</Link>
                {user ? (
                    <button onClick={logout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Logout
                    </button>
                ) : (
                    <Link to="/login" className="nav-link">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
