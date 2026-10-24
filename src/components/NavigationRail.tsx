import React from 'react';
import { ActiveView, LoaderType } from '../types/launcher';
import { LOADERS_CONFIG } from '../config/loaders';

export type { ActiveView };

interface NavigationRailProps {
  activeView: ActiveView;
  activeLoaderId?: LoaderType | null;
  onSelectView: (view: ActiveView) => void;
  onSelectLoader: (loaderId: LoaderType) => void;
  isRunning: boolean;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeView,
  activeLoaderId,
  onSelectView,
  onSelectLoader,
  isRunning,
}) => {
  return (
    <aside
      style={{
        width: '232px',
        height: '100%',
        backgroundColor: 'var(--bg-subtle)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px',
        zIndex: 20,
        flexShrink: 0,
      }}
    >
      {/* Brand */}
      <button
        type="button"
        onClick={() => onSelectView('HERO')}
        aria-label="RawCraft Launcher Home"
        className="nav-rail-logo"
        title="RawCraft Launcher Home"
        style={{
          width: '100%',
          height: 'auto',
          justifyContent: 'flex-start',
          gap: '10px',
          padding: '8px 10px',
          color: 'var(--accent)',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
          <polygon points="42,78 96,47 96,209 42,178" />
          <path
            fillRule="evenodd"
            d="M 112 37 L 128 28 L 214 78 L 214 120 L 112 120 Z M 136 64 L 172 64 L 186 78 L 186 86 L 172 100 L 136 100 Z"
          />
          <polygon points="136,136 214,136 214,178 128,228 128,172 164,136" />
        </svg>
        <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.01em', color: 'var(--text)' }}>RawCraft</span>
      </button>

      {/* Nav */}
      <nav
        aria-label="Navigasi Utama"
        className="nav-rail-capsule"
        style={{
          marginTop: '20px',
          maxHeight: 'calc(100vh - 140px)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <button
          type="button"
          className={`nav-rail-btn ${activeView === 'HERO' ? 'active' : ''}`}
          onClick={() => onSelectView('HERO')}
          aria-label="Beranda / Mode Permainan"
          aria-current={activeView === 'HERO' ? 'page' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="nav-rail-label">Beranda</span>
        </button>

        <button
          type="button"
          className={`nav-rail-btn ${activeView === 'PROFILES' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'PROFILES' ? 'HERO' : 'PROFILES')}
          aria-label="Daftar Profil & Instance"
          aria-current={activeView === 'PROFILES' ? 'page' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          <span className="nav-rail-label">Instance</span>
        </button>

        <button
          type="button"
          className={`nav-rail-btn ${activeView === 'STORE' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'STORE' ? 'HERO' : 'STORE')}
          aria-label="Pusat Instalasi Mod dan Addon"
          aria-current={activeView === 'STORE' ? 'page' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="nav-rail-label">Instal Mod</span>
        </button>

        <button
          type="button"
          className={`nav-rail-btn ${activeView === 'CONSOLE' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'CONSOLE' ? 'HERO' : 'CONSOLE')}
          aria-label="Log Terminal & Eksekusi Langsung"
          aria-current={activeView === 'CONSOLE' ? 'page' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <span className="nav-rail-label">Konsol</span>
        </button>

        <button
          type="button"
          className={`nav-rail-btn ${activeView === 'SETTINGS' ? 'active' : ''}`}
          onClick={() => onSelectView(activeView === 'SETTINGS' ? 'HERO' : 'SETTINGS')}
          aria-label="Pengaturan Global & Akun"
          aria-current={activeView === 'SETTINGS' ? 'page' : undefined}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="nav-rail-label">Pengaturan</span>
        </button>

        <div
          role="separator"
          aria-orientation="horizontal"
          style={{
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '12px 8px',
          }}
        />

        <div
          style={{
            padding: '0 10px 6px 10px',
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--text-faint)',
          }}
        >
          Mod loader
        </div>

        {LOADERS_CONFIG.map((loader) => {
          const isLoaderActive = activeView === 'LOADER' && activeLoaderId === loader.id;
          return (
            <button
              key={loader.id}
              type="button"
              className={`nav-rail-btn ${isLoaderActive ? 'active' : ''}`}
              onClick={() => onSelectLoader(loader.id)}
              aria-label={`Mod Loader ${loader.name} (${loader.tagline})`}
              aria-current={isLoaderActive ? 'page' : undefined}
              title={`Mod Loader ${loader.name} // ${loader.tagline}`}
            >
              {loader.icon({ size: 16 })}
              <span className="nav-rail-label">{loader.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Status */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}
        title={isRunning ? 'Minecraft Sedang Berjalan' : 'Klien Siaga'}
      >
        <span className={`status-dot ${isRunning ? 'running' : ''}`} />
        <span>{isRunning ? 'Berjalan' : 'Siaga'}</span>
      </div>
    </aside>
  );
};
