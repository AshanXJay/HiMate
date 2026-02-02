import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

/**
 * Reusable dashboard header component with navigation
 * Used on both Student and Warden dashboards
 */
const DashboardHeader = ({ title, subtitle, isWarden = false }) => {
    const { user, logout } = useContext(AuthContext);

    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
            borderBottom: '1px solid var(--color-border)'
        }}>
            {/* Left: Brand & Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.75rem' }}>🤝</span>
                    <span style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: 'var(--color-primary)',
                        letterSpacing: '-0.02em'
                    }}>HiMate</span>
                </Link>
                <div style={{ height: '24px', width: '1px', background: 'var(--color-border)' }} />
                <div>
                    <h1 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '600' }}>{title}</h1>
                    {subtitle && (
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{subtitle}</p>
                    )}
                </div>
            </div>

            {/* Right: Nav Links & User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isWarden ? (
                    <>
                        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Dashboard
                        </Link>
                        <Link to="/admin/allocation" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Allocations
                        </Link>
                        <Link to="/admin/requests/hostel" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Requests
                        </Link>
                        <Link to="/admin/hostels" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Hostels
                        </Link>
                    </>
                ) : (
                    <>
                        {/*<Link to="/dashboard" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Dashboard
                        </Link>
                        <Link to="/profile" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                            Profile
                        </Link>*/}
                    </>
                )}

                <div style={{ height: '24px', width: '1px', background: 'var(--color-border)', marginLeft: '0.5rem' }} />

                {/* User info and logout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        {user?.full_name || user?.username || 'User'}
                    </span>
                    <button
                        onClick={logout}
                        className="btn"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            background: 'transparent',
                            border: '1px solid var(--color-error)',
                            color: 'var(--color-error)'
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;
