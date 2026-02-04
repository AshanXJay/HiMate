import React from 'react';

/**
 * Reusable stat card component for dashboards
 * @param {string} icon - Emoji icon
 * @param {number|string} value - The stat value
 * @param {string} label - Description label
 * @param {string} color - Color variant: 'primary', 'success', 'warning', 'default'
 */
const StatCard = ({ icon, value, label, color = 'default' }) => {
    const colorMap = {
        primary: {
            gradient: 'rgba(255, 102, 0, 0.08)',
            text: 'var(--color-primary)'
        },
        success: {
            gradient: 'rgba(74, 222, 128, 0.08)',
            text: 'var(--color-success)'
        },
        warning: {
            gradient: 'rgba(251, 191, 36, 0.08)',
            text: 'var(--color-warning)'
        },
        error: {
            gradient: 'rgba(251, 113, 133, 0.08)',
            text: 'var(--color-error)'
        },
        default: {
            gradient: 'rgba(255, 255, 255, 0.05)',
            text: 'white'
        }
    };

    const colors = colorMap[color] || colorMap.default;

    return (
        <div
            className="card"
            style={{
                background: `linear-gradient(135deg, var(--color-surface) 0%, ${colors.gradient} 100%)`
            }}
        >
            <div className="flex items-center gap-4">
                <span style={{ fontSize: '2rem' }}>{icon}</span>
                <div>
                    <h3 style={{ fontSize: '1.75rem', margin: 0, color: colors.text }}>
                        {value}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                        {label}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StatCard;
