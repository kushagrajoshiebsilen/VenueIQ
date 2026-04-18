import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';

import { rtdb } from './firebase/config';
import { ref, onValue } from 'firebase/database';
import { initializeMockRealtimeDb } from './firebase/mockData';

/* ─── Components ─── */
import VenueAssistant from './components/VenueAssistant/VenueAssistant';
import CrowdZones from './components/CrowdZones/CrowdZones';
import ServiceBoard from './components/ServiceBoard/ServiceBoard';
import AlertFeed from './components/AlertFeed/AlertFeed';
import StadiumMap from './components/StadiumMap/StadiumMap';
import LoadingPage from './components/LoadingPage/LoadingPage';

/* ─── Scroll reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll('.reveal:not(.visible), .reveal-left:not(.visible), .reveal-right:not(.visible)');
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
      }, { threshold: 0.08 });
      els.forEach(el => obs.observe(el));
      return obs;
    };
    const obs = observe();
    return () => obs.disconnect();
  });
}

function App() {
  const [ready, setReady] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [crowdData, setCrowdData] = useState({});
  const [waitTimes, setWaitTimes] = useState({});
  const [alerts, setAlerts] = useState({});

  /* cursor */
  const [mouse, setMouse] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e) => setMouse({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    let raf;
    const loop = () => {
      ringRef.current = {
        x: ringRef.current.x + (mouse.x - ringRef.current.x) * 0.12,
        y: ringRef.current.y + (mouse.y - ringRef.current.y) * 0.12,
      };
      setRing({ ...ringRef.current });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [mouse]);

  /* Firebase */
  useEffect(() => {
    const sub = (path, setter) => onValue(ref(rtdb, path), s => { if (s.exists()) setter(s.val()); });
    const u1 = sub('crowdZones', setCrowdData);
    const u2 = sub('waitTimes', setWaitTimes);
    const u3 = sub('alerts', setAlerts);
    return () => { u1(); u2(); u3(); };
  }, []);

  useReveal();

  if (!ready) return <LoadingPage onFinished={() => setReady(true)} />;

  const zones = Object.values(crowdData);
  const totalPeople = zones.reduce((s, z) => s + (z.currentOccupancy || 0), 0);

  return (
    <>
      {/* Background */}
      <div className="app-bg" />

      {/* Custom Cursor */}
      <div className="cursor" style={{ left: mouse.x, top: mouse.y }} />
      <div className="cursor-ring" style={{ left: ring.x, top: ring.y }} />

      {/* Nav */}
      <nav className="nav">
        <span className="nav-logo">VENUEIQ</span>
        <div className="nav-actions">
          <button className="nav-btn" onClick={() => initializeMockRealtimeDb()}>Sync Data</button>
          <button className="nav-btn" onClick={() => setMapOpen(true)}>Stadium Atlas</button>
          <button className="nav-btn primary" onClick={() => setMapOpen(true)}>Live View</button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <p className="hero-eyebrow">AI-Powered Stadium Intelligence</p>
        <h1 className="hero-title">
          <span className="line"><span>Venue</span></span>
          <span className="line"><span>Operations</span></span>
          <span className="line"><span style={{ color: 'var(--accent)' }}>Reimagined.</span></span>
        </h1>
        <p className="hero-desc reveal">
          Real-time crowd analytics, predictive smart routing, and AI-powered decision support — all unified into one living dashboard.
        </p>
        <div className="hero-stats reveal">
          <div>
            <span className="hero-stat-val">{totalPeople.toLocaleString()}</span>
            <span className="hero-stat-lbl">Live Attendance</span>
          </div>
          <div>
            <span className="hero-stat-val">{zones.length}</span>
            <span className="hero-stat-lbl">Active Zones</span>
          </div>
          <div>
            <span className="hero-stat-val">{Object.keys(alerts).length}</span>
            <span className="hero-stat-lbl">Security Alerts</span>
          </div>
          <div>
            <span className="hero-stat-val">99.9%</span>
            <span className="hero-stat-lbl">Uptime</span>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <div className="scroll-line" />
          <span>SCROLL</span>
        </div>
      </section>

      <div className="holo-divider" />

      {/* ── Stadium Map Section ── */}
      <section className="section">
        <p className="section-label reveal">Stadium Replica</p>
        <h2 className="section-title reveal">The Atlas</h2>
        <div className="bento">
          <div
            className="glass-card map-card c8 reveal-left"
            style={{ minHeight: 440 }}
            onClick={() => setMapOpen(true)}
          >
            <div className="map-card-header">
              <span className="map-card-title">STADIUM_REPLICA_V1.0</span>
              <span className="map-card-action">Expand Atlas ↗</span>
            </div>
            <div style={{ height: 360 }}>
              <StadiumMap zones={crowdData} isMini={true} onExpand={() => setMapOpen(true)} />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="glass-card c4 reveal d1" style={{ padding: 28 }}>
            <div className="stat-card" style={{ padding: 0 }}>
              <p className="s-label">Total Presence</p>
              <span className="s-value" style={{ color: 'var(--accent)' }}>{totalPeople.toLocaleString()}</span>
              <p className="s-sub">NETWORK_NODES: {zones.length}</p>
            </div>
            <div style={{ margin: '30px 0', background: 'rgba(255,255,255,0.06)', height: 1 }} />
            <div className="stat-card" style={{ padding: 0 }}>
              <p className="s-label">Security Alerts</p>
              <span className="s-value" style={{ color: 'var(--accent2)' }}>{Object.keys(alerts).length}</span>
              <p className="s-sub">MONITORING: ACTIVE</p>
            </div>
            <div style={{ margin: '30px 0', background: 'rgba(255,255,255,0.06)', height: 1 }} />
            <div className="stat-card" style={{ padding: 0 }}>
              <p className="s-label">Core Uptime</p>
              <span className="s-value" style={{ color: 'var(--accent3)' }}>99.98%</span>
              <p className="s-sub">LATENCY: 12ms</p>
            </div>
          </div>
        </div>
      </section>

      <div className="holo-divider" />

      {/* ── Crowd & Alerts ── */}
      <section className="section">
        <p className="section-label reveal">Crowd Intelligence</p>
        <h2 className="section-title reveal">Zone Dynamics</h2>
        <div className="bento">
          <div className="glass-card c7 reveal-left d1" style={{ padding: 28 }}>
            <CrowdZones zones={crowdData} />
          </div>
          <div className="glass-card c5 reveal-right d2" style={{ padding: 28 }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '4px', opacity: 0.5, marginBottom: 24, textTransform: 'uppercase' }}>Security Feed</p>
            <AlertFeed alerts={alerts} />
          </div>
        </div>
      </section>

      <div className="holo-divider" />

      {/* ── Services & Assistant ── */}
      <section className="section">
        <p className="section-label reveal">Operations</p>
        <h2 className="section-title reveal">Logistics &amp; AI Core</h2>
        <div className="bento">
          <div className="glass-card c5 reveal-left" style={{ padding: 28 }}>
            <p style={{ fontSize: '0.6rem', letterSpacing: '4px', opacity: 0.5, marginBottom: 24, textTransform: 'uppercase' }}>Queue Intelligence</p>
            <ServiceBoard waitTimes={waitTimes} />
          </div>
          <div className="glass-card c7 reveal-right assistant-card">
            <div className="assistant-top">
              <div className="assistant-dot" />
              <span className="assistant-title">VenueIQ Assistant</span>
            </div>
            <VenueAssistant crowdData={crowdData} alertsData={alerts} waitTimesData={waitTimes} />
          </div>
        </div>
      </section>

      {/* ── Full Map Modal ── */}
      {mapOpen && (
        <div className="map-modal" onClick={(e) => { if (e.target === e.currentTarget) setMapOpen(false); }}>
          <div className="map-modal-inner">
            <div className="map-modal-header">
              <span style={{ fontFamily: 'Syne', fontSize: '1.5rem', fontWeight: 700 }}>Stadium Atlas</span>
              <button className="map-close" onClick={() => setMapOpen(false)}>Close ×</button>
            </div>
            <div className="glass-card" style={{ padding: 40 }}>
              <StadiumMap zones={crowdData} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
