import React from 'react';

export default function CrowdZones({ zones }) {
  const zoneArr = Object.values(zones || {});
  if (zoneArr.length === 0) return (
    <p style={{ opacity: 0.3, fontSize: '0.8rem' }}>No zone data. Click Sync Data.</p>
  );

  return (
    <div>
      {zoneArr.map(zone => {
        const pct = Math.round((zone.currentOccupancy / zone.maxCapacity) * 100);
        const cls = zone.density || (pct > 85 ? 'high' : pct > 60 ? 'medium' : 'low');
        return (
          <div key={zone.id} className="zone-row">
            <div className="zone-row-header">
              <span className="zone-name-text">{zone.name}</span>
              <span className={`zone-badge ${cls}`}>{cls}</span>
            </div>
            <div className="zone-bar-bg">
              <div className={`zone-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
            </div>
            <p className="zone-cap">{zone.currentOccupancy?.toLocaleString()} / {zone.maxCapacity?.toLocaleString()} people</p>
          </div>
        );
      })}
    </div>
  );
}
