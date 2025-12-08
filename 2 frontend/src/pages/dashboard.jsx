import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Device_Card from '../components/device_card';
import Detail_Panel from '../components/detail_panel';

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    if (category) setCategoryFilter(category);
    if (status) setStatusFilter(status);
  }, [searchParams]);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/devices');
        if (!response.ok) throw new Error('Failed to fetch devices');
        const data = await response.json();
        setDevices(data);
        setError(null);
      } catch (err) {
        setError('Failed to load devices. Is the backend running?');
      } finally {
        setLoading(false);
      }
    };
    loadDevices();
  }, []);

  useEffect(() => {
    let filtered = devices;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (device) =>
          device.nickname?.toLowerCase().includes(query) ||
          device.model?.toLowerCase().includes(query) ||
          device.brand?.toLowerCase().includes(query)
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((device) => {
        if (categoryFilter === 'miscellaneous') {
          return device.device_type === 'miscellaneous' || device.device_type === 'misc';
        }
        return device.device_type === categoryFilter;
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((device) => device.status === statusFilter);
    }

    setFilteredDevices(filtered);
  }, [searchQuery, categoryFilter, statusFilter, devices]);

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') newParams.delete('category');
    else newParams.set('category', value);
    setSearchParams(newParams);
  };

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    const newParams = new URLSearchParams(searchParams);
    if (value === 'all') newParams.delete('status');
    else newParams.set('status', value);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleCardClick = (device) => setSelectedDevice(device);
  const handleClosePanel = () => setSelectedDevice(null);
  const hasActiveFilters = categoryFilter !== 'all' || statusFilter !== 'all' || searchQuery;

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
    <div className="discover-page">
      <header className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Browse through your curated tech collection</p>
      </header>

      <div className="search-filter-bar">
        <div className="search-container">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Search your gadgets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value)}>
            <option value="all">All Categories</option>
            <option value="computer">Computers</option>
            <option value="camera">Cameras</option>
            <option value="appliance">Appliances</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select value={statusFilter} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
            <option value="repairing">Repairing</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="search-btn" onClick={clearFilters} style={{ background: 'var(--stone)', color: 'var(--text-primary)' }}>
            Clear
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div style={{ marginBottom: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
          {categoryFilter !== 'all' && (
            <span className="filter-tag">
              {categoryFilter} <button onClick={() => handleCategoryChange('all')}>×</button>
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="filter-tag">
              {statusFilter} <button onClick={() => handleStatusChange('all')}>×</button>
            </span>
          )}
        </div>
      )}

      <section>
        <div className="section-header">
          <h2 className="section-title">Your Collection</h2>
          <span className="view-all-btn">{filteredDevices.length} {filteredDevices.length === 1 ? 'item' : 'items'}</span>
        </div>

        {filteredDevices.length > 0 ? (
          <div className="device-grid">
            {filteredDevices.map((device) => (
              <Device_Card key={device._id} device={device} onClick={() => handleCardClick(device)} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No devices found</h3>
            <p>Try adjusting your filters or add your first device!</p>
          </div>
        )}
      </section>

      <Detail_Panel device={selectedDevice} isOpen={!!selectedDevice} onClose={handleClosePanel} />
    </div>
  );
}

export default Dashboard;
