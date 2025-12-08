import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Photo_Upload from '../components/photo_upload';
import Device_Pairing from '../components/device_pairing';

const ADMIN_PASSWORD = 'zandryn'; // change later and put on env file

function Edit_Device() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadDevice = async () => {
      try {
        const response = await fetch(`http://localhost:8000/devices/${id}`);
        if (!response.ok) throw new Error('Device not found');
        const data = await response.json();
        setDevice(data);
      } catch (err) {
        setError('Failed to load device');
      } finally {
        setLoading(false);
      }
    };
    loadDevice();
  }, [id]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      setPasswordError('Incorrect password!');
      setPasswordInput('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDevice((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (field, url) => {
    setDevice((prev) => ({ ...prev, [field]: url }));
  };

  const handlePhotoRemove = (field) => {
    setDevice((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePairingChange = (pairings) => {
    setDevice((prev) => ({ ...prev, paired_devices: pairings }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        nickname: device.nickname,
        model: device.model,
        brand: device.brand,
        device_type: device.device_type,
        status: device.status,
        adopted_date: device.adopted_date?.split('T')[0] || device.adopted_date,
        purchase_price: parseFloat(device.purchase_price),
        source: device.source,
        notes: device.notes || null,
        thumbnail: device.thumbnail || null,
        hover_photo: device.hover_photo || null,
        paired_devices: device.paired_devices || [],
      };

      if (device.device_type === 'computer') {
        if (device.cpu) submitData.cpu = device.cpu;
        if (device.ram) submitData.ram = device.ram;
        if (device.storage) submitData.storage = device.storage;
        if (device.os) submitData.os = device.os;
      } else if (device.device_type === 'camera') {
        if (device.sensor_type) submitData.sensor_type = device.sensor_type;
        if (device.lens_mount) submitData.lens_mount = device.lens_mount;
        if (device.megapixels) submitData.megapixels = parseFloat(device.megapixels);
        if (device.film_type) submitData.film_type = device.film_type;
      } else {
        if (device.battery_life) submitData.battery_life = device.battery_life;
        if (device.connectivity) submitData.connectivity = device.connectivity;
      }

      const response = await fetch(`http://localhost:8000/devices/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });
      
      if (!response.ok) throw new Error('Failed to update device');
      
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to update device. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this device? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`http://localhost:8000/devices/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');
      navigate('/');
    } catch (err) {
      setError('Failed to delete device');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading device...</p>
      </div>
    );
  }

  if (error && !device) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😵</div>
        <h3>Oops!</h3>
        <p>{error}</p>
      </div>
    );
  }

  // password gate
  if (!isAuthenticated) {
    return (
      <div className="add-device-page">
        <header className="page-header">
          <h1 className="page-title">Edit Device</h1>
          <p className="page-subtitle">{device?.nickname || device?.model}</p>
        </header>
        <div className="form-container" style={{ maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span style={{ fontSize: '3rem' }}>🔐</span>
          </div>
          <form onSubmit={handlePasswordSubmit}>
            {passwordError && (
              <div style={{ padding: 'var(--space-md)', background: 'rgba(180, 102, 23, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--brown)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
                {passwordError}
              </div>
            )}
            <div className="form-group">
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="form-input" placeholder="Enter password" autoFocus />
            </div>
            <button type="submit" className="submit-btn">Unlock</button>
          </form>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  return (
    <div className="add-device-page">
      <header className="page-header">
        <h1 className="page-title">Edit Device</h1>
        <p className="page-subtitle">Update {device?.nickname || device?.model}</p>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ padding: 'var(--space-md)', background: 'rgba(180, 102, 23, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--brown)', marginBottom: 'var(--space-lg)' }}>{error}</div>}
          {success && <div style={{ padding: 'var(--space-md)', background: 'var(--sage-muted)', borderRadius: 'var(--radius-md)', color: 'var(--forest)', marginBottom: 'var(--space-lg)' }}>Device updated! Redirecting...</div>}

          {/* photos section */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Photos</h3>
            <div className="form-row">
              <Photo_Upload
                label="Thumbnail"
                photoType="thumbnail"
                currentUrl={device?.thumbnail}
                onUpload={(url) => handlePhotoUpload('thumbnail', url)}
                onRemove={() => handlePhotoRemove('thumbnail')}
                hint="Main card image"
              />
              <Photo_Upload
                label="Hover Photo"
                photoType="hover_photo"
                currentUrl={device?.hover_photo}
                onUpload={(url) => handlePhotoUpload('hover_photo', url)}
                onRemove={() => handlePhotoRemove('hover_photo')}
                hint="Shown on mouse hover"
              />
            </div>
          </div>

          {/* basic info */}
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Basic Info</h3>

          <div className="form-group">
            <label className="form-label">Nickname</label>
            <input type="text" name="nickname" value={device?.nickname || ''} onChange={handleChange} className="form-input" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input type="text" name="brand" value={device?.brand || ''} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Model</label>
              <input type="text" name="model" value={device?.model || ''} onChange={handleChange} className="form-input" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Device Type</label>
              <select name="device_type" value={device?.device_type || 'computer'} onChange={handleChange} className="form-select" required>
                <option value="computer">Computer</option>
                <option value="camera">Camera</option>
                <option value="appliance">Appliance</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={device?.status || 'active'} onChange={handleChange} className="form-select">
                <option value="active">Active</option>
                <option value="retired">Retired</option>
                <option value="repairing">Repairing</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Adopted</label>
              <input type="date" name="adopted_date" value={formatDate(device?.adopted_date)} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price</label>
              <input type="number" name="purchase_price" value={device?.purchase_price || ''} onChange={handleChange} className="form-input" step="0.01" min="0" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source</label>
            <input type="text" name="source" value={device?.source || ''} onChange={handleChange} className="form-input" required />
          </div>

          {/* type-specific fields */}
          {device?.device_type === 'computer' && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Computer Specs</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">CPU</label><input type="text" name="cpu" value={device?.cpu || ''} onChange={handleChange} className="form-input" /></div>
                <div className="form-group"><label className="form-label">RAM</label><input type="text" name="ram" value={device?.ram || ''} onChange={handleChange} className="form-input" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Storage</label><input type="text" name="storage" value={device?.storage || ''} onChange={handleChange} className="form-input" /></div>
                <div className="form-group"><label className="form-label">OS</label><input type="text" name="os" value={device?.os || ''} onChange={handleChange} className="form-input" /></div>
              </div>
            </>
          )}

          {device?.device_type === 'camera' && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Camera Specs</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Sensor Type</label><input type="text" name="sensor_type" value={device?.sensor_type || ''} onChange={handleChange} className="form-input" /></div>
                <div className="form-group"><label className="form-label">Lens Mount</label><input type="text" name="lens_mount" value={device?.lens_mount || ''} onChange={handleChange} className="form-input" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Megapixels</label><input type="number" name="megapixels" value={device?.megapixels || ''} onChange={handleChange} className="form-input" step="0.1" /></div>
                <div className="form-group"><label className="form-label">Film Type</label><input type="text" name="film_type" value={device?.film_type || ''} onChange={handleChange} className="form-input" /></div>
              </div>
            </>
          )}

          {(device?.device_type === 'appliance' || device?.device_type === 'miscellaneous') && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Additional Details</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Battery Life</label><input type="text" name="battery_life" value={device?.battery_life || ''} onChange={handleChange} className="form-input" /></div>
                <div className="form-group"><label className="form-label">Connectivity</label><input type="text" name="connectivity" value={device?.connectivity || ''} onChange={handleChange} className="form-input" /></div>
              </div>
            </>
          )}

          {/* device pairing */}
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <Device_Pairing
              currentPairings={device?.paired_devices || []}
              onChange={handlePairingChange}
              excludeId={id}
              maxPairings={3}
            />
          </div>

          {/* notes */}
          <div className="form-group" style={{ marginTop: 'var(--space-xl)' }}>
            <label className="form-label">Notes</label>
            <textarea name="notes" value={device?.notes || ''} onChange={handleChange} className="form-textarea" />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ flex: 1 }}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/')} className="submit-btn" style={{ flex: 1, background: 'var(--stone)', color: 'var(--text-primary)' }}>
              Cancel
            </button>
          </div>

          <button type="button" onClick={handleDelete} style={{ width: '100%', marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'none', border: '1px solid rgba(180, 102, 23, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--brown)', cursor: 'pointer', fontSize: '0.875rem' }}>
            Delete Device
          </button>
        </form>
      </div>
    </div>
  );
}

export default Edit_Device;