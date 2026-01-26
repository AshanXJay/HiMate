import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const RoomGrid = () => {
    const { hostelId } = useParams();
    const navigate = useNavigate();
    const { API_URL, getAuthHeader, user } = useContext(AuthContext);
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState(hostelId || '');
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
                setSelectedHostel(res.data[0].id);
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
        if (room.status === 'MAINTENANCE') return 'room-card maintenance';
        if (room.current_occupancy >= room.capacity) return 'room-card full';
        if (room.current_occupancy > 0) return 'room-card filling';
        return 'room-card available';
    };

    const selectedHostelData = hostels.find(h => h.id === parseInt(selectedHostel));

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container room-grid-page">
            <div className="page-header">
                <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                    ← Back
                </button>
                <h1>🚪 Room Overview</h1>
                <select
                    className="filter-select"
                    value={selectedHostel}
                    onChange={e => setSelectedHostel(e.target.value)}
                >
                    {hostels.map(h => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                </select>
            </div>

            {selectedHostelData && (
                <div className="card hostel-info-card">
                    <div className="hostel-info-header">
                        <h2>{selectedHostelData.name}</h2>
                        <span className={`gender-badge ${selectedHostelData.gender_type?.toLowerCase()}`}>
                            {selectedHostelData.gender_type === 'MALE' ? '👨' : '👩'} {selectedHostelData.gender_type}
                        </span>
                    </div>
                    <div className="hostel-info-stats">
                        <div className="stat">
                            <span className="label">Rooms</span>
                            <span className="value">{selectedHostelData.rooms_count}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Available Beds</span>
                            <span className="value">{selectedHostelData.available_beds}</span>
                        </div>
                        {selectedHostelData.caretaker_name && (
                            <div className="stat">
                                <span className="label">Caretaker</span>
                                <span className="value">{selectedHostelData.caretaker_name}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="room-legend">
                <span><span className="legend-dot available"></span> Available</span>
                <span><span className="legend-dot filling"></span> Partially Filled</span>
                <span><span className="legend-dot full"></span> Full</span>
                <span><span className="legend-dot maintenance"></span> Maintenance</span>
            </div>

            {/* Room Grid */}
            <div className="room-grid">
                {rooms.map(room => (
                    <div
                        key={room.id}
                        className={getRoomClass(room)}
                        title={`Room ${room.room_number}: ${room.current_occupancy}/${room.capacity} beds occupied`}
                    >
                        <div className="room-number">{room.room_number}</div>
                        <div className="room-occupancy">
                            {room.current_occupancy}/{room.capacity}
                        </div>
                        {room.floor && <div className="room-floor">Floor {room.floor}</div>}
                    </div>
                ))}
            </div>

            {rooms.length === 0 && (
                <div className="empty-state">
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
