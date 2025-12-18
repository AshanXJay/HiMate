import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const WardenDashboard = () => {
    const [stats, setStats] = useState({});

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/operations/stats/').then(res => setStats(res.data));
    }, []);

    return (
        <div className="container">
            <h1>Warden Dashboard</h1>

            <div className="grid grid-cols-4" style={{ marginBottom: '20px' }}>
                <div className="card text-center">
                    <h3>Students</h3>
                    <h2>{stats.total_students}</h2>
                </div>
                <div className="card text-center">
                    <h3>Allocated</h3>
                    <h2>{stats.allocated_students}</h2>
                </div>
                <div className="card text-center">
                    <h3>Free Rooms</h3>
                    <h2>{stats.available_rooms}</h2>
                </div>
                <div className="card text-center">
                    <h3>Issues</h3>
                    <h2>{stats.maintenance_issues}</h2>
                </div>
            </div>

            <div className="card">
                <h3>Admin Actions</h3>
                <div className="grid grid-cols-2">
                    <Link to="/admin/allocation" className="btn btn-primary">Go to Allocation</Link>
                    <Link to="/rooms" className="btn btn-secondary">View Rooms</Link>
                </div>
            </div>
        </div>
    );
};

export default WardenDashboard;
