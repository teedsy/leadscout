'use client'
import { useState } from 'react'

const INDUSTRIES = [
  { val: 'Legal', label: 'Legal' },
  { val: 'Finance / CPA / Accounting', label: 'Finance / CPA' },
  { val: 'Real Estate', label: 'Real Estate' },
  { val: 'Healthcare / Medical', label: 'Healthcare' },
  { val: 'Insurance', label: 'Insurance' },
  { val: 'General SMB', label: 'General SMB' },
]

const LOG_STEPS = [
  'Reading your search parameters...',
  'Searching the web for real local businesses...',
  'Visiting company websites for verified data...',
  'Analyzing AI pain points per company...',
  'Scoring and ranking leads...',
  'Writing personalized cold emails...',
  'Saving results to database...',
]

function tierColor(tier) {
  return tier === 'hot' ? '#ff6b35' : tier === 'warm' ? '#e8c547' : '#3b82f6'
}
function tierLabel(tier) {
  return tier === 'hot' ? '🔥 HOT' : tier === 'warm' ? '✅ WARM' : '🌡️ LUKEWARM'
}

export default function Home() {
  const [city, setCity] = useState('Springfield, MO')
  const [numLeads, setNumLeads] = useState('5')
  const [selectedIndustries, setSelectedIndustries] = useState(['Legal', 'Finance / CPA / Accounting'])
  const [companySize, setCompanySize] = useState('small-to-mid (10–50 employees)')
  const [aiService, setAiService] = useState('AI automation and custom AI development')
  const [extraContext, setExtraContext] = useState('')
  const [loading, setLoading] = useState(false)
  const [logStep, setLogStep] = useState(-1)
  const [leads, setLeads] = useState([])
  const [error, setError] = useState('')
  const [view, setView] = useState('form')
  const [searches, setSearches] = useState([])
  const [copiedId, setCopiedId] = useState(null)

  function toggleIndustry(val) {
    setSelectedIndustries(prev => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val])
  }

  async function generate() {
    if (!city.trim()) { setError('Please enter a city.'); return }
    if (!selectedIndustries.length) { setError('Please select at least one industry.'); return }
    setError('')
    setLoading(true)
    setLogStep(0)
    setLeads([])
    let step = 0
    const stepInterval = setInterval(() => { step = Math.min(step + 1, LOG_STEPS.length - 2); setLogStep(step) }, 2200)
    try {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ city, num: numLeads, industries: selectedIndustries, size: companySize, service: aiService, extra: extraContext }) })
      clearInterval(stepInterval)
      setLogStep(LOG_STEPS.length - 1)
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Generation failed')
      setLeads(data.leads)
      setTimeout(() => { setLoading(false); setView('results') }, 800)
    } catch (err) {
      clearInterval(stepInterval)
      setLoading(false)
      setLogStep(-1)
      setError(err.message || 'Something went wrong.')
    }
  }

  async function loadHistory() {
    const res = await fetch('/api/search')
    const data = await res.json()
    setSearches(data.searches || [])
    setView('history')
  }

  async function loadSearch(searchId) {
    const res = await fetch(`/api/search?searchId=${searchId}`)
    const data = await res.json()
    setLeads(data.leads || [])
    setView('results')
  }

  function copyEmail(lead, idx) {
    navigator.clipboard.writeText(`Subject: ${lead.emailSubject}\n\n${lead.emailBody}`)
    setCopiedId(`${idx}`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const inputStyle = { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', fontFamily: 'Epilogue, sans-serif', fontSize: 13, padding: '10px 14px', outline: 'none', width: '100%' }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text)' }}>
      <header style={{ padding: '36px 48px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="font-syne" style={{ fontSize: 'clamp(28px,5vw,48px)', fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: '#fff' }}>
            Lead<span style={{ color: 'var(--accent)' }}>Scout</span>
          </h1>
          <p className="font-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            // AI-powered local prospect intelligence
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => { setView('form'); setLeads([]); setLogStep(-1) }} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>New Search</button>
          <button onClick={loadHistory} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>History</button>
        </div>
      </header>
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '44px 24px 80px' }}>
        {(view === 'form' || loading) && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 32 }}>
            <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Find me real leads</h2>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 28 }}>Tell me where you are and what you are selling — I will search the web for real local businesses and build full sales dossiers.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Your City</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Springfield, MO" disabled={loading} style={inputStyle} /></div>
              <div><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Number of Leads</label><select value={numLeads} onChange={e => setNumLeads(e.target.value)} disabled={loading} style={inputStyle}><option value="3">3 leads</option><option value="4">4 leads</option><option value="5">5 leads</option></select></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Target Industries</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{INDUSTRIES.map(ind => (<button key={ind.val} onClick={() => !loading && toggleIndustry(ind.val)} style={{ padding: '6px 14px', borderRadius: 100, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', border: '1px solid', background: selectedIndustries.includes(ind.val) ? 'var(--accent)' : 'transparent', color: selectedIndustries.includes(ind.val) ? 'var(--bg)' : 'var(--muted)' }}>{ind.label}</button>))}</div></div>
              <div><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Company Size</label><select value={companySize} onChange={e => setCompanySize(e.target.value)} disabled={loading} style={inputStyle}><option value="small (under 20 employees)">Small (under 20)</option><option value="small-to-mid (10–50 employees)">Small-Mid (10–50)</option><option value="mid-size (50–200 employees)">Mid-size (50–200)</option><option value="any size">Any size</option></select></div>
              <div><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>What AI Services Are You Selling?</label><input value={aiService} onChange={e => setAiService(e.target.value)} disabled={loading} style={inputStyle} /></div>
              <div style={{ gridColumn: '1 / -1' }}><label style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Extra Context (optional)</label><textarea value={extraContext} onChange={e => setExtraContext(e.target.value)} disabled={loading} placeholder="e.g. I specialize in document automation..." style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} /></div>
            </div>
            {error && <div style={{ color: '#ff8080', marginBottom: 16, fontSize: 13 }}>{error}</div>}
            {!loading ? (
              <button onClick={generate} style={{ width: '100%', padding: 16, background: 'var(--accent)', color: 'var(--bg)', border: 'none', borderRadius: 8, fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>Find Me Real Leads</button>
            ) : (
              <div style={{ padding: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.9 }}>
                {LOG_STEPS.map((step, i) => (<div key={i} style={{ color: i <= logStep ? 'var(--accent)' : 'var(--dimmed)' }}>{i <= logStep ? '→' : '·'} {step}</div>))}
              </div>
            )}
          </div>
        )}
        {view === 'results' && leads.length > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{leads.length} Leads Generated</h2>
              <button onClick={() => { setView('form'); setLeads([]); }} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>← New Search</button>
            </div>
            {leads.map((lead, idx) => (
              <div key={idx} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 24, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <div className="font-syne" style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{lead.name}</div>
                    <div className="font-mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.8 }}>
                      {lead.phone && <div>📞 {lead.phone}</div>}
                      {lead.address && <div>📍 {lead.address}</div>}
                      {lead.website && <div>🌐 {lead.website.replace(/^https?:///, '')}</div>}
                      {lead.keyContact && <div>👤 {lead.keyContact}{lead.keyContactTitle ? ' — ' + lead.keyContactTitle : ''}</div>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div className="font-syne" style={{ fontSize: 34, fontWeight: 800, color: tierColor(lead.tier), lineHeight: 1 }}>{lead.score}</div>
                    <div className="font-mono" style={{ fontSize: 9, color: 'var(--muted)' }}>/100</div>
                    <div className="font-mono" style={{ fontSize: 9, marginTop: 4, padding: '2px 8px', borderRadius: 3, display: 'inline-block', background: lead.tier === 'hot' ? 'var(--hot)' : lead.tier === 'warm' ? 'var(--warm)' : '#3b82f6', color: lead.tier === 'warm' ? '#000' : '#fff', textTransform: 'uppercase' }}>{tierLabel(lead.tier)}</div>
                  </div>
                </div>
                {lead.trigger && <div style={{ margin: '14px 20px 0', padding: '8px 12px', background: 'rgba(232,255,71,0.05)', border: '1px solid rgba(232,255,71,0.15)', borderRadius: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--accent)' }}>⚡ {lead.trigger}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginTop: lead.trigger ? 12 : 0 }}>
                  <div style={{ padding: '16px 20px', borderRight: '1px solid var(--border)' }}>
                    <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--dimmed)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>AI Pain Points</div>
                    {(lead.pains || []).slice(0, 3).map((pain, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: pain.severity === 'high' ? '#ff6b35' : pain.severity === 'med' ? '#e8c547' : '#3b82f6' }} />
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 500, color: '#e0e0e0' }}>{pain.title} <span style={{ display: 'inline-block', fontFamily: 'JetBrains Mono, monospace', fontSize: 8, padding: '1px 5px', borderRadius: 2, marginLeft: 4, verticalAlign: 'middle', textTransform: 'uppercase', background: pain.source === 'verified' ? '#163120' : '#2a2005', color: pain.source === 'verified' ? 'var(--verified)' : 'var(--inferred)', border: '1px solid ' + (pain.source === 'verified' ? '#1a4028' : '#3a2e0a') }}>{pain.source}</span></div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{pain.note}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '16px 20px' }}>
                    <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--dimmed)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Qualification Score</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(lead.scores || []).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--muted)', width: 90, flexShrink: 0 }}>{s.dim}</div>
                          <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 2, width: `${(s.pts / s.max) * 100}%`, background: lead.tier === 'hot' ? 'var(--hot)' : lead.tier === 'warm' ? 'var(--warm)' : '#3b82f6' }} /></div>
                          <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)', width: 32, textAlign: 'right' }}>{s.pts}/{s.max}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div className="font-mono" style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--dimmed)', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Cold Outreach Email</div>
                  <div className="font-mono" style={{ fontSize: 11, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 5, padding: '8px 12px', marginBottom: 10 }}>
                    <span style={{ color: 'var(--muted)', marginRight: 6 }}>Subject:</span>{lead.emailSubject}
                  </div>
                  <div style={{ fontSize: 13, color: '#bbb', lineHeight: 1.75, borderLeft: '2px solid var(--border)', paddingLeft: 14, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{lead.emailBody}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{lead.website && <a href={lead.website} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc', textDecoration: 'none' }}>{lead.website.replace(/^https?:\/\//, '')}</a>}</div>
                    <button onClick={() => copyEmail(lead, idx)} style={{ padding: '7px 18px', border: `1px solid ${copiedId === String(idx) ? 'var(--verified)' : 'var(--border)'}`, borderRadius: 5, background: 'transparent', color: copiedId === String(idx) ? 'var(--verified)' : 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>{copiedId === String(idx) ? '✓ Copied!' : 'Copy Email'}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {view === 'history' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="font-syne" style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Search History</h2>
              <button onClick={() => setView('form')} style={{ padding: '8px 18px', border: '1px solid var(--border)', borderRadius: 6, background: 'transparent', color: 'var(--muted)', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, cursor: 'pointer', textTransform: 'uppercase' }}>← Back</button>
            </div>
            {searches.length === 0 ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>No saved searches yet.</div> : searches.map((s, i) => (
              <div key={i} onClick={() => loadSearch(s.searchId)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '16px 20px', marginBottom: 12, cursor: 'pointer' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{s.city}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{(s.industries || []).join(' · ')} · {s.leadCount} leads</div>
              </div>
            ))}
          </div>
        )}
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } * { box-sizing: border-box; } .font-syne { font-family: 'Syne', sans-serif; } .font-mono { font-family: 'JetBrains Mono', monospace; }`}</style>
    </div>
  )
}
