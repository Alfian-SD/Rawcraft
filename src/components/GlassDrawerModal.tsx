import React, { useEffect, useState, useRef } from 'react';
import { ActiveView } from './NavigationRail';
import { Profile, GlobalSettings } from '../types/launcher';
import { EngineAndFilesTab } from './EngineAndFilesTab';
import { ModInstallerTab } from './ModInstallerTab';
import { InstanceConfigPanel } from './InstanceConfigPanel';

interface GlassDrawerModalProps {
  activeView: ActiveView;
  onClose: () => void;
  profile: Profile;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: () => void;
  onDeleteProfile: (id: string) => void;
  onUpdateProfile: (updated: Profile) => void;
  /** Open the CONFIGURE panel for a specific instance (Instance tab). */
  onOpenConfigure: (id: string) => void;
  settings: GlobalSettings;
  onUpdateSettings: (settings: GlobalSettings) => void;
  isRunning: boolean;
  logs: string[];
  onClearLogs: () => void;
  onTerminate: () => void;
}

export const GlassDrawerModal: React.FC<GlassDrawerModalProps> = ({
  activeView,
  onClose,
  profile,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
  onUpdateProfile,
  onOpenConfigure,
  settings,
  onUpdateSettings,
  isRunning,
  logs,
  onClearLogs,
  onTerminate,
}) => {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleCopyLogs = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(logs.join('\n'));
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  // Autofocus the first control only when the panel opens, never on prop identity changes.
  // `onClose` is an inline arrow upstream, so it must not be a dependency here or every
  // keystroke would re-run this and steal focus back to the first button.
  useEffect(() => {
    if (activeView === 'HERO') return;

    const timer = setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable && focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [activeView]);

  useEffect(() => {
    if (activeView === 'HERO') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeView, onClose]);

  if (activeView === 'HERO' || activeView === 'LOADER') return null;

  const getTitle = () => {
    switch (activeView) {
      case 'CONFIGURE':
        return 'KONFIGURASI INSTANCE';
      case 'MODS':
        return 'DAFTAR MOD // BERKAS INSTANCE LOKAL';
      case 'PROFILES':
        return 'PROFIL // PENGELOLA INSTANCE';
      case 'STORE':
        return 'INSTALASI MOD & ADDON // MODRINTH';
      case 'SETTINGS':
        return 'PENGATURAN // PREFERENSI GLOBAL';
      case 'CONSOLE':
        return 'KONSOL // LOG EKSEKUSI LANGSUNG';
      default:
        return 'PANEL';
    }
  };

  return (
    <div
      className={`drawer-overlay ${activeView === 'STORE' ? 'drawer-overlay-full' : ''} ${
        activeView === 'CONFIGURE' ? 'drawer-overlay-center' : ''
      }`}
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-modal-title"
        className={`drawer-dialog ${activeView === 'STORE' ? 'drawer-dialog-full' : ''} ${
          activeView === 'CONFIGURE' ? 'drawer-dialog-center' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '24px 32px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="20" height="20" viewBox="0 0 256 256" fill="none" role="img" aria-hidden="true">
                <polygon fill="currentColor" points="42,78 96,47 96,209 42,178" />
                <path fill="currentColor" fillOpacity="0.45" fillRule="evenodd" d="M 112 37 L 128 28 L 214 78 L 214 120 L 112 120 Z M 136 64 L 172 64 L 186 78 L 186 86 L 172 100 L 136 100 Z" />
                <polygon fill="currentColor" fillOpacity="0.7" points="136,136 214,136 214,178 128,228 128,172 164,136" />
              </svg>
            </div>
            <div>
              <h3 id="drawer-modal-title" style={{ fontSize: 'var(--type-h3)', fontWeight: 600, letterSpacing: '-0.01em', color: 'var(--text)', lineHeight: 1.25 }}>
                {getTitle()}
              </h3>
              <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                Profil Aktif: {profile.name} ({profile.id})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="glass-pill"
            aria-label="Tutup panel"
          >
            ✕ TUTUP
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: activeView === 'CONFIGURE' ? '20px 24px 24px 24px' : '32px',
          }}
        >
          {/* 1. CONFIGURE — focused instance popup (name, version, RAM, mods) */}
          {activeView === 'CONFIGURE' && (
            <InstanceConfigPanel
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              isRunning={isRunning}
            />
          )}

          {/* 2. MODS — full local file manager */}
          {activeView === 'MODS' && (
            <EngineAndFilesTab
              profile={profile}
              onUpdateProfile={onUpdateProfile}
              isRunning={isRunning}
            />
          )}

          {/* 2. PROFILES MANAGER */}
          {activeView === 'PROFILES' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="small-text">
                  Total Profil: {profiles.length}
                </span>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={onAddProfile}
                  disabled={isRunning}
                >
                  + BUAT PROFIL
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {profiles.map((p) => {
                  const isSelected = p.id === activeProfileId;
                  return (
                    <div
                      key={p.id}
                      className={`profile-item-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => onSelectProfile(p.id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--radius-sm)',
                            background: isSelected ? 'var(--accent)' : 'var(--bg-muted)',
                            color: isSelected ? 'var(--accent-contrast)' : 'var(--text-muted)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: 'var(--type-ui)',
                          }}
                        >
                          {p.loader[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 'var(--type-ui)', color: 'var(--text)' }}>{p.name}</div>
                          <div className="tiny-text" style={{ color: 'var(--text-muted)' }}>
                            Minecraft {p.gameVersion} • {p.loader} {p.loaderVersion || ''} • {p.maxRamMb}MB
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isSelected && (
                          <span
                            className="tiny-text"
                            style={{
                              color: 'var(--text)',
                              fontWeight: 500,
                              textTransform: 'uppercase',
                              padding: '2px 8px',
                              borderRadius: 'var(--radius-pill)',
                              background: 'var(--bg-muted)',
                            }}
                          >
                            AKTIF
                          </span>
                        )}
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenConfigure(p.id);
                          }}
                          aria-label={`Konfigurasi instance ${p.name}`}
                        >
                          KONFIGURASI
                        </button>
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            className="btn-destructive btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProfile(p.id);
                            }}
                            disabled={isRunning}
                          >
                            HAPUS
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. UNIFIED MOD & ADDON INSTALLER (MODRINTH + CURSEFORGE) */}
          {activeView === 'STORE' && (
            <ModInstallerTab profile={profile} isRunning={isRunning} />
          )}

          {/* 4. GLOBAL SETTINGS */}
          {activeView === 'SETTINGS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)' }}>PENGATURAN AKUN</h4>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`chip-filter ${settings.authMode !== 'MICROSOFT' ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ ...settings, authMode: 'OFFLINE' })}
                    disabled={isRunning}
                  >
                    MODE OFFLINE
                  </button>
                  <button
                    type="button"
                    className={`chip-filter ${settings.authMode === 'MICROSOFT' ? 'active' : ''}`}
                    onClick={() => onUpdateSettings({ ...settings, authMode: 'MICROSOFT' })}
                    disabled={isRunning}
                  >
                    MICROSOFT XBOX
                  </button>
                </div>

                <div>
                  <label className="input-label">NAMA PENGGUNA</label>
                  <input
                    className="input-field"
                    value={settings.username}
                    disabled={isRunning || settings.authMode === 'MICROSOFT'}
                    onChange={(e) => onUpdateSettings({ ...settings, username: e.target.value })}
                    placeholder="Nama Pemain"
                  />
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h4 style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)' }}>ANIMASI UI & PERFORMA</h4>
                    <div className="helper-text" style={{ maxWidth: '420px' }}>
                      Aktifkan transisi UI halus, partikel kabut lanskap, dan mikro-interaksi tombol. Nonaktifkan untuk menghemat daya GPU pada perangkat spesifikasi rendah.
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className={`chip-filter ${settings.animationsEnabled !== false ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ ...settings, animationsEnabled: true })}
                      disabled={isRunning}
                    >
                      ⚡ SEMUA EFEK
                    </button>
                    <button
                      type="button"
                      className={`chip-filter ${settings.animationsEnabled === false ? 'active' : ''}`}
                      onClick={() => onUpdateSettings({ ...settings, animationsEnabled: false })}
                      disabled={isRunning}
                    >
                      🔋 HEMAT DAYA (MATI)
                    </button>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h4 style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)' }}>RUNTIME JAVA</h4>
                <div>
                  <label className="input-label">JALUR CUSTOM JAVA EXECUTABLE</label>
                  <input
                    className="input-field mono-text"
                    value={settings.javaPath}
                    disabled={isRunning}
                    onChange={(e) => onUpdateSettings({ ...settings, javaPath: e.target.value })}
                    placeholder="Contoh: C:\Program Files\Java\bin\java.exe"
                  />
                  <div className="helper-text">
                    Biarkan 'java' untuk deteksi otomatis Java sistem atau unduhan otomatis JRE Eclipse Adoptium.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. LIVE CONSOLE LOGS */}
          {activeView === 'CONSOLE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
                  Aliran Output SSE // {isRunning ? 'STATUS: BERJALAN' : 'STATUS: SIAGA'}
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={handleCopyLogs}
                    title="Salin seluruh log konsol ke papan klip"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>{copied ? '✓ DISALIN!' : 'SALIN LOG'}</span>
                  </button>
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={onClearLogs}
                  >
                    BERSIHKAN
                  </button>
                  {isRunning && (
                    <button
                      type="button"
                      className="btn-destructive btn-sm"
                      onClick={onTerminate}
                    >
                      HENTIKAN KLIEN
                    </button>
                  )}
                </div>
              </div>

              <div
                style={{
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-card)',
                  padding: '16px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--type-caption)',
                  lineHeight: 1.6,
                  height: '420px',
                  overflowY: 'auto',
                  color: 'var(--text)',
                }}
              >
                {logs.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>Log masih kosong. Jalankan permainan untuk melihat output eksekusi.</div>
                ) : (
                  logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="console-log-line"
                      style={{
                        color: log.includes('/ERROR')
                          ? 'var(--error)'
                          : log.includes('/WARN')
                          ? 'var(--warning)'
                          : log.includes('/LOADER') || log.includes('/NET')
                          ? 'var(--text)'
                          : 'var(--text-muted)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
