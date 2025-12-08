import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Categories() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/devices');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setDevices(data);
      } catch (err) {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    loadDevices();
  }, []);

  // calculate dynamic stats
  const stats = {
    total: devices.length,
    totalInvestment: devices.reduce((sum, d) => sum + (d.purchase_price || 0), 0),
    active: devices.filter(d => d.status === 'active').length,
    retired: devices.filter(d => d.status === 'retired').length,
    repairing: devices.filter(d => d.status === 'repairing').length,
    byType: {
      computer: devices.filter(d => d.device_type === 'computer').length,
      camera: devices.filter(d => d.device_type === 'camera').length,
      appliance: devices.filter(d => d.device_type === 'appliance').length,
      miscellaneous: devices.filter(d => d.device_type === 'miscellaneous' || d.device_type === 'misc').length,
    }
  };

  const categoryData = [
    {
      id: 'computer',
      name: 'Computers',
      icon: '💻',
      description: 'Laptops, desktops, and workstations',
      count: stats.byType.computer,
    },
    {
      id: 'camera',
      name: 'Cameras',
      icon: '📷',
      description: 'Digital, film, and instant cameras',
      count: stats.byType.camera,
    },
    {
      id: 'appliance',
      name: 'Appliances',
      icon: '🏠',
      description: 'Home tech and smart devices',
      count: stats.byType.appliance,
    },
    {
      id: 'miscellaneous',
      name: 'Miscellaneous',
      icon: '✨',
      description: 'Everything else worth collecting',
      count: stats.byType.miscellaneous,
    },
  ];

  const handleCategoryClick = (categoryId) => {
    // navigate to dashboard with category filter as URL param
    navigate(`/?category=${categoryId}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <header className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Browse your collection by type</p>
      </header>

      {error && (
        <div style={{ padding: 'var(--space-md)', background: 'rgba(180, 102, 23, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--brown)', marginBottom: 'var(--space-lg)' }}>
          {error}
        </div>
      )}

      <div className="category-grid">
        {categoryData.map((category) => (
          <div
            key={category.id}
            className={`category-card ${category.id}`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-name">{category.name}</h3>
            <p className="category-count">
              {category.count} {category.count === 1 ? 'item' : 'items'}
            </p>
          </div>
        ))}
      </div>

      {/* dynamic stats section */}
      <section style={{ marginTop: 'var(--space-3xl)' }}>
        <h2 className="section-title" style={{ marginBottom: 'var(--space-lg)' }}>
          Collection Stats
        </h2>
        <div className="stats-grid">
          <StatCard
            label="Total Devices"
            value={stats.total}
            icon="📦"
          />
          <StatCard
            label="Total Investment"
            value={formatCurrency(stats.totalInvestment)}
            icon="💰"
          />
          <StatCard
            label="Active"
            value={stats.active}
            icon="✅"
            onClick={() => navigate('/?status=active')}
          />
          <StatCard
            label="Retired"
            value={stats.retired}
            icon="💤"
            onClick={() => navigate('/?status=retired')}
          />
          <StatCard
            label="In Repair"
            value={stats.repairing}
            icon="🔧"
            onClick={() => navigate('/?status=repairing')}
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, icon, onClick }) {
  return (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stat-card-header">
        <span className="stat-icon">{icon}</span>
        <span className="stat-value">{value}</span>
      </div>
      <p className="stat-label">{label}</p>
    </div>
  );
}

export default Categories;
