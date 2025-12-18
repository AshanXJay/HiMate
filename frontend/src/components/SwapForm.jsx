import React, { useState } from 'react';

const SwapForm = () => {
    const [targetStudentId, setTargetStudentId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Swap Request Sent');
    };

    return (
        <div className="card">
            <h3>Request Room Swap</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Target Student ID</label>
                    <input className="input-field" type="text" value={targetStudentId} onChange={e => setTargetStudentId(e.target.value)} />
                </div>
                <button className="btn btn-secondary w-full">Request Swap</button>
            </form>
        </div>
    );
};

export default SwapForm;
