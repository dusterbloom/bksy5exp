import React from 'react';
import { useAuth } from '../context/AuthContext';

function Messages() {
  const { session } = useAuth();

  return (
    <div className="container" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <h2>Messages Coming Soon</h2>
      <p style={{ color: 'var(--gray)', marginTop: '1rem' }}>
        Direct messaging feature will be available in a future update.
      </p>
      <p style={{ color: 'var(--gray)', marginTop: '0.5rem' }}>
        Currently logged in as: @{session?.handle}
      </p>
    </div>
  );
}

export default Messages;
