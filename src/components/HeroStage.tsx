import React from 'react';
import { Profile } from '../types/launcher';
import { VoxelHeroBackground } from './VoxelHeroBackground';

interface HeroStageProps {
  profile: Profile;
  isRunning: boolean;
  onLaunch: () => void;
  onTerminate: () => void;
  onOpenConfigure: () => void;
  onOpenMods: () => void;
  onOpenConsole: () => void;
  /** A right-side drawer is open; shrink the stage so the hero stays centered in view. */
  drawerOpen?: boolean;
}

export const HeroStage: React.FC<HeroStageProps> = ({
  profile,
  isRunning,
  onLaunch,
  onTerminate,
  onOpenConfigure,
  onOpenMods,
  onOpenConsole,
  drawerOpen = false,
}) => {
  // RAM allocation calculation (capped to 16GB gauge baseline)
  const ramPercent = Math.min(100, Math.round((profile.maxRamMb / 16384) * 100));
  const [copiedIp, setCopiedIp] = React.useState(false);

  const handleCopyIp = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('play.rawcraft.gg');
        setCopiedIp(true);
        setTimeout(() => setCopiedIp(false), 2000);
      }
    } catch {
      // Safe fallback if clipboard permissions denied
    }
  };

  const displayName = profile.name?.includes('//')
    ? profile.name.split('//')[0].trim()
    : profile.name || 'Klasik';

  return (
    <div
      className="hero-stage-shift"
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 40px 32px 40px',
        position: 'relative',
        marginRight: drawerOpen ? 'min(720px, 90vw)' : '0px',
        transition: 'margin-right var(--dur-base) var(--ease-out-expo)',
      }}
    >
      <style>{`
        @media (max-width: 900px) {
          .hero-stage-shift { margin-right: 0 !important; }
        }
      `}</style>
      {/* 2.5D Voxel Horizon Background (Twilight Ridge & Campfire) */}
      <VoxelHeroBackground />

      {/* Centered instance card */}
      <div
        key={profile.id}
        className="hero-content-stage"
        style={{
          margin: 'auto',
          width: '100%',
          maxWidth: '760px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '48px 0 40px 0',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onClick={onOpenConfigure}
          aria-label={`Konfigurasi instance: ${profile.loader} · ${profile.gameVersion}`}
          className="glass-pill"
          style={{ marginBottom: '24px' }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '2px',
              backgroundColor: 'var(--accent)',
            }}
          />
          <span style={{ color: 'var(--text)' }}>
            {profile.loader} · {profile.gameVersion}
          </span>
          <span style={{ color: 'var(--text-faint)' }}>stabil</span>
        </button>

        <h1 className="hero-title" style={{ marginBottom: '18px' }}>
          {displayName}
        </h1>

        <p
          style={{
            fontSize: '15px',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            marginBottom: '32px',
            maxWidth: '520px',
          }}
        >
          Minecraft {profile.gameVersion} dengan engine {profile.loader}. RAM {profile.maxRamMb}MB,
          tuning G1GC, siap dimodifikasi.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isRunning ? (
            <button
              type="button"
              className="btn-play btn-running"
              onClick={onTerminate}
              aria-label="Hentikan instance Minecraft yang sedang aktif"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="5" y="5" width="14" height="14" rx="1" />
              </svg>
              <span>Hentikan</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-play"
              onClick={() => onLaunch()}
              aria-label={`Luncurkan Minecraft ${profile.gameVersion}`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="6 4 20 12 6 20 6 4" />
              </svg>
              <span>Main</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div
        className="bento-deck"
        style={{
          maxWidth: '1100px',
          width: '100%',
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          type="button"
          className="bento-card"
          onClick={onOpenConsole}
          aria-label="Statistik waktu bermain. Buka konsol"
        >
          <div className="bento-card-top">
            <span className="bento-metric-lbl">Waktu bermain</span>
            <div className="bento-badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div>
            <div className="bento-metric-val">14.2 jam</div>
            <div className="bento-subtext">Streak 5 hari</div>
          </div>
        </button>

        <button
          type="button"
          className="bento-card"
          onClick={onOpenConfigure}
          aria-label={`Alokasi RAM: ${profile.maxRamMb} MB. Buka konfigurasi RAM`}
        >
          <div className="bento-card-top">
            <span className="bento-metric-lbl">Alokasi RAM</span>
            <div className="bento-badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="6" y1="8" x2="6" y2="12" />
                <line x1="10" y1="8" x2="10" y2="12" />
                <line x1="14" y1="8" x2="14" y2="12" />
                <line x1="18" y1="8" x2="18" y2="12" />
              </svg>
            </div>
          </div>
          <div>
            <div className="bento-metric-val">
              {profile.maxRamMb >= 1024 ? `${(profile.maxRamMb / 1024).toFixed(0)} GB` : `${profile.maxRamMb} MB`}
            </div>
            <div className="bento-gauge-track" style={{ marginTop: '8px' }}>
              <div className="bento-gauge-fill" style={{ width: `${ramPercent}%` }} />
            </div>
          </div>
        </button>

        <button
          type="button"
          className="bento-card"
          onClick={onOpenMods}
          aria-label={
            profile.loader === 'VANILLA'
              ? 'Profil Vanilla. Klik untuk melihat berkas instance'
              : `${profile.mods?.length || 0} mod terpasang. Buka pengelola mod`
          }
        >
          <div className="bento-card-top">
            <span className="bento-metric-lbl">{profile.loader === 'VANILLA' ? 'Engine mod' : 'Mod aktif'}</span>
            <div className="bento-badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </div>
          </div>
          <div>
            <div className="bento-metric-val">
              {profile.loader === 'VANILLA' ? 'Vanilla' : `${profile.mods?.length || 0} terpasang`}
            </div>
            <div className="bento-subtext">
              {profile.loader === 'VANILLA' ? 'Pilih loader untuk pasang mod' : 'Kelola berkas .jar'}
            </div>
          </div>
        </button>

        <button
          type="button"
          className="bento-card"
          onClick={handleCopyIp}
          aria-label={
            copiedIp
              ? 'Alamat server disalin ke papan klip'
              : 'Status server komunitas: play.rawcraft.gg dengan 2.973 pemain online. Klik untuk salin alamat'
          }
          title={copiedIp ? 'Alamat disalin ke papan klip!' : 'Klik untuk salin alamat server (play.rawcraft.gg)'}
        >
          <div className="bento-card-top">
            <span className="bento-metric-lbl">Realm komunitas</span>
            <div className="bento-badge-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
          </div>
          <div>
            <div className="bento-metric-val" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              {copiedIp ? 'IP tersalin' : '2.973 online'}
            </div>
            <div className="bento-subtext">play.rawcraft.gg</div>
          </div>
        </button>
      </div>

      {/* Footer row */}
      <footer
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1100px',
          width: '100%',
          margin: '24px auto 0 auto',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onClick={onOpenMods}
          className="btn-ghost btn-sm"
          aria-label="Buka daftar berkas mod dan resource pack"
        >
          <span>Daftar mod</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            type="button"
            onClick={onOpenConsole}
            className="btn-icon"
            aria-label="Buka Output Konsol"
            title="Buka Output Konsol"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="4 17 10 11 4 5" />
              <line x1="12" y1="19" x2="20" y2="19" />
            </svg>
          </button>

          <button
            type="button"
            className="btn-ghost btn-sm"
            aria-label="Komunitas Discord"
            title="Komunitas Discord"
          >
            <span>Discord</span>
          </button>

          <a
            href="https://minecraft.net"
            target="_blank"
            rel="noreferrer"
            className="btn-ghost btn-sm"
            aria-label="Kunjungi Situs Resmi Minecraft"
            style={{ textDecoration: 'none' }}
          >
            <span>Situs resmi</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
