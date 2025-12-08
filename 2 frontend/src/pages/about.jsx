import React from 'react';

function About() {
  return (
    <div className="about-page">
      <header className="page-header">
        <h1 className="page-title">About</h1>
        <p className="page-subtitle">The story behind Gadgets & Gizmos</p>
      </header>

      <div className="about-content">
        <p>
          Welcome to my digital collection binder! ✨ This dashboard is a labor of love, 
          built to document and showcase every piece of tech that has found its way into my life.
        </p>

        <p>
          I've always been fascinated by gadgets—both old and new. There's something magical 
          about vintage cameras that still capture beautiful images, and laptops that have been 
          faithful companions through late-night coding sessions and creative projects.
        </p>

        <p>
          This site serves as my personal asset management ledger, helping me track what I own, 
          what I've spent, and the repair journeys that bring retired devices back to life.
        </p>

        <h2>Features</h2>
        <ul className="feature-list">
          <li>Browse and search through my entire tech collection</li>
          <li>View detailed specs and notes for each device</li>
          <li>Track repair history and maintenance schedules</li>
          <li>Calculate total investment and savings from repairs</li>
          <li>Photo galleries to document each device's journey</li>
        </ul>

        <h2>Tech Stack</h2>
        <ul className="feature-list">
          <li><strong>Frontend:</strong> React + Vite</li>
          <li><strong>Backend:</strong> FastAPI (Python)</li>
          <li><strong>Database:</strong> MongoDB</li>
          <li><strong>Storage:</strong> Google Cloud Storage</li>
        </ul>

        <h2>Philosophy</h2>
        <p>
          In a world of planned obsolescence, I believe in giving tech a second life. 
          Whether it's a vintage Canon AE-1 that needs a new light seal or a ThinkPad 
          that deserves a fresh Linux install, there's joy in the repair process.
        </p>

        <p style={{ 
          marginTop: 'var(--space-2xl)',
          padding: 'var(--space-lg)',
          background: 'var(--sage-muted)',
          borderRadius: 'var(--radius-lg)',
          fontStyle: 'italic',
          color: 'var(--forest)',
        }}>
          "It hurts my wallet, but heals my soul." 💚
        </p>

        {/* Version Info */}
        <div style={{
          marginTop: 'var(--space-3xl)',
          paddingTop: 'var(--space-lg)',
          borderTop: '1px solid var(--stone)',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}>
          <p>Version 1.0.0 · Made with ☕ and moral support from my cats.</p>
        </div>
      </div>
    </div>
  );
}

export default About;
