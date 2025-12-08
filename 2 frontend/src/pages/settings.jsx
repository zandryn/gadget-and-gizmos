import React, { useState } from 'react';

function Settings({ darkMode, setDarkMode }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    
    // create mailto link with the report content
    const subject = encodeURIComponent('Gadgets & Gizmos - Inaccuracy Report');
    const body = encodeURIComponent(`Inaccuracy Report:\n\n${reportText}\n\n---\nSent from Gadgets & Gizmos Database`);
    window.location.href = `mailto:epraudite+db_concern@gmail.com?subject=${subject}&body=${body}`;
    
    setReportSent(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportText('');
      setReportSent(false);
    }, 2000);
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience</p>
      </header>

      <div className="settings-container">
        {/* appearance section */}
        <section className="settings-section">
          <h2 className="settings-section-title">Appearance</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Dark Mode</h3>
              <p>Switch to a darker color scheme that's easier on the eyes</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)} 
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </section>

        {/* links section */}
        <section className="settings-section">
          <h2 className="settings-section-title">Links</h2>
          
          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Visit Epraudite Portfolio</h3>
              <p>Check out more of my work and projects</p>
            </div>
            <button className="settings-btn disabled" disabled title="Coming soon!">
              Coming Soon
            </button>
          </div>

          <div className="settings-item">
            <div className="settings-item-info">
              <h3>Report an Inaccuracy</h3>
              <p>Found something wrong? Let me know!</p>
            </div>
            <button 
              className="settings-btn"
              onClick={() => setShowReportModal(true)}
            >
              Report
            </button>
          </div>
        </section>

        {/* disclaimer section */}
        <section className="settings-section disclaimer-section">
          <h2 className="settings-section-title">Disclaimer</h2>
          <div className="disclaimer-box">
            <p>
              <strong>Personal Documentation Only</strong>
            </p>
            <p>
              This database is my personal journal for documenting and tracking my tech collection. 
              The information here reflects my own experiences, purchase prices, and notes.
            </p>
            <p>
              <strong>Please note:</strong>
            </p>
            <ul>
              <li>Prices shown are what I personally paid and may not reflect current market value</li>
              <li>This is not intended as a buying guide or tutorial</li>
              <li>Specifications are recorded for my own reference and may contain errors</li>
              <li>Do not use this information for making purchasing decisions</li>
            </ul>
            <p style={{ marginTop: 'var(--space-md)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
              For accurate pricing and specifications, please consult official manufacturer sources or reputable retailers.
            </p>
          </div>
        </section>
      </div>

      {/* report inaccuracy modal */}
      {showReportModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowReportModal(false)} />
          <div className="modal">
            <div className="modal-header">
              <h2>Report an Inaccuracy</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowReportModal(false)}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="modal-content">
              {reportSent ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <span style={{ fontSize: '3rem' }}>✉️</span>
                  <p style={{ marginTop: 'var(--space-md)', color: 'var(--sage)' }}>
                    Opening your email client...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit}>
                  <p style={{ marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>
                    Please describe what you found to be inaccurate. Include the device name if applicable.
                  </p>
                  <textarea
                    className="form-textarea"
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="e.g., The MacBook Pro specs list the wrong processor model..."
                    rows={5}
                    required
                    style={{ marginBottom: 'var(--space-md)' }}
                  />
                  <button type="submit" className="submit-btn">
                    Send Report
                  </button>
                </form>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Settings;
