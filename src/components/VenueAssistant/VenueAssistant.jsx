import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
let genAI = null;
try { if (apiKey) genAI = new GoogleGenerativeAI(apiKey); } catch (e) {}

/* ── Simple inline markdown renderer (bold, italic, code) ── */
function renderMarkdown(text) {
  const parts = [];
  // Split by ** for bold, * for italic, ` for code
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\n)/g);
  tokens.forEach((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      parts.push(<strong key={i}>{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*') && tok.endsWith('*') && tok.length > 2) {
      parts.push(<em key={i}>{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith('`') && tok.endsWith('`')) {
      parts.push(<code key={i} style={{ background: 'rgba(0,255,170,0.08)', padding: '1px 5px', borderRadius: 4, fontSize: '0.85em' }}>{tok.slice(1, -1)}</code>);
    } else if (tok === '\n') {
      parts.push(<br key={i} />);
    } else {
      parts.push(tok);
    }
  });
  return parts;
}

const FOOD_WORDS = ['food', 'eat', 'hungry', 'burger', 'bite', 'meal', 'snack', 'drink', 'beer', 'café'];
const TOILET_WORDS = ['restroom', 'toilet', 'bathroom', 'washroom', 'loo', 'wc'];
const isToilet = (name) => TOILET_WORDS.some(w => name.toLowerCase().includes(w));
const isFood = (name) => !isToilet(name);

function getOfflineResponse(q, crowdData, alertsData, waitTimesData) {
  const question = q.toLowerCase();
  const zones = Object.values(crowdData || {});
  const waits = Object.values(waitTimesData || {});
  const alertList = Object.values(alertsData || {}).filter(a => a.active);

  // Food
  if (FOOD_WORDS.some(w => question.includes(w))) {
    const food = waits.filter(s => isFood(s.name));
    if (food.length) {
      const best = [...food].sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)[0];
      return `Shortest food wait: **${best.name}** at **${best.waitTimeMinutes} min**.\n\nAll food options:\n${food.map(f => `• ${f.name} — ${f.waitTimeMinutes} min (${f.trend})`).join('\n')}`;
    }
    return 'Food data is loading. Try clicking **Sync Data** in the nav.';
  }

  // Restrooms
  if (TOILET_WORDS.some(w => question.includes(w))) {
    const toilets = waits.filter(s => isToilet(s.name));
    if (toilets.length) {
      const best = [...toilets].sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes)[0];
      return `Nearest free restroom: **${best.name}** with **${best.waitTimeMinutes === 0 ? 'no wait 🎉' : best.waitTimeMinutes + ' min wait'}**.\n\n${toilets.map(t => `• ${t.name} — ${t.waitTimeMinutes} min`).join('\n')}`;
    }
    return 'Restroom data is loading. Try clicking **Sync Data**.';
  }

  // Crowds
  if (['crowd', 'busy', 'avoid', 'safe', 'full'].some(w => question.includes(w))) {
    const high = zones.filter(z => z.density === 'high');
    const low = zones.filter(z => z.density === 'low');
    const lines = [];
    if (high.length) lines.push(`🔴 **Avoid** — crowded right now: ${high.map(z => z.name).join(', ')}`);
    if (low.length) lines.push(`🟢 **Recommended** — quieter zones: ${low.map(z => z.name).join(', ')}`);
    return lines.join('\n\n') || 'All zones are at normal capacity right now.';
  }

  // Alerts / emergency
  if (['alert', 'emergency', 'incident', 'danger', 'warning'].some(w => question.includes(w))) {
    if (!alertList.length) return '✅ All clear — no active alerts right now.';
    return `**${alertList.length} active alert(s):**\n\n${alertList.map(a => `${a.priority === 'high' ? '🔴' : '🔵'} **${a.type?.replace(/_/g, ' ')}** — ${a.message}`).join('\n\n')}`;
  }

  // Wait times general
  if (['wait', 'queue', 'time', 'how long'].some(w => question.includes(w))) {
    if (!waits.length) return 'Wait time data is loading. Try clicking **Sync Data**.';
    const sorted = [...waits].sort((a, b) => a.waitTimeMinutes - b.waitTimeMinutes);
    return `Current queue times:\n\n${sorted.map(s => `• **${s.name}** — ${s.waitTimeMinutes} min (${s.trend === 'increasing' ? '↑ growing' : s.trend === 'decreasing' ? '↓ shrinking' : '→ stable'})`).join('\n')}`;
  }

  // Hello
  if (['hello', 'hi', 'hey', 'help'].some(w => question.includes(w))) {
    return `Hey! I'm **VenueIQ**, your stadium assistant. I can help with:\n\n• 🍔 **Food & drinks** — shortest queues\n• 🚻 **Restrooms** — nearest with no wait\n• 📊 **Crowd zones** — where to avoid\n• 🚨 **Alerts** — live security updates\n• ⏱️ **Wait times** — all venues ranked`;
  }

  // Default
  const total = zones.reduce((s, z) => s + (z.currentOccupancy || 0), 0);
  return `Currently monitoring **${zones.length} zones** with **${total.toLocaleString()} people** in the venue.\n\nAsk me about food, restrooms, wait times, crowd levels, or alerts!`;
}

export default function VenueAssistant({ crowdData, alertsData, waitTimesData }) {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hey! I\'m **VenueIQ Assistant**. Ask me about food queues, restrooms, crowds, wait times, or live alerts.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setLoading(true);

    // Try Gemini first
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const context = `You are VenueIQ, a helpful stadium assistant. Be concise (2-3 sentences max). Use the following live data:
CROWD ZONES: ${JSON.stringify(crowdData)}
ALERTS: ${JSON.stringify(alertsData)}
WAIT TIMES: ${JSON.stringify(waitTimesData)}

Answer the user's question using this data. If asking about food, only mention food/drink items, not restrooms. If asking about restrooms, only mention restroom/washroom locations.`;
        const result = await model.generateContent(`${context}\n\nUser: ${text}`);
        const reply = result.response.text();
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('Gemini error, using offline fallback:', err.message);
      }
    }

    // Offline fallback
    await new Promise(r => setTimeout(r, 300));
    const reply = getOfflineResponse(text, crowdData, alertsData, waitTimesData);
    setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    setLoading(false);
  };

  return (
    <>
      <div className="chat-body">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {renderMarkdown(m.text)}
          </div>
        ))}
        {loading && (
          <div className="msg bot" style={{ opacity: 0.5 }}>
            <span className="typing-dot" />
            <span className="typing-dot" style={{ animationDelay: '0.15s' }} />
            <span className="typing-dot" style={{ animationDelay: '0.3s' }} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-row">
        <input
          className="chat-inp"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="food? restrooms? crowd levels? alerts?"
          autoComplete="off"
        />
        <button className="chat-send" onClick={send} disabled={!input.trim() || loading}>
          {loading ? '...' : 'SEND'}
        </button>
      </div>
    </>
  );
}
