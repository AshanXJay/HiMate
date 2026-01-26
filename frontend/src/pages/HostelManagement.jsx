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
            caretaker_name: hostel.caretaker_name || '',
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

    if (loading) return <div className="container p-8"><p>Loading...</p></div>;

    return (
        <div className="container p-8">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={() => navigate('/admin/dashboard')}>
                        ← Back
                    </button>
                    <h1 style={{ margin: 0 }}>🏨 Hostel Management</h1>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowForm(true); setEditingHostel(null); resetForm(); }}>
                    + Add Hostel
                </button>
            </div>

            {/* Hostel Form Modal */}
            {showForm && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '2rem'
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingHostel ? 'Edit Hostel' : 'Add New Hostel'}</h2>
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
                            <div className="grid grid-cols-2 gap-4">
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
                                <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Comma-separated batch years</small>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
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
                            <div className="flex justify-between" style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
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

            {/* Hostels Grid */}
            <div className="grid grid-cols-2 gap-4 my-8">
                {hostels.map(hostel => (
                    <div key={hostel.id} className="card">
                        <div className="flex justify-between items-center mb-4">
                            <h3 style={{ margin: 0 }}>{hostel.name}</h3>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                background: hostel.gender_type === 'MALE' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                                color: hostel.gender_type === 'MALE' ? '#3b82f6' : '#ec4899'
                            }}>
                                {hostel.gender_type === 'MALE' ? '👨' : '👩'} {hostel.gender_type}
                            </span>
                        </div>
                        <div className="flex gap-4 mb-4">
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Rooms</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{hostel.rooms_count || 0}</p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>Available Beds</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>{hostel.available_beds || 0}</p>
                            </div>
                        </div>
                        {hostel.caretaker_name && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                Caretaker: {hostel.caretaker_name}
                            </p>
                        )}
                        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                onClick={() => navigate(`/rooms?hostel=${hostel.id}`)}
                            >
                                View Rooms
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                onClick={() => handleGenerateRooms(hostel.id)}
                            >
                                + Rooms
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                onClick={() => handleEdit(hostel)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
                                onClick={() => handleDelete(hostel.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {hostels.length === 0 && (
                <div className="text-center p-8" style={{ color: 'var(--color-text-muted)' }}>
                    <p>No hostels found. Add your first hostel!</p>
                </div>
            )}
        </div>
    );
};

export default HostelManagement;
