import React from 'react';

export default function ServiceBoard({ waitTimes }) {
  const services = Object.values(waitTimes || {});
  if (services.length === 0) return (
    <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>No service data. Click Sync Data.</p>
  );

  return (
    <div>
      {services.map(s => (
        <div key={s.id} className="service-row">
          <div>
            <p className="service-name-text">{s.name}</p>
            <p className={`service-trend ${s.trend}`}>
              {s.trend === 'increasing' ? '↑ Queue Growing' :
               s.trend === 'decreasing' ? '↓ Shrinking' : '→ Stable'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="service-time-val">{s.waitTimeMinutes}</span>
            <span className="service-time-lbl">MINS</span>
          </div>
        </div>
      ))}
    </div>
  );
}
