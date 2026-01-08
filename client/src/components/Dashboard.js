import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    dateFilter: 'today'
  });
  const [locations, setLocations] = useState([]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = filters.dateFilter === 'today' ? '/api/wardens/today' : '/api/wardens';
      const response = await axios.get(endpoint);
      setEntries(response.data);
      setFilteredEntries(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching entries:', err);
      setError('Failed to load warden data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters.dateFilter]);

  useEffect(() => {
    fetchEntries();
    fetchLocations();
  }, [fetchEntries]);

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/api/locations');
      setLocations(response.data);
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
  };

  //apply filters
  useEffect(() => {
    let filtered = [...entries];

    //search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.first_name.toLowerCase().includes(searchLower) ||
        entry.surname.toLowerCase().includes(searchLower) ||
        entry.staff_number.toLowerCase().includes(searchLower)
      );
    }

    //location filter
    if (filters.location) {
      filtered = filtered.filter(entry => entry.location === filters.location);
    }

    setFilteredEntries(filtered);
  }, [filters.search, filters.location, entries]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      await axios.delete(`/api/wardens/${id}`);
      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Error deleting entry:', err);
      alert('Failed to delete entry. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    //handle time string format
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
      return `${timeParts[0]}:${timeParts[1]}`;
    }
    return timeString;
  };

  //calculate statistics
  const stats = {
    totalWardens: new Set(entries.map(e => e.staff_number)).size,
    totalEntries: entries.length,
    locationsWithWardens: new Set(entries.map(e => e.location)).size
  };

  //group by location for summary
  const locationSummary = entries.reduce((acc, entry) => {
    acc[entry.location] = (acc[entry.location] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container dashboard-container">
      <div className="dashboard-header">
        <h2 className="page-title" style={{ borderBottom: 'none', marginBottom: 0 }}>
          Fire Warden Dashboard
        </h2>
        <button onClick={fetchEntries} className="btn btn-secondary">
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="message message-error">{error}</div>
      )}

      {/*statistics*/}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalWardens}</h3>
          <p>Fire Wardens</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalEntries}</h3>
          <p>Total Entries</p>
        </div>
        <div className="stat-card">
          <h3>{stats.locationsWithWardens}</h3>
          <p>Locations Covered</p>
        </div>
        <div className="stat-card">
          <h3>{locations.length - stats.locationsWithWardens}</h3>
          <p>Locations Without Cover</p>
        </div>
      </div>

      {/*filters*/}
      <div className="filter-section">
        <label htmlFor="dateFilter" className="visually-hidden">Date Filter</label>
        <select
          id="dateFilter"
          name="dateFilter"
          value={filters.dateFilter}
          onChange={handleFilterChange}
          aria-label="Filter by date"
        >
          <option value="today">Today's Entries</option>
          <option value="all">All Entries</option>
        </select>

        <label htmlFor="search" className="visually-hidden">Search</label>
        <input
          type="text"
          id="search"
          name="search"
          placeholder="Search by name or staff number..."
          value={filters.search}
          onChange={handleFilterChange}
          aria-label="Search wardens"
        />

        <label htmlFor="location" className="visually-hidden">Location Filter</label>
        <select
          id="location"
          name="location"
          value={filters.location}
          onChange={handleFilterChange}
          aria-label="Filter by location"
        >
          <option value="">All Locations</option>
          {locations.map((loc, index) => (
            <option key={index} value={loc}>
              {loc} {locationSummary[loc] ? `(${locationSummary[loc]})` : '(0)'}
            </option>
          ))}
        </select>
      </div>

      {/*data table*/}
      <div className="table-container">
        {filteredEntries.length === 0 ? (
          <div className="message message-info">
            No entries found for the selected filters.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th scope="col">Staff Number</th>
                <th scope="col">Name</th>
                <th scope="col">Location</th>
                <th scope="col">Date</th>
                <th scope="col">Time</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <tr key={entry.id}>
                  <td>{entry.staff_number}</td>
                  <td>{entry.first_name} {entry.surname}</td>
                  <td>{entry.location}</td>
                  <td>{formatDate(entry.entry_date)}</td>
                  <td>{formatTime(entry.entry_time)}</td>
                  <td className="actions">
                    <Link
                      to={`/edit/${entry.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/*location summary*/}
      {Object.keys(locationSummary).length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>
            Coverage Summary by Location
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(locationSummary)
              .sort((a, b) => b[1] - a[1])
              .map(([location, count]) => (
                <span
                  key={location}
                  style={{
                    backgroundColor: 'var(--primary-light)',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem'
                  }}
                >
                  {location}: <strong>{count}</strong>
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
