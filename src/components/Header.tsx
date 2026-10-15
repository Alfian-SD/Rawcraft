import React from 'react';
import { GlobalSettings, AuthMode, ProgressData } from '../types/launcher';

interface HeaderProps {
  settings: GlobalSettings;
  onUpdateSettings: (settings: GlobalSettings) => void;
  isRunning: boolean;
  progress?: ProgressData | null;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  isRunning,
  progress,
}) => {
  const authMode: AuthMode = settings.authMode || 'OFFLINE';

  const renderAsciiProgress = (percent: number) => {
    const totalBars = 10;
    const filled = Math.min(10, Math.max(0, Math.round((percent / 100) * totalBars)));
    return `[${'█'.repeat(filled)}${'░'.repeat(totalBars - filled)}] ${percent}%`;
  };

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
        <h2 style={{ fontSize: '26px', letterSpacing: '1px' }}>RAWCRAFT // ENGINE</h2>
        <span className="tiny-text mono-text" style={{ color: 'var(--color-disabled-text)' }}>
          v2.0-MODRINTH
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {/* Auth Mode Toggle */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            type="button"
            className={`chip-filter ${authMode === 'OFFLINE' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ ...settings, authMode: 'OFFLINE' })}
            disabled={isRunning}
            style={{ fontSize: '10px' }}
          >
            OFFLINE [SK-MODE]
          </button>
          <button
            type="button"
            className={`chip-filter ${authMode === 'MICROSOFT' ? 'active' : ''}`}
            onClick={() => onUpdateSettings({ ...settings, authMode: 'MICROSOFT' })}
            disabled={isRunning}
            style={{ fontSize: '10px' }}
          >
            MICROSOFT
          </button>
        </div>

        {/* Username Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            USER:
          </label>
          <input
            className="input-field"
            style={{ width: '150px', padding: '6px 10px', fontSize: '14px' }}
            value={settings.username}
            disabled={isRunning || authMode === 'MICROSOFT'}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                username: e.target.value,
              })
            }
            placeholder={authMode === 'MICROSOFT' ? 'MS Account' : 'Username'}
          />
        </div>

        {/* ASCII Download Progress Bar */}
        {progress && progress.percent > 0 ? (
          <div
            style={{
              border: '2px solid var(--color-black)',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              backgroundColor: 'var(--color-sunken)',
            }}
          >
            DL: {renderAsciiProgress(progress.percent)}
          </div>
        ) : null}

        {/* Status Telemetry */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="chip-status active">JAVA // READY</span>
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
