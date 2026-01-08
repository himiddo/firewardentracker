import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="page-container home-container">
      <h2 className="page-title">Welcome to the Fire Warden Tracker</h2>
      <p className="home-description">
        Use this system to log your working location as a fire warden for the beginning of each day
        and review availability status.
      </p>

      <div className="home-actions">
        <Link to="/log-location" className="action-card">
          <h3>Log Your Location</h3>
          <p>Record your current working location for today.</p>
          <span className="btn btn-primary">Log Location</span>
        </Link>

        <Link to="/dashboard" className="action-card">
          <h3>Dashboard</h3>
          <p>View the fire warden dashboard and edit locations.</p>
          <span className="btn btn-secondary">View Dashboard</span>
        </Link>
      </div>

    </div>
  );
}

export default Home;
