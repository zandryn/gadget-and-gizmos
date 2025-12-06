import React, { useState, useRef } from 'react';

function Photo_Upload({
  label,
  photoType,
  currentUrl,
  onUpload,
  onRemove,
  hint
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo_type', photoType);

      const response = await fetch('http://localhost:8000/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to upload. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <div className="photo-upload-wrapper">
      <label className="form-label">{label}</label>

      {currentUrl ? (
        // show preview if we have a photo
        <div className="photo-preview-single">
          <div className="photo-preview-item" style={{ width: '150px', height: '150px' }}>
            <img src={currentUrl} alt={label} />
            <button
              type="button"
              className="remove-photo"
              onClick={() => onRemove()}
              style={{ opacity: 1 }}
            >
              ×
            </button>
            <span className="photo-label">{photoType}</span>
          </div>
          <button
            type="button"
            className="change-photo-btn"
            onClick={handleClick}
            style={{
              marginTop: 'var(--space-sm)',
              padding: 'var(--space-xs) var(--space-md)',
              background: 'none',
              border: '1px solid var(--stone)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8125rem',
            }}
          >
            Change photo
          </button>
        </div>
      ) : (
        // show upload area
        <div
          className={`photo-upload-area ${isDragging ? 'dragging' : ''}`}
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <>
              <div className="loading-spinner" style={{ width: '30px', height: '30px', margin: '0 auto var(--space-sm)' }}></div>
              <p className="photo-upload-text">Uploading...</p>
            </>
          ) : (
            <>
              <div className="photo-upload-icon">📷</div>
              <p className="photo-upload-text">
                Click or drag to upload
              </p>
              {hint && <p className="photo-upload-hint">{hint}</p>}
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {error && (
        <p style={{ color: 'var(--brown)', fontSize: '0.8125rem', marginTop: 'var(--space-sm)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default Photo_Upload;