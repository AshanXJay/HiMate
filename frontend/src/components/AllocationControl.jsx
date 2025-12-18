import React, { useState } from 'react';
import axios from 'axios';

const AllocationControl = () => {
    const [msg, setMsg] = useState('');

    const runAlgo = async () => {
        setMsg('Running...');
        try {
            const token = localStorage.getItem('access_token');
            const res = await axios.post('http://127.0.0.1:8000/api/allocation/run/', {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMsg(res.data.message);
        } catch (err) {
            console.error(err);
            setMsg('Error running allocation: ' + (err.response?.status === 401 ? 'Unauthorized' : 'Failed'));
        }
    };

    return (
        <div className="container mx-auto my-8 max-w-lg">
            <div className="card text-center">
                <h2 className="mb-4">Allocation Control</h2>
                <p className="mb-4">Click below to assign rooms to students.</p>
                <button className="btn btn-primary" onClick={runAlgo}>Run Allocation</button>
                {msg && <p className="mt-4 font-bold text-success">{msg}</p>}
            </div>
        </div>
    );
};

export default AllocationControl;
