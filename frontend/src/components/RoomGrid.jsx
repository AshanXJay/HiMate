import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const RoomGrid = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { API_URL, getAuthHeader, user } = useContext(AuthContext);
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(searchParams.get('hostel') || '');
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHostels();
    }, []);

    useEffect(() => {
        if (selectedHostel) {
            fetchRooms(selectedHostel);
        }
    }, [selectedHostel]);

    const fetchHostels = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/housing/hostels/`, {
                headers: getAuthHeader()
            });
            setHostels(res.data);
            if (res.data.length > 0 && !selectedHostel) {
                setSelectedHostel(res.data[0].id.toString());
            }
        } catch (err) {
            console.error("Error fetching hostels:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRooms = async (hostelId) => {
        try {
            const res = await axios.get(`${API_URL}/api/housing/rooms/?hostel=${hostelId}`, {
                headers: getAuthHeader()
            });
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        }
    };

    const getRoomClass = (room) => {
        if (room.status === 'MAINTENANCE') return 'status-full';
        if (room.current_occupancy >= room.capacity) return 'status-full';
        if (room.current_occupancy > 0) return 'status-occupied';
        return 'status-available';
    };

    const selectedHostelData = hostels.find(h => h.id === parseInt(selectedHostel));

    if (loading) return <div className="container p-8"><p>Loading...</p></div>;

    return (
        <div className="container p-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate(-1)}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0 }}>🚪 Room Overview</h1>
                </div>
                <select
                    className="input-field"
                    style={{ width: 'auto' }}
                    value={selectedHostel}
                    onChange={e => setSelectedHostel(e.target.value)}
                >
                    {hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            {selectedHostelData && (
                <div className="card mb-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 style={{ margin: 0 }}>{selectedHostelData.name}</h2>
                        <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            background: selectedHostelData.gender_type === 'MALE' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                            color: selectedHostelData.gender_type === 'MALE' ? '#3b82f6' : '#ec4899'
                        }}>
                            {selectedHostelData.gender_type === 'MALE' ? '👨' : '👩'} {selectedHostelData.gender_type}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Rooms</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{selectedHostelData.rooms_count}</p>
                        </div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Available Beds</p>
                            <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{selectedHostelData.available_beds}</p>
                        </div>
                        {selectedHostelData.caretaker_name && (
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Caretaker</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{selectedHostelData.caretaker_name}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="flex gap-4 mb-4 p-4 card" style={{ background: 'var(--color-surface)' }}>
                <span className="flex items-center gap-2">
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                    <span style={{ fontSize: '0.875rem' }}>Available</span>
                </span>
                <span className="flex items-center gap-2">
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-warning)' }}></span>
                    <span style={{ fontSize: '0.875rem' }}>Partially Filled</span>
                </span>
                <span className="flex items-center gap-2">
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--color-error)' }}></span>
                    <span style={{ fontSize: '0.875rem' }}>Full</span>
                </span>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-4 gap-4">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={`card text-center ${getRoomClass(room)}`}
                        style={{
                            padding: '1rem',
                            cursor: 'pointer'
                        }}
                        title={`Room ${room.room_number}: ${room.current_occupancy}/${room.capacity} beds occupied`}
                    >
                        <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{room.room_number}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {room.current_occupancy}/{room.capacity}
                        </div>
                        {room.floor && <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>Floor {room.floor}</div>}
                    </div>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="text-center p-8" style={{ color: 'var(--color-text-muted)' }}>
                    <p>No rooms found for this hostel.</p>
                    {user?.role === 'WARDEN' && (
                        <button
                            className="btn btn-primary mt-4"
                            onClick={() => navigate('/admin/hostels')}
                        >
                            Manage Hostels
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default RoomGrid;
