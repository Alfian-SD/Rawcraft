import { useState } from 'react';

export default function App() {
  const [filter, setFilter] = useState('ALL');
  const [activeProfile, setActiveProfile] = useState('prof-1');
  const [radioVal, setRadioVal] = useState('FABRIC');
  const [checkboxVal, setCheckboxVal] = useState(true);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h1>RAWCRAFT // KITCHEN SINK</h1>
        <p className="mono-text" style={{ marginTop: '8px' }}>RAWBLOCK DESIGN SYSTEM COMPONENT VERIFICATION</p>
      </div>

      {/* Buttons */}
      <section className="card">
        <h2 style={{ marginBottom: '24px' }}>01 // BUTTONS</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <button className="btn-primary btn-lg">PRIMARY LG</button>
          <button className="btn-primary btn-md">PRIMARY MD</button>
          <button className="btn-primary btn-sm">PRIMARY SM</button>
          <button className="btn-primary btn-md" disabled>PRIMARY DIS</button>

          <button className="btn-secondary btn-md">SECONDARY</button>
          <button className="btn-secondary btn-md" disabled>SEC DIS</button>

          <button className="btn-destructive btn-md">DESTRUCTIVE</button>
          <button className="btn-destructive btn-md" disabled>DEST DIS</button>

          <button className="btn-ghost">GHOST LINK</button>
          <button className="btn-ghost" disabled>GHOST DIS</button>
        </div>
      </section>

      {/* Inputs & Labels */}
      <section className="card">
        <h2 style={{ marginBottom: '24px' }}>02 // INPUTS</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <label className="input-label">DEFAULT INPUT</label>
            <input className="input-field" placeholder="Space Mono 15px..." defaultValue="PlayerOne" />
            <div className="helper-text">Regular input with 3px border, expands to 5px on focus.</div>
          </div>
          <div>
            <label className="input-label">ERROR INPUT</label>
            <input className="input-field error" defaultValue="99999" />
            <div className="helper-text error">Error state: 3px solid #FF0000 border.</div>
          </div>
          <div>
            <label className="input-label">DISABLED INPUT</label>
            <input className="input-field" disabled defaultValue="Fixed System Param" />
            <div className="helper-text">Disabled state: #F5F5F5 bg, #CCCCCC border.</div>
          </div>
        </div>
      </section>

      {/* Chips */}
      <section className="card">
        <h2 style={{ marginBottom: '24px' }}>03 // CHIPS</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          {['ALL', 'VANILLA', 'FABRIC', 'FORGE'].map(f => (
            <span
              key={f}
              className={`chip-filter ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="chip-status active">ACTIVE // 008000</span>
          <span className="chip-status warning">WARN // FFA500</span>
          <span className="chip-status error">ERROR // FF0000</span>
          <span className="chip-status default">IDLE // 000000</span>
        </div>
      </section>

      {/* Selection Primitives (Checkboxes & Radios) */}
      <section className="card">
        <h2 style={{ marginBottom: '24px' }}>04 // CHECKBOX & RADIO</h2>
        <div style={{ display: 'flex', gap: '40px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>CHECKBOXES (0PX RADIUS)</h4>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                className="raw-checkbox"
                checked={checkboxVal}
                onChange={e => setCheckboxVal(e.target.checked)}
              />
              <span className="mono-text">sodium-fabric-0.6.0.jar</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'not-allowed' }}>
              <input type="checkbox" className="raw-checkbox" disabled checked />
              <span className="mono-text" style={{ color: '#888' }}>disabled-checked.jar</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'not-allowed' }}>
              <input type="checkbox" className="raw-checkbox" disabled />
              <span className="mono-text" style={{ color: '#888' }}>disabled-unchecked.jar</span>
            </label>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h4 style={{ marginBottom: '8px' }}>RADIOS (50% CIRCLE EXCEPTION)</h4>
            {['VANILLA', 'FABRIC', 'NEOFORGE'].map(eng => (
              <label key={eng} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="engine"
                  className="raw-radio"
                  checked={radioVal === eng}
                  onChange={() => setRadioVal(eng)}
                />
                <span className="mono-text">{eng}</span>
              </label>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'not-allowed' }}>
              <input type="radio" name="engine-dis" className="raw-radio" disabled checked />
              <span className="mono-text" style={{ color: '#888' }}>QUILT (DISABLED)</span>
            </label>
          </div>
        </div>
      </section>

      {/* Lists & Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <section className="card">
          <h3 style={{ marginBottom: '16px' }}>DEFAULT CARD (3PX BORDER)</h3>
          <ul className="raw-list">
            <li
              className={`raw-list-item ${activeProfile === 'prof-1' ? 'active' : ''}`}
              onClick={() => setActiveProfile('prof-1')}
            >
              <span>FABRIC // TECH-01</span>
              <span className="tiny-text">1.21.4</span>
            </li>
            <li
              className={`raw-list-item ${activeProfile === 'prof-2' ? 'active' : ''}`}
              onClick={() => setActiveProfile('prof-2')}
            >
              <span>VANILLA // SURVIVAL</span>
              <span className="tiny-text">1.21.4</span>
            </li>
            <li
              className={`raw-list-item ${activeProfile === 'prof-3' ? 'active' : ''}`}
              onClick={() => setActiveProfile('prof-3')}
            >
              <span>NEOFORGE // MODDED</span>
              <span className="tiny-text">1.20.1</span>
            </li>
          </ul>
        </section>

        <section className="card-elevated">
          <h3 style={{ marginBottom: '16px' }}>ELEVATED CARD (5PX BORDER)</h3>
          <p className="mono-text" style={{ marginBottom: '16px' }}>
            Command Preview / Priority Status
          </p>
          <div className="raw-tooltip">
            TOOLTIP: 0px radius, black fill, Space Mono 13px.
          </div>
        </section>
      </div>
    </div>
  );
}
