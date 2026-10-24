import React, { useEffect, useState } from 'react';
import { Profile } from '../types/launcher';
import {
  fetchInstanceFiles,
  toggleInstanceFile,
  fetchMinecraftVersions,
  GameVersionItem,
  InstanceFile,
} from '../api/instanceClient';
import { FABRIC_LOADER_VERSIONS } from '../config/fabricVersions';

interface InstanceConfigPanelProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  isRunning: boolean;
}

const RAM_PRESETS = [4096, 6144, 8192, 10240, 12288, 16384];

/**
 * Focused instance config popup: name, game version, RAM, installed mods.
 * ponytail: no gameDir / JVM / resourcepack-shader editors here — add when
 * players actually need them in the popup instead of the MODS drawer.
 */
export const InstanceConfigPanel: React.FC<InstanceConfigPanelProps> = ({
  profile,
  onUpdateProfile,
  isRunning,
}) => {
  const [mcVersions, setMcVersions] = useState<GameVersionItem[]>([]);
  const [loadingMc, setLoadingMc] = useState(true);
  const [channel, setChannel] = useState<'release' | 'snapshot'>('release');
  const [mods, setMods] = useState<InstanceFile[]>([]);
  const [loadingMods, setLoadingMods] = useState(true);

  const isVanilla = profile.loader === 'VANILLA';

  useEffect(() => {
    fetchMinecraftVersions().then((list) => {
      setMcVersions(list);
      setLoadingMc(false);
    });
  }, []);

  useEffect(() => {
    let alive = true;
    setLoadingMods(true);
    fetchInstanceFiles(profile.id, 'mods').then((files) => {
      if (!alive) return;
      setMods(files);
      setLoadingMods(false);
    });
    return () => {
      alive = false;
    };
  }, [profile.id]);

  const patch = (next: Partial<Profile>) => {
    if (isRunning) return;
    onUpdateProfile({ ...profile, ...next });
  };

  const reloadMods = async () => {
    setLoadingMods(true);
    setMods(await fetchInstanceFiles(profile.id, 'mods'));
    setLoadingMods(false);
  };

  const toggleMod = async (fileName: string) => {
    if (isRunning) return;
    if (await toggleInstanceFile(profile.id, 'mods', fileName)) await reloadMods();
  };

  const visibleVersions = mcVersions.filter((v) => v.type === channel);
  const currentListed = visibleVersions.some((v) => v.id === profile.gameVersion);
  const enabledMods = mods.filter((m) => m.enabled).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* 1. Nama instance */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <label className="input-label" htmlFor="cfg-name">NAMA INSTANCE</label>
        <input
          id="cfg-name"
          className="input-field"
          value={profile.name}
          disabled={isRunning}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Nama Instance"
        />
        <span className="helper-text mono-text">
          {profile.loader} {profile.loaderVersion || ''} · {profile.id}
        </span>
      </div>

      {/* 2. Versi game (+ versi loader bila bukan vanilla) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <label className="input-label" htmlFor="cfg-version" style={{ marginBottom: 0 }}>VERSI GAME</label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              className={`chip-filter ${channel === 'release' ? 'active' : ''}`}
              onClick={() => setChannel('release')}
              disabled={isRunning}
            >
              RILIS
            </button>
            <button
              type="button"
              className={`chip-filter ${channel === 'snapshot' ? 'active' : ''}`}
              onClick={() => setChannel('snapshot')}
              disabled={isRunning}
            >
              SNAPSHOT
            </button>
          </div>
        </div>

        <select
          id="cfg-version"
          className="input-field mono-text"
          value={profile.gameVersion}
          disabled={isRunning || loadingMc}
          onChange={(e) => patch({ gameVersion: e.target.value })}
        >
          {!currentListed && (
            <option value={profile.gameVersion}>{profile.gameVersion} (Saat Ini)</option>
          )}
          {visibleVersions.map((v) => (
            <option key={v.id} value={v.id}>
              {v.id}
            </option>
          ))}
        </select>

        {!isVanilla && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="input-label" htmlFor="cfg-loader-version" style={{ marginBottom: 0 }}>
              VERSI LOADER ({profile.loader})
            </label>
            {profile.loader === 'FABRIC' ? (
              <select
                id="cfg-loader-version"
                className="input-field mono-text"
                value={profile.loaderVersion || FABRIC_LOADER_VERSIONS[0]}
                disabled={isRunning}
                onChange={(e) => patch({ loaderVersion: e.target.value })}
              >
                {FABRIC_LOADER_VERSIONS.map((lv) => (
                  <option key={lv} value={lv}>v{lv}</option>
                ))}
              </select>
            ) : (
              <input
                id="cfg-loader-version"
                className="input-field mono-text"
                value={profile.loaderVersion || ''}
                disabled={isRunning}
                onChange={(e) => patch({ loaderVersion: e.target.value })}
                placeholder="Otomatis / Bawaan"
              />
            )}
          </div>
        )}

        <span className="helper-text mono-text">
          {loadingMc ? 'MEMUAT DAFTAR VERSI...' : `${visibleVersions.length} versi tersedia · terbaru ke terlama`}
        </span>
      </div>

      {/* 3. RAM */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>ALOKASI RAM</label>
          <span
            className="telemetry-num"
            style={{
              padding: '4px 10px',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              fontSize: 'var(--type-subtext)',
              color: 'var(--text)',
            }}
          >
            {Math.round(profile.maxRamMb / 1024)} GB ({profile.maxRamMb} MB)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {RAM_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              className={`chip-filter ${profile.maxRamMb === preset ? 'active' : ''}`}
              onClick={() => patch({ maxRamMb: preset })}
              disabled={isRunning}
              style={{ minWidth: '72px', padding: '8px 12px', fontWeight: 600 }}
            >
              {preset / 1024} GB
            </button>
          ))}
        </div>

        <input
          type="range"
          min="4096"
          max="16384"
          step="512"
          value={Math.max(4096, Math.min(16384, profile.maxRamMb || 4096))}
          disabled={isRunning}
          onChange={(e) => patch({ maxRamMb: Number(e.target.value) })}
          style={{ width: '100%', accentColor: 'var(--accent)', cursor: isRunning ? 'not-allowed' : 'pointer' }}
          aria-label="Alokasi memori RAM dalam MB"
        />
        <span className="helper-text mono-text">RENTANG 4 GB — 16 GB · STEP 512 MB · JVM diatur otomatis</span>
      </div>

      {/* 4. Mod terinstal */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="input-label" style={{ marginBottom: 0 }}>
            MOD TERINSTAL ({enabledMods}/{mods.length})
          </label>
          <button type="button" className="btn-secondary btn-sm" onClick={reloadMods}>
            SEGARKAN
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
          {mods.map((file) => (
            <label
              key={file.fileName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: isRunning ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                className="raw-checkbox"
                checked={file.enabled}
                disabled={isRunning}
                onChange={() => toggleMod(file.fileName)}
              />
              <span
                className="mono-text"
                style={{
                  fontSize: 'var(--type-caption)',
                  color: 'var(--text)',
                  textDecoration: file.enabled ? 'none' : 'line-through',
                  wordBreak: 'break-all',
                }}
              >
                {file.fileName}
              </span>
            </label>
          ))}

          {!loadingMods && mods.length === 0 && (
            <div className="mono-text tiny-text" style={{ color: 'var(--text-faint)', padding: '10px 0' }}>
              TIDAK ADA MOD DI /MODS PADA INSTANCE INI.
            </div>
          )}

          {loadingMods && (
            <div className="mono-text tiny-text" style={{ color: 'var(--text-muted)', padding: '10px 0' }}>
              MEMBACA BERKAS MOD...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
