import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './components/Home';
import WardenForm from './components/WardenForm';
import Dashboard from './components/Dashboard';
import EditEntry from './components/EditEntry';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="header-content">
            <h1 className="logo">University of Winchester</h1>
            <p className="subtitle">Fire Warden Location Tracker</p>
          </div>
          <nav className="nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/log-location" className="nav-link">Log Location</Link>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          </nav>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/log-location" element={<WardenForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/edit/:id" element={<EditEntry />} />
          </Routes>
        </main>

        <footer className="footer">
          <p>University of Winchester - Fire Warden Tracking System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
