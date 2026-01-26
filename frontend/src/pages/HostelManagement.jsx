import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const HostelManagement = () => {
    const navigate = useNavigate();
    const { API_URL, getAuthHeader } = useContext(AuthContext);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingHostel, setEditingHostel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        gender_type: 'MALE',
        caretaker_name: '',
        allocated_batches: '',
        latitude: '',
        longitude: '',
        address: ''
    });

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/housing/hostels/`, { headers: getAuthHeader() });
            setHostels(res.data);
        } catch (err) {
            console.error("Failed to fetch hostels:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHostel) {
                await axios.put(`${API_URL}/api/housing/hostels/${editingHostel.id}/`, formData, {
                    headers: getAuthHeader()
                });
            } else {
                await axios.post(`${API_URL}/api/housing/hostels/`, formData, {
                    headers: getAuthHeader()
                });
            }
            setShowForm(false);
            setEditingHostel(null);
            resetForm();
            fetchHostels();
        } catch (err) {
            alert('Failed to save hostel: ' + (err.response?.data?.detail || err.message));
        }
    };

    const handleEdit = (hostel) => {
        setEditingHostel(hostel);
        setFormData({
            name: hostel.name,
            gender_type: hostel.gender_type,
            caretaker_name: hostel.caretaker_name,
            allocated_batches: hostel.allocated_batches || '',
            latitude: hostel.latitude || '',
            longitude: hostel.longitude || '',
            address: hostel.address || ''
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this hostel?')) return;
        try {
            await axios.delete(`${API_URL}/api/housing/hostels/${id}/`, { headers: getAuthHeader() });
            fetchHostels();
        } catch (err) {
            alert('Failed to delete hostel');
        }
    };

    const handleGenerateRooms = async (hostelId) => {
        const numRooms = prompt('How many rooms to generate?', '10');
        if (!numRooms) return;

        try {
            await axios.post(`${API_URL}/api/housing/hostels/${hostelId}/generate_rooms/`, {
                num_rooms: parseInt(numRooms),
                beds_per_room: 4
            }, { headers: getAuthHeader() });
            alert('Rooms generated successfully!');
            fetchHostels();
        } catch (err) {
            alert('Failed to generate rooms');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            gender_type: 'MALE',
            caretaker_name: '',
            allocated_batches: '',
            latitude: '',
            longitude: '',
            address: ''
        });
    };

    if (loading) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container hostel-management">
            <div className="page-header">
                <h1>🏨 Hostel Management</h1>
                <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingHostel(null); resetForm(); }}>
                    + Add Hostel
                </button>
            </div>

            {/* Hostel Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Hostel Name *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Gender Type *</label>
                                    <select
                                        className="input-field"
                                        value={formData.gender_type}
                                        onChange={e => setFormData({ ...formData, gender_type: e.target.value })}
                                    >
                                        <option value="MALE">Male</option>
                                        <option value="FEMALE">Female</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Caretaker Name</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        value={formData.caretaker_name}
                                        onChange={e => setFormData({ ...formData, caretaker_name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Allocated Batches</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., 21,22,23"
                                    value={formData.allocated_batches}
                                    onChange={e => setFormData({ ...formData, allocated_batches: e.target.value })}
                                />
                                <small>Comma-separated batch years</small>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input-field"
                                        value={formData.latitude}
                                        onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        className="input-field"
                                        value={formData.longitude}
                                        onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    className="input-field"
                                    rows="2"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingHostel ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Hostels List */}
            <div className="hostels-grid">
                {hostels.map(hostel => (
                    <div key={hostel.id} className="card hostel-card">
                        <div className="hostel-header">
                            <h3>{hostel.name}</h3>
                            <span className={`gender-badge ${hostel.gender_type?.toLowerCase()}`}>
                                {hostel.gender_type === 'MALE' ? '👨' : '👩'} {hostel.gender_type}
                            </span>
                        </div>
                        <div className="hostel-stats">
                            <div className="stat">
                                <span className="label">Rooms</span>
                                <span className="value">{hostel.rooms_count || 0}</span>
                            </div>
                            <div className="stat">
                                <span className="label">Available Beds</span>
                                <span className="value">{hostel.available_beds || 0}</span>
                            </div>
                        </div>
                        {hostel.allocated_batches && (
                            <div className="hostel-batches">
                                <span className="label">Batches:</span>
                                {hostel.batches_list?.map((b, i) => (
                                    <span key={i} className="batch-tag">{b}</span>
                                ))}
                            </div>
                        )}
                        {hostel.caretaker_name && (
                            <p className="caretaker">Caretaker: {hostel.caretaker_name}</p>
                        )}
                        <div className="hostel-actions">
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => navigate(`/admin/hostel/${hostel.id}/rooms`)}
                            >
                                View Rooms
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleGenerateRooms(hostel.id)}
                            >
                                + Rooms
                            </button>
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleEdit(hostel)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(hostel.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hostels.length === 0 && (
                <div className="empty-state">
                    <p>No hostels found. Add your first hostel!</p>
                </div>
            )}
        </div>
    );
};

export default HostelManagement;
