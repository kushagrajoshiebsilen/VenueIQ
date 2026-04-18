import React, { useState, useEffect } from 'react';

const LOG = [
  '[BOOT] Initializing VenueIQ Core...',
  '[NET]  Connecting to Firebase RTDB...',
  '[AUTH] Validating Security Layers...',
  '[AI]   Loading Gemini Intelligence...',
  '[DATA] Syncing Crowd Telemetry...',
  '[OK]   System Online — Welcome.',
];

export default function LoadingPage({ onFinished }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const timers = [];
    LOG.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setLines(prev => [...prev, line]);
      }, i * 320));
    });
    // Fire onFinished after all lines appear + 800ms delay
    timers.push(setTimeout(onFinished, LOG.length * 320 + 800));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="boot-screen">
      <div className="boot-logo">VENUEIQ</div>
      <div className="boot-log-list">
        {lines.map((l, i) => (
          <div key={i} className="boot-line">{l}</div>
        ))}
        {lines.length < LOG.length && <span className="boot-cursor-blink" />}
      </div>
    </div>
  );
}
