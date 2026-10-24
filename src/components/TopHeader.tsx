import React from 'react';
import { GlobalSettings } from '../types/launcher';

interface TopHeaderProps {
  settings: GlobalSettings;
  onOpenSettings: () => void;
  onOpenCommandPalette?: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  settings,
  onOpenSettings,
  onOpenCommandPalette,
  sidebarOpen,
  onToggleSidebar,
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
      {/* Left: sidebar toggle */}
      <button
        type="button"
        className="btn-icon"
        onClick={onToggleSidebar}
        aria-label={sidebarOpen ? 'Sembunyikan bilah samping' : 'Tampilkan bilah samping'}
        aria-expanded={sidebarOpen}
        aria-controls="nav-rail"
        title={sidebarOpen ? 'Sembunyikan bilah samping' : 'Tampilkan bilah samping'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <line x1="9" y1="4" x2="9" y2="20" />
        </svg>
      </button>

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
