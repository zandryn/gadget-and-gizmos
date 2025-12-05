import React, { useState, useEffect } from 'react';
import { fetchDevices } from '../services/api';
import DeviceCard from '../components/tech-card';

function Home() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // This function fetches the data
    const getDevices = async () => {
      try {
        setLoading(true);
        const response = await fetchDevices();
        setDevices(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch devices. Is the backend running?');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getDevices(); // Call the function
  }, []); // The empty array [] means this runs once on component mount

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>My Tech Items</h1>
      <div className="device-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {devices.length > 0 ? (
          devices.map(device => (
            <DeviceCard key={device._id} device={device} />
          ))
        ) : (
          <p>No devices found. Try adding one!</p>
        )}
      </div>
    </div>
  );
}

export default Home;