import React from 'react';
import { GlobalSettings, ProgressData, Profile } from '../types/launcher';

interface TopHeaderProps {
  settings: GlobalSettings;
  profile: Profile;
  isRunning: boolean;
  progress?: ProgressData | null;
  onOpenSettings: () => void;
  onOpenCommandPalette?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  profile,
  isRunning,
  progress,
  onOpenSettings,
  onOpenCommandPalette,
}) => {
  const username = settings.username || 'deadbound';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 40px',
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border)',
        zIndex: 10,
        position: 'relative',
        gap: '16px',
        flexShrink: 0,
      }}
    >
      {/* Left: online count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Sedang bermain</span>
        <span className="telemetry-num" style={{ fontSize: '13px', color: 'var(--text)' }}>
          2.973
        </span>
      </div>

      {/* Center: status / download */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          minWidth: '260px',
          justifyContent: 'center',
        }}
      >
        <span className={`status-dot ${isRunning ? 'running' : ''}`} />
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {progress && progress.percent > 0 ? (
            <>
              Mengunduh <span className="telemetry-num">{progress.percent}%</span>
            </>
          ) : isRunning ? (
            'Klien berjalan'
          ) : (
            `Siap · ${profile.name || 'Klasik'}`
          )}
        </span>
        {progress && progress.percent > 0 && (
          <div
            style={{
              width: '80px',
              height: '3px',
              borderRadius: '999px',
              backgroundColor: 'var(--bg-muted)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${progress.percent}%`,
                height: '100%',
                backgroundColor: 'var(--accent)',
                transition: 'width 0.2s ease',
              }}
            />
          </div>
        )}
      </div>

      {/* Right: search, profile, window controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="glass-pill"
          aria-label="Buka Palet Perintah (Ctrl+K)"
          title="Buka Palet Perintah (Ctrl+K)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span style={{ color: 'var(--text-muted)' }}>Cari</span>
          <span className="cmd-palette-kbd">Ctrl K</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="glass-pill"
          aria-label={`Profil pengguna: ${username}. Buka Pengaturan`}
          style={{ padding: '4px 12px 4px 4px' }}
        >
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--bg-muted)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {username.slice(0, 1)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text)' }}>{username}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
          <button type="button" className="window-ctrl-btn" aria-label="Minimalkan Launcher" title="Minimalkan">
            —
          </button>
          <button type="button" className="window-ctrl-btn" aria-label="Tutup Launcher" title="Tutup">
            ✕
          </button>
        </div>
      </div>
    </header>
  );
};
