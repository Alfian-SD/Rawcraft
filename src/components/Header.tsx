import React from 'react';
import { GlobalSettings } from '../types/launcher';

interface HeaderProps {
  settings: GlobalSettings;
  onUpdateSettings: (settings: GlobalSettings) => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ settings, onUpdateSettings, isRunning }) => {
  return (
    <header
      style={{
        borderBottom: '3px solid var(--color-black)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px' }}>
        <h2 style={{ fontSize: '28px', letterSpacing: '1px' }}>RAWCRAFT // LAUNCHER</h2>
        <span className="tiny-text mono-text" style={{ color: 'var(--color-disabled-text)' }}>
          v1.0.0-PROD
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            USER:
          </label>
          <input
            className="input-field"
            style={{ width: '160px', padding: '6px 10px', fontSize: '14px' }}
            value={settings.username}
            disabled={isRunning}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                username: e.target.value,
              })
            }
            placeholder="Username"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="chip-status active">JAVA // DETECTED</span>
          <span className="chip-status default">ARCH // 64-BIT</span>
          {isRunning ? (
            <span className="chip-status active">STATUS // RUNNING</span>
          ) : (
            <span className="chip-status default">STATUS // IDLE</span>
          )}
        </div>
      </div>
    </header>
  );
};
