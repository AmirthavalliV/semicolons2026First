import React, { useEffect, useMemo, useState } from 'react';
import { apiChat, apiGetClaim, apiStart, apiUpload } from './api.js';

export default function App() {
  const [claimId, setClaimId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [claim, setClaim] = useState(null);
  const [tab, setTab] = useState('chat');

  const statusBadge = useMemo(() => {
    const s = claim?.status || 'Draft';
    const cls = s === 'Submitted' ? 'badge green' : s === 'Needs Review' ? 'badge amber' : 'badge gray';
    return <span className={cls}>{s}</span>;
  }, [claim]);

  useEffect(() => {
    (async () => {
      const s = await apiStart();
      setClaimId(s.claimId);
      setMessages([{ role: 'agent', text: s.message }]);
      const c = await apiGetClaim(s.claimId);
      setClaim(c);
    })();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || !claimId) return;
    setMessages((m) => [...m, { role: 'user', text }]);
    setInput('');

    const resp = await apiChat({ claimId, message: text });
    setMessages((m) => [...m, { role: 'agent', text: resp.nextQuestion }]);

    const c = await apiGetClaim(claimId);
    setClaim(c);
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !claimId) return;
    await apiUpload({ claimId, file });
    const c = await apiGetClaim(claimId);
    setClaim(c);
    setMessages((m) => [...m, { role: 'agent', text: `Uploaded ${file.name}.` }]);
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>Claims Agent (Hackathon)</h1>
          <p className="sub">Conversational FNOL • Policy validation • Severity • Routing • Tracking</p>
        </div>
        <div className="right">
          <div className="kv">
            <div className="k">Claim</div>
            <div className="v mono">{claimId || '—'}</div>
          </div>
          <div className="kv">
            <div className="k">Status</div>
            <div className="v">{statusBadge}</div>
          </div>
        </div>
      </header>

      <nav className="tabs">
        <button className={tab==='chat' ? 'active' : ''} onClick={() => setTab('chat')}>Chat Filing</button>
        <button className={tab==='track' ? 'active' : ''} onClick={() => setTab('track')}>Claim Tracking</button>
      </nav>

      {tab === 'chat' && (
        <section className="card">
          <div className="chat">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'msg user' : 'msg agent'}>
                <div className="bubble">
                  <div className="meta">{m.role === 'user' ? 'You' : 'Agent'}</div>
                  <div>{m.text}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="composer">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Describe incident... include POL-12345 and date YYYY-MM-DD" />
            <button onClick={send}>Send</button>
          </div>

          <div className="upload">
            <label className="filebtn">
              Attach Document
              <input type="file" onChange={onUpload} hidden />
            </label>
          </div>
        </section>
      )}

      {tab === 'track' && (
        <section className="grid">
          <div className="card">
            <h2>Overview</h2>
            <div className="row"><span className="label">Policy</span><span className="mono">{claim?.policyNumber || '—'}</span></div>
            <div className="row"><span className="label">Incident Date</span><span className="mono">{claim?.incidentDate || '—'}</span></div>
            <div className="row"><span className="label">Type</span><span>{claim?.claimType || '—'}</span></div>
            <div className="row"><span className="label">Severity</span><span className="mono">{claim?.severity ?? '—'}</span></div>
            <div className="row"><span className="label">Lane</span><span>{claim?.routingLane || '—'}</span></div>
            <div className="row"><span className="label">Policy Check</span><span>{claim?.policyValidation?.reason || '—'}</span></div>
          </div>

          <div className="card">
            <h2>AI Summary</h2>
            <p className="muted">(Rule-based by default; can be switched to Bedrock)</p>
            <div className="box">{claim?.summary || '—'}</div>
            <h3>Recommendation</h3>
            <div className="box">{claim?.recommendation || '—'}</div>
          </div>

          <div className="card">
            <h2>Documents</h2>
            {claim?.documents?.length ? (
              <ul>
                {claim.documents.map((d, i) => (
                  <li key={i}><span className="mono">{d.fileName}</span> <span className="muted">({new Date(d.uploadedAt).toLocaleString()})</span></li>
                ))}
              </ul>
            ) : (
              <p className="muted">No documents uploaded yet.</p>
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="muted">Tip: Type “Accident on 2026-05-16 for POL-12345, went to hospital” to see HighTouch routing.</div>
      </footer>
    </div>
  );
}
