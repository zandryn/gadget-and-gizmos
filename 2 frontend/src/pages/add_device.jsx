import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Photo_Upload from '../components/photo_upload';
import Device_Pairing from '../components/device_pairing';

const ADMIN_PASSWORD = 'zandryn'; // change later and put on env file

const initialFormState = {
  nickname: '', model: '', brand: '', device_type: 'computer', status: 'active',
  adopted_date: '', purchase_price: '', source: '', notes: '',
  thumbnail: '', hover_photo: '',
  paired_devices: [],
  cpu: '', ram: '', storage: '', os: '', battery_model: '',
  sensor_type: '', lens_mount: '', megapixels: '', film_type: '',
  battery_life: '', connectivity: '',
};

function Add_Device() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoUpload = (field, url) => {
    setFormData((prev) => ({ ...prev, [field]: url }));
  };

  const handlePhotoRemove = (field) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  const handlePairingChange = (pairings) => {
    setFormData((prev) => ({ ...prev, paired_devices: pairings }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        nickname: formData.nickname,
        model: formData.model,
        brand: formData.brand,
        device_type: formData.device_type,
        status: formData.status,
        adopted_date: formData.adopted_date,
        purchase_price: parseFloat(formData.purchase_price),
        source: formData.source,
        notes: formData.notes || null,
        thumbnail: formData.thumbnail || null,
        hover_photo: formData.hover_photo || null,
        paired_devices: formData.paired_devices,
      };

      if (formData.device_type === 'computer') {
        if (formData.cpu) submitData.cpu = formData.cpu;
        if (formData.ram) submitData.ram = formData.ram;
        if (formData.storage) submitData.storage = formData.storage;
        if (formData.os) submitData.os = formData.os;
      } else if (formData.device_type === 'camera') {
        if (formData.sensor_type) submitData.sensor_type = formData.sensor_type;
        if (formData.lens_mount) submitData.lens_mount = formData.lens_mount;
        if (formData.megapixels) submitData.megapixels = parseFloat(formData.megapixels);
        if (formData.film_type) submitData.film_type = formData.film_type;
      } else {
        if (formData.battery_life) submitData.battery_life = formData.battery_life;
        if (formData.connectivity) submitData.connectivity = formData.connectivity;
      }

      const response = await fetch('http://localhost:8000/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) throw new Error('Failed to create device');

      setSuccess(true);
      setFormData(initialFormState);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError('Failed to add device. Is the backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  // password gate
  if (!isAuthenticated) {
    return (
      <div className="add-device-page">
        <header className="page-header">
          <h1 className="page-title">Add Device</h1>
          <p className="page-subtitle">Admin access required</p>
        </header>
        <div className="form-container" style={{ maxWidth: '400px' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <span style={{ fontSize: '3rem' }}>🔐</span>
            <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-md)' }}>
              This area is password protected.
            </p>
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

  return (
    <div className="add-device-page">
      <header className="page-header">
        <h1 className="page-title">Add Device</h1>
        <p className="page-subtitle">Document a new addition to your collection</p>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          {error && <div style={{ padding: 'var(--space-md)', background: 'rgba(180, 102, 23, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--brown)', marginBottom: 'var(--space-lg)' }}>{error}</div>}
          {success && <div style={{ padding: 'var(--space-md)', background: 'var(--sage-muted)', borderRadius: 'var(--radius-md)', color: 'var(--forest)', marginBottom: 'var(--space-lg)' }}>Device added successfully! Redirecting...</div>}

          {/* photos section */}
          <div style={{ marginBottom: 'var(--space-xl)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Photos</h3>
            <div className="form-row">
              <Photo_Upload
                label="Thumbnail"
                photoType="thumbnail"
                currentUrl={formData.thumbnail}
                onUpload={(url) => handlePhotoUpload('thumbnail', url)}
                onRemove={() => handlePhotoRemove('thumbnail')}
                hint="Main card image"
              />
              <Photo_Upload
                label="Hover Photo"
                photoType="hover_photo"
                currentUrl={formData.hover_photo}
                onUpload={(url) => handlePhotoUpload('hover_photo', url)}
                onRemove={() => handlePhotoRemove('hover_photo')}
                hint="Shown on mouse hover"
              />
            </div>
          </div>

          {/* basic info */}
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Basic Info</h3>

          <div className="form-group">
            <label className="form-label">Nickname *</label>
            <input type="text" name="nickname" value={formData.nickname} onChange={handleChange} className="form-input" placeholder="Give it a fun name!" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="form-input" placeholder="e.g., Apple, Fujifilm" required />
            </div>
            <div className="form-group">
              <label className="form-label">Model *</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} className="form-input" placeholder="e.g., MacBook Pro 14" required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Device Type *</label>
              <select name="device_type" value={formData.device_type} onChange={handleChange} className="form-select" required>
                <option value="computer">Computer</option>
                <option value="camera">Camera</option>
                <option value="appliance">Appliance</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="form-select">
                <option value="active">Active</option>
                <option value="retired">Retired</option>
                <option value="repairing">Repairing</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date Adopted *</label>
              <input type="date" name="adopted_date" value={formData.adopted_date} onChange={handleChange} className="form-input" required />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Price *</label>
              <input type="number" name="purchase_price" value={formData.purchase_price} onChange={handleChange} className="form-input" placeholder="0.00" step="0.01" min="0" required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Source *</label>
            <input type="text" name="source" value={formData.source} onChange={handleChange} className="form-input" placeholder="Where did you get it?" required />
          </div>

          {/* type-specific fields */}
          {formData.device_type === 'computer' && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Computer Specs</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">CPU</label><input type="text" name="cpu" value={formData.cpu} onChange={handleChange} className="form-input" placeholder="e.g., Apple M3 Pro" /></div>
                <div className="form-group"><label className="form-label">RAM</label><input type="text" name="ram" value={formData.ram} onChange={handleChange} className="form-input" placeholder="e.g., 16GB" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Storage</label><input type="text" name="storage" value={formData.storage} onChange={handleChange} className="form-input" placeholder="e.g., 512GB SSD" /></div>
                <div className="form-group"><label className="form-label">OS</label><input type="text" name="os" value={formData.os} onChange={handleChange} className="form-input" placeholder="e.g., macOS Sonoma" /></div>
              </div>
            </>
          )}

          {formData.device_type === 'camera' && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Camera Specs</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Sensor Type</label><input type="text" name="sensor_type" value={formData.sensor_type} onChange={handleChange} className="form-input" placeholder="e.g., APS-C, Full Frame" /></div>
                <div className="form-group"><label className="form-label">Lens Mount</label><input type="text" name="lens_mount" value={formData.lens_mount} onChange={handleChange} className="form-input" placeholder="e.g., Fujifilm X" /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Megapixels</label><input type="number" name="megapixels" value={formData.megapixels} onChange={handleChange} className="form-input" placeholder="e.g., 40.2" step="0.1" /></div>
                <div className="form-group"><label className="form-label">Film Type</label><input type="text" name="film_type" value={formData.film_type} onChange={handleChange} className="form-input" placeholder="e.g., 35mm" /></div>
              </div>
            </>
          )}

          {(formData.device_type === 'appliance' || formData.device_type === 'miscellaneous') && (
            <>
              <h3 style={{ fontFamily: 'var(--font-display)', marginTop: 'var(--space-xl)', marginBottom: 'var(--space-md)', color: 'var(--forest)' }}>Additional Details</h3>
              <div className="form-row">
                <div className="form-group"><label className="form-label">Battery Life</label><input type="text" name="battery_life" value={formData.battery_life} onChange={handleChange} className="form-input" placeholder="e.g., 8 hours" /></div>
                <div className="form-group"><label className="form-label">Connectivity</label><input type="text" name="connectivity" value={formData.connectivity} onChange={handleChange} className="form-input" placeholder="e.g., WiFi, Bluetooth" /></div>
              </div>
            </>
          )}

          {/* device pairing */}
          <div style={{ marginTop: 'var(--space-xl)' }}>
            <Device_Pairing
              currentPairings={formData.paired_devices}
              onChange={handlePairingChange}
              maxPairings={3}
            />
          </div>

          {/* notes */}
          <div className="form-group" style={{ marginTop: 'var(--space-xl)' }}>
            <label className="form-label">Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-textarea" placeholder="Any thoughts, memories, or details..." />
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting} style={{ marginTop: 'var(--space-lg)' }}>
            {isSubmitting ? 'Adding...' : 'Add to Collection ✦'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Add_Device;