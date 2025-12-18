import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const Dashboard = () => {
    const [allocation, setAllocation] = useState(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchAllocation = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const res = await axios.get('http://127.0.0.1:8000/api/allocation/my-room/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAllocation(res.data);
            } catch (err) {
                console.log("Not allocated");
            }
        };
        if (user) fetchAllocation();
    }, [user]);

    if (!user) return <p>Loading...</p>;

    return (
        <div className="container">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1>Hello, {user.username}</h1>
                    <p className="text-warning font-bold">{user.enrollment_number}</p>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="card">
                    <h3>Allocation Status</h3>
                    {allocation ? (
                        <div className="mt-4">
                            <div className="status-occupied text-center mb-4">ALLOCATED</div>
                            <p className="text-xl font-bold">Room: {allocation.room.room_number}</p>
                            <p>Hostel: {allocation.room.hostel}</p>
                            {/* Roommate details would need expanded backend serializer */}
                        </div>
                    ) : (
                        <div className="mt-4">
                            {user.is_profile_complete ? (
                                <div className="status-available text-center">
                                    <p className="mb-2">Pending Allocation</p>
                                    <small>You are on the list.</small>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-error mb-4">Profile Incomplete</p>
                                    <Link to="/survey" className="btn btn-primary w-full">Complete Survey</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="card">
                    <h3>Your Data</h3>
                    <p>Enrollment: {user.enrollment_number || 'Pending'}</p>
                    <p>Status: {user.is_profile_complete ? 'Active' : 'Incomplete'}</p>
                    {user.is_profile_complete &&
                        <Link to="/survey" className="btn btn-secondary mt-4 w-full">Update Preferences</Link>
                    }
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
