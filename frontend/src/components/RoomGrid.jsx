import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RoomGrid = () => {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Hardcoded Hostel ID 1 for simplicity
        axios.get('http://127.0.0.1:8000/api/housing/hostels/1/rooms/').then(res => setRooms(res.data));
    }, []);

    return (
        <div className="container my-8">
            <h2 className="mb-4">Room Availability (Block A)</h2>
            <div className="grid grid-cols-4 gap-4">
                {rooms.map(room => (
                    <div key={room.id} className={`card text-center ${room.current_occupancy >= room.capacity ? 'status-full' : 'status-available'}`}>
                        <h3>{room.room_number}</h3>
                        <p>{room.current_occupancy}/{room.capacity}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RoomGrid;
