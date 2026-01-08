import React, { useState, useEffect } from 'react';
import axios from 'axios';

function WardenForm() {
  const [formData, setFormData] = useState({
    staff_number: '',
    first_name: '',
    surname: '',
    location: ''
  });
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [existingEntries, setExistingEntries] = useState([]);

  //fetch locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setMessage({ type: 'error', text: 'Failed to load locations. Please refresh the page.' });
    }
  };

  //check for existing entries when staff number is entered
  const checkExistingEntries = async (staffNumber) => {
    if (!staffNumber) {
      setExistingEntries([]);
      return;
    }

    try {
      const response = await axios.get(`/api/wardens/staff/${staffNumber}`);
      const todayEntries = response.data.filter(entry => {
        const entryDate = new Date(entry.entry_date).toDateString();
        const today = new Date().toDateString();
        return entryDate === today;
      });
      setExistingEntries(todayEntries);

      //auto-fill name if existing entries found
      if (response.data.length > 0) {
        const latestEntry = response.data[0];
        setFormData(prev => ({
          ...prev,
          first_name: latestEntry.first_name,
          surname: latestEntry.surname
        }));
      }
    } catch (error) {
      console.error('Error checking existing entries:', error);
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

    //check for existing entries when staff number changes
    if (name === 'staff_number' && filteredValue.length >= 3) {
      checkExistingEntries(filteredValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axios.post('/api/wardens', formData);

      if (response.status === 201) {
        setMessage({
          type: 'success',
          text: `Location logged successfully! ${formData.first_name} ${formData.surname} is now registered at ${formData.location}.`
        });

        //clear form but keep staff number and name for convenience
        setFormData(prev => ({
          ...prev,
          location: ''
        }));

        //refresh existing entries
        checkExistingEntries(formData.staff_number);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to log location. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title" style={{ textAlign: 'center' }}>Log Your Working Location</h2>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.text}
        </div>
      )}

      {existingEntries.length > 0 && (
        <div className="message message-info">
          <strong>Note:</strong> You have already logged {existingEntries.length} location(s) today.
          Submitting this form will create a new entry. If you want to update an existing entry,
          please use the <a href="/dashboard">Dashboard</a>.
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
            aria-describedby="staff_number_help"
          />
          <small id="staff_number_help" style={{ color: 'var(--text-secondary)' }}>
            Enter your unique staff number
          </small>
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
            placeholder="Enter your first name"
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
            placeholder="Enter your surname"
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

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Logging Location...' : 'Log Location'}
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px' }}>
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>Important Notes:</h4>
        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
          <li>Please log your location at the start of each working day</li>
          <li>If you move to a different location during the day, please edit your location in the dashboard.</li>
          <li>Your location is recorded by the Health and Safety team</li>
        </ul>
      </div>
    </div>
  );
}

export default WardenForm;
