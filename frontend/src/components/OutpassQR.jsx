import React, { useState } from 'react';

const OutpassQR = () => {
    const [status, setStatus] = useState('IDLE');

    return (
        <div className="card text-center">
            <h3>Digital Outpass</h3>
            {status === 'IDLE' && (
                <button onClick={() => setStatus('APPROVED')} className="btn btn-primary w-full">Apply Outpass</button>
            )}
            {status === 'APPROVED' && (
                <div style={{ marginTop: '20px', padding: '20px', background: '#ccc' }}>
                    <strong>QR CODE PLACEHOLDER</strong>
                    <p style={{ color: 'green', fontWeight: 'bold' }}>Approved</p>
                </div>
            )}
        </div>
    );
};

export default OutpassQR;
