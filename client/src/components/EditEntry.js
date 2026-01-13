import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function EditEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    staff_number: '',
    first_name: '',
    surname: '',
    location: ''
  });
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEntry();
    fetchLocations();
  }, [id]);

  const fetchEntry = async () => {
    try {
      const response = await axios.get(`/api/wardens/${id}`);
      const entry = response.data;
      setFormData({
        staff_number: entry.staff_number,
        first_name: entry.first_name,
        surname: entry.surname,
        location: entry.location
      });
    } catch (error) {
      console.error('Error fetching entry:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load entry. It may have been deleted.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    //validate input based on field type
    let filteredValue = value;
    if (name === 'staff_number') {
      //only allow numbers
      filteredValue = value.replace(/[^0-9]/g, '');
    } else if (name === 'first_name' || name === 'surname') {
      //only allow letters, spaces, and hyphens
      filteredValue = value.replace(/[^a-zA-Z\s\-']/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: filteredValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.put(`/api/wardens/${id}`, formData);
      setMessage({
        type: 'success',
        text: 'Entry updated successfully! The date and time have been updated to the current date and time.'
      });

      //redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error updating entry:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update entry. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/dashboard" className="btn btn-secondary btn-sm">
          &larr; Back to Dashboard
        </Link>
      </div>

      <h2 className="page-title">Edit Location Entry</h2>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="staff_number">Staff Number *</label>
          <input
            type="text"
            id="staff_number"
            name="staff_number"
            value={formData.staff_number}
            onChange={handleChange}
            required
            placeholder="e.g., 12345"
          />
        </div>

        <div className="form-group">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
            placeholder="Enter first name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="surname">Surname *</label>
          <input
            type="text"
            id="surname"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            placeholder="Enter surname"
          />
        </div>

        <div className="form-group">
          <label htmlFor="location">Working Location *</label>
          <select
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          >
            <option value="">-- Select a location --</option>
            {locations.map((loc, index) => (
              <option key={index} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ flex: 1 }}
          >
            {saving ? 'Saving...' : 'Update Entry'}
          </button>
          <Link
            to="/dashboard"
            className="btn btn-secondary"
            style={{ textAlign: 'center' }}
          >
            Cancel
          </Link>
        </div>
      </form>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'var(--primary-light)',
        borderRadius: '8px'
      }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
          Note:
        </h4>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          When you update this entry, the date and time will be automatically updated to the current
          date and time to reflect when the change was made.
        </p>
      </div>
    </div>
  );
}

export default EditEntry;
