import React, { useState } from 'react';
import axios from 'axios';

const TicketList = () => {
    const [desc, setDesc] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            await axios.post('http://127.0.0.1:8000/api/operations/ticket/', {
                category: 'OTHER',
                description: desc
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Ticket Submitted');
            setDesc('');
        } catch (error) {
            alert('Error');
        }
    };

    return (
        <div className="card">
            <h3>Report Issue</h3>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Description</label>
                    <textarea className="input-field" value={desc} onChange={e => setDesc(e.target.value)} />
                </div>
                <button className="btn btn-secondary w-full">Submit Ticket</button>
            </form>
        </div>
    );
};

export default TicketList;
