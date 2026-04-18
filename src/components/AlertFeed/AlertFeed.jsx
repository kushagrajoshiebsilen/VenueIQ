import React from 'react';

export default function AlertFeed({ alerts }) {
  const list = Object.values(alerts || {}).filter(a => a.active);
  if (list.length === 0) return (
    <p style={{ opacity: 0.3, fontSize: '0.8rem', letterSpacing: '2px' }}>ALL SYSTEMS NOMINAL</p>
  );

  return (
    <div>
      {list.map(alert => (
        <div key={alert.id} className="alert-item">
          <div>
            <div className={`alert-dot ${alert.priority}`} style={{ marginTop: 4 }} />
          </div>
          <div>
            <p className={`alert-type ${alert.priority}`}>{alert.type?.replace('_', ' ')}</p>
            <p className="alert-msg">{alert.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
