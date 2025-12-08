import React, { useState, useEffect } from 'react';
import Device_Card from '../components/device_card';
import Detail_Panel from '../components/detail_panel';

function Library() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sortBy, setSortBy] = useState('adopted_date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/devices');
        
        if (!response.ok) {
          throw new Error('Failed to fetch devices');
        }
        
        const data = await response.json();
        setDevices(data);
        setError(null);
      } catch (err) {
        console.error('Error loading devices:', err);
        setError('Failed to load devices. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  // sort devices
  const sortedDevices = [...devices].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'adopted_date':
        comparison = new Date(a.adopted_date) - new Date(b.adopted_date);
        break;
      case 'purchase_price':
        comparison = (a.purchase_price || 0) - (b.purchase_price || 0);
        break;
      case 'nickname':
        comparison = (a.nickname || a.model || '').localeCompare(b.nickname || b.model || '');
        break;
      case 'brand':
        comparison = (a.brand || '').localeCompare(b.brand || '');
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  const handleCardClick = (device) => {
    setSelectedDevice(device);
  };

  const handleClosePanel = () => {
    setSelectedDevice(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😵</div>
        <h3>Oops!</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="library-page">
      <header className="page-header">
        <h1 className="page-title">My Library</h1>
        <p className="page-subtitle">Your complete tech collection at a glance</p>
      </header>

      {/* sort controls */}
      <div className="search-filter-bar">
        <div className="filter-dropdown">
          <label style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginRight: 'var(--space-sm)' }}>
            Sort by:
          </label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="adopted_date">Date Added</option>
            <option value="purchase_price">Price</option>
            <option value="nickname">Name</option>
            <option value="brand">Brand</option>
          </select>
        </div>
        
        <button
          className="search-btn"
          onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
          style={{ 
            background: 'var(--white)', 
            color: 'var(--forest)',
            border: '1px solid var(--stone)',
          }}
        >
          {sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
        </button>
      </div>

      {/* device grid */}
      {sortedDevices.length > 0 ? (
        <div className="device-grid">
          {sortedDevices.map((device) => (
            <Device_Card
              key={device._id}
              device={device}
              onClick={() => handleCardClick(device)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>Your library is empty</h3>
          <p>Add your first device to get started!</p>
        </div>
      )}

      {/* floating detail panel */}
      <Detail_Panel
        device={selectedDevice}
        isOpen={!!selectedDevice}
        onClose={handleClosePanel}
      />
    </div>
  );
}

export default Library;
