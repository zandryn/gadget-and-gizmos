import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const formatPrice = (price) => {
  if (!price) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const typeIcons = {
  computer: '💻',
  camera: '📷',
  appliance: '🏠',
  misc: '✨',
  miscellaneous: '✨',
};

function Detail_Panel({ device, isOpen, onClose }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!device) return null;

  const getSpecsForType = () => {
    const baseSpecs = [
      { label: 'Brand', value: device.brand },
      { label: 'Model', value: device.model },
      { label: 'Adopted', value: formatDate(device.adopted_date) },
      { label: 'Source', value: device.source },
      { label: 'Purchase Price', value: formatPrice(device.purchase_price) },
      { label: 'Current Value', value: formatPrice(device.current_value) },
    ];

    const typeSpecificSpecs = {
      computer: [
        { label: 'CPU', value: device.cpu },
        { label: 'RAM', value: device.ram },
        { label: 'Storage', value: device.storage },
        { label: 'OS', value: device.os },
      ],
      camera: [
        { label: 'Sensor Type', value: device.sensor_type },
        { label: 'Lens Mount', value: device.lens_mount },
        { label: 'Megapixels', value: device.megapixels ? `${device.megapixels} MP` : null },
        { label: 'Film Type', value: device.film_type },
      ],
      appliance: [
        { label: 'Battery Life', value: device.battery_life },
        { label: 'Connectivity', value: device.connectivity },
      ],
      misc: [
        { label: 'Battery Life', value: device.battery_life },
        { label: 'Connectivity', value: device.connectivity },
      ],
      miscellaneous: [
        { label: 'Battery Life', value: device.battery_life },
        { label: 'Connectivity', value: device.connectivity },
      ],
    };

    const additionalSpecs = typeSpecificSpecs[device.device_type] || [];
    return [...baseSpecs, ...additionalSpecs].filter(spec => spec.value);
  };

  const specs = getSpecsForType();

  const handleEdit = () => {
    onClose();
    navigate(`/edit/${device._id}`);
  };

  // check if device has photos
  const hasMainPhoto = device.main_photo || device.thumbnail;
  const hasHoverPhoto = device.hover_photo;
  const hasGallery = device.gallery && device.gallery.length > 0;

  return (
    <>
      <div className={`detail-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />

      <div className={`detail-panel ${isOpen ? 'open' : ''}`}>
        <div className="detail-panel-header">
          <h2 className="detail-panel-title">{device.nickname || device.model}</h2>
          <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
            <button 
              className="edit-btn" 
              onClick={handleEdit}
              title="Edit device"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--sage-muted)',
                color: 'var(--forest)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="detail-panel-content">
          <div className="detail-grid">
            {/* image section */}
            <div className="detail-image-section">
              <div className="detail-image">
                {hasMainPhoto ? (
                  <img src={device.main_photo || device.thumbnail} alt={device.nickname || device.model} />
                ) : (
                  <div className="placeholder" style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '4rem',
                    background: 'var(--cream-dark)',
                  }}>
                    {typeIcons[device.device_type] || '📱'}
                  </div>
                )}
              </div>

              {/* gallery thumbnails */}
              {hasGallery && (
                <div className="detail-gallery" style={{
                  display: 'flex',
                  gap: 'var(--space-sm)',
                  marginTop: 'var(--space-md)',
                  overflowX: 'auto',
                  paddingBottom: 'var(--space-sm)',
                }}>
                  {device.gallery.map((photo, index) => (
                    <div 
                      key={index}
                      className="gallery-thumb"
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        cursor: 'pointer',
                        border: '2px solid transparent',
                      }}
                    >
                      <img 
                        src={photo.url} 
                        alt={`${device.nickname} ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* info section */}
            <div className="detail-info">
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <span className={`status-badge ${device.status}`} style={{ position: 'static' }}>
                  {device.status}
                </span>
                <span className="type-tag" style={{ position: 'static', marginLeft: 'var(--space-sm)', background: 'var(--sage-muted)' }}>
                  {device.device_type}
                </span>
              </div>

              <h3>Specifications</h3>
              <div className="detail-specs">
                {specs.map((spec, index) => (
                  <div key={index} className="spec-row">
                    <span className="spec-label">{spec.label}</span>
                    <span className="spec-value">{spec.value}</span>
                  </div>
                ))}
              </div>

              {device.notes && (
                <div className="detail-notes">
                  <h4>Notes</h4>
                  <p>{device.notes}</p>
                </div>
              )}

              {/* paired devices */}
              {device.paired_devices && device.paired_devices.length > 0 && (
                <div className="detail-notes" style={{ marginTop: 'var(--space-md)' }}>
                  <h4>Paired With</h4>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', marginTop: 'var(--space-sm)' }}>
                    {device.paired_devices.map((paired, index) => (
                      <span 
                        key={index}
                        style={{
                          padding: 'var(--space-xs) var(--space-sm)',
                          background: 'var(--sage-muted)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8125rem',
                          color: 'var(--forest)',
                        }}
                      >
                        🔗 {paired.nickname || paired.model}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {device.repairs && device.repairs.length > 0 && (
                <div className="detail-notes" style={{ marginTop: 'var(--space-md)' }}>
                  <h4>Repair History</h4>
                  <p>{device.repairs.length} repair event{device.repairs.length > 1 ? 's' : ''} logged</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Detail_Panel;
