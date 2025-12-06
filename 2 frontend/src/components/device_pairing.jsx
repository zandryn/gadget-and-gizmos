import React, { useState, useEffect, useRef } from 'react';

function Device_Pairing({
  currentPairings = [],
  onChange,
  excludeId,  // exclude current device from list
  maxPairings = 3
}) {
  const [devices, setDevices] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // fetch all devices for dropdown
  useEffect(() => {
    const loadDevices = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/devices');
        if (response.ok) {
          const data = await response.json();
          // filter out current device and already paired devices
          const filtered = data.filter(d =>
            d._id !== excludeId &&
            !currentPairings.some(p => p.device_id === d._id)
          );
          setDevices(filtered);
        }
      } catch (err) {
        console.error('Failed to load devices:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDevices();
  }, [excludeId, currentPairings]);

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // filter devices based on search
  const filteredDevices = devices.filter(device => {
    const query = searchQuery.toLowerCase();
    return (
      device.nickname?.toLowerCase().includes(query) ||
      device.model?.toLowerCase().includes(query) ||
      device.brand?.toLowerCase().includes(query)
    );
  });

  const handleAddPairing = (device) => {
    if (currentPairings.length >= maxPairings) return;

    const newPairing = {
      device_id: device._id,
      nickname: device.nickname,
      model: device.model,
    };

    onChange([...currentPairings, newPairing]);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleRemovePairing = (deviceId) => {
    onChange(currentPairings.filter(p => p.device_id !== deviceId));
  };

  const getDeviceIcon = (type) => {
    const icons = {
      computer: '💻',
      camera: '📷',
      appliance: '🏠',
      miscellaneous: '✨',
    };
    return icons[type] || '📱';
  };

  return (
    <div className="device-pairing-wrapper">
      <label className="form-label">
        Paired Devices
        <span style={{ color: 'var(--text-muted)', fontWeight: 'normal', marginLeft: 'var(--space-xs)' }}>
          (optional, max {maxPairings})
        </span>
      </label>

      {/* current pairings */}
      {currentPairings.length > 0 && (
        <div className="paired-devices-list" style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-md)',
        }}>
          {currentPairings.map((paired) => (
            <div
              key={paired.device_id}
              className="paired-device-tag"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                padding: 'var(--space-sm) var(--space-md)',
                background: 'var(--sage-muted)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
              }}
            >
              <span>🔗</span>
              <span style={{ color: 'var(--forest)' }}>
                {paired.nickname || paired.model}
              </span>
              <button
                type="button"
                onClick={() => handleRemovePairing(paired.device_id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* add pairing button/dropdown */}
      {currentPairings.length < maxPairings && (
        <div className="pairing-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="add-pairing-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)',
              padding: 'var(--space-sm) var(--space-md)',
              background: 'var(--white)',
              border: '1px dashed var(--stone)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
            }}
          >
            <span>+</span>
            <span>Add paired device</span>
          </button>

          {isOpen && (
            <div
              className="pairing-dropdown-menu"
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: 'var(--space-xs)',
                background: 'var(--white)',
                border: '1px solid var(--stone)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 100,
                maxHeight: '250px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* search input */}
              <div style={{ padding: 'var(--space-sm)', borderBottom: '1px solid var(--stone)' }}>
                <input
                  type="text"
                  placeholder="Search devices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{
                    padding: 'var(--space-sm)',
                    fontSize: '0.875rem',
                  }}
                  autoFocus
                />
              </div>

              {/* device list */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {loading ? (
                  <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading...
                  </div>
                ) : filteredDevices.length > 0 ? (
                  filteredDevices.map((device) => (
                    <button
                      key={device._id}
                      type="button"
                      onClick={() => handleAddPairing(device)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-md)',
                        width: '100%',
                        padding: 'var(--space-sm) var(--space-md)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--cream)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      <span style={{ fontSize: '1.25rem' }}>
                        {getDeviceIcon(device.device_type)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {device.nickname || device.model}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {device.brand} · {device.device_type}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: 'var(--space-md)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    {searchQuery ? 'No devices found' : 'No devices available to pair'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 'var(--space-sm)' }}>
        Link related devices like lenses with cameras, or accessories with appliances
      </p>
    </div>
  );
}

export default Device_Pairing;