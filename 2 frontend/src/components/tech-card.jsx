import React from 'react';
import { Link } from 'react-router-dom';

// placeholder card
function TechCard({ device }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', width: '200px' }}>
      {/* Basic image placeholder */}
      <div style={{ width: '100%', height: '150px', background: '#eee', marginBottom: '10px' }}>
        {/* In Milestone 4, this will be: <img src={device.photos[0]} alt={device.name} /> */}
      </div>
      <h3>{device.name}</h3>
      <p>{device.device_type}</p>
      <Link to={`/device/${device._id}`}>View Details</Link>
    </div>
  );
}

export default TechCard;