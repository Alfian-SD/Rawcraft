import React, { useState, useEffect } from 'react';
import { Profile, LoaderType } from '../types/launcher';
import {
  fetchInstanceFiles,
  toggleInstanceFile,
  detectJava,
  fetchMinecraftVersions,
  GameVersionItem,
  InstanceFile,
} from '../api/instanceClient';
import { FABRIC_LOADER_VERSIONS } from '../config/fabricVersions';

interface EngineAndFilesTabProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  isRunning: boolean;
}

type FileSubfolder = 'mods' | 'resourcepacks' | 'shaderpacks';

export const EngineAndFilesTab: React.FC<EngineAndFilesTabProps> = ({
  profile,
  onUpdateProfile,
  isRunning,
}) => {
  const [subfolder, setSubfolder] = useState<FileSubfolder>('mods');
  const [diskFiles, setDiskFiles] = useState<InstanceFile[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [detectedJava, setDetectedJava] = useState<{
    requiredVersion: number;
    detectedPath: string | null;
    source: string | null;
  } | null>(null);

  // Version Picker states
  const [mcVersions, setMcVersions] = useState<GameVersionItem[]>([]);
  const [loadingMc, setLoadingMc] = useState(false);
  const [mcFilterTab, setMcFilterTab] = useState<'release' | 'snapshot' | 'custom'>('release');

  const isVanilla = profile.loader === 'VANILLA';

  useEffect(() => {
    setLoadingMc(true);
    fetchMinecraftVersions().then((list) => {
      setMcVersions(list);
      setLoadingMc(false);
    });
  }, []);

  useEffect(() => {
    detectJava(profile.gameVersion).then((res) => setDetectedJava(res));
  }, [profile.gameVersion]);

  // Load disk files for current instance and subfolder
  const loadFiles = async () => {
    setLoadingFiles(true);
    const files = await fetchInstanceFiles(profile.id, subfolder);
    setDiskFiles(files);
    setLoadingFiles(false);
  };

  useEffect(() => {
    loadFiles();
  }, [profile.id, subfolder]);

  const handleToggleDiskFile = async (fileName: string) => {
    if (isRunning) return;
    const res = await toggleInstanceFile(profile.id, subfolder, fileName);
    if (res) {
      await loadFiles();
    }
  };

  const handleLoaderChange = (loader: LoaderType) => {
    onUpdateProfile({
      ...profile,
      loader,
    });
  };

  const RAM_PRESETS = [4096, 6144, 8192, 10240, 12288, 16384];

  const handleSetRam = (ramMb: number) => {
    if (isRunning) return;
    onUpdateProfile({
      ...profile,
      maxRamMb: ramMb,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Instance Settings Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="input-label">NAMA INSTANCE</label>
          <input
            className="input-field"
            value={profile.name}
            disabled={isRunning}
            onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
            placeholder="Nama Instance"
          />
        </div>

        <div>
          <label className="input-label">DIREKTORI GAME</label>
          <input
            className="input-field"
            value={profile.gameDir}
            disabled={isRunning}
            onChange={(e) => onUpdateProfile({ ...profile, gameDir: e.target.value })}
            placeholder="/instances/..."
          />
        </div>
      </div>

      {/* Engine & Loader Selection Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ marginBottom: '4px' }}>MESIN // LOADER</h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
          >
            <input
              type="radio"
              name="loader"
              className="raw-radio"
              checked={profile.loader === 'VANILLA'}
              disabled={isRunning}
              onChange={() => handleLoaderChange('VANILLA')}
            />
            <span className="mono-text" style={{ fontSize: 'var(--type-subtext)', fontWeight: 600 }}>
              VANILLA
            </span>
          </label>

          {profile.loader !== 'VANILLA' && (
            <span
              className="glass-pill"
              style={{
                fontSize: 'var(--type-caption)',
                color: 'var(--text-muted)',
              }}
            >
              MESIN PROFIL SAAT INI: {profile.loader}
            </span>
          )}
        </div>

        {/* Informative notice: Mod loaders belong to sidebar tabs */}
        <div
          style={{
            padding: '12px 14px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--type-caption)',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '3px' }}>
            TAB KHUSUS MOD LOADER
          </div>
          Mod loader (Fabric, Quilt, NeoForge, dan Forge) kini dikelola secara mandiri melalui tab masing-masing di sidebar. Menu konfigurasi ini hanya untuk profil Vanilla.
        </div>

        {/* Game Version & Loader Version Section with selection tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Game Version Selection Tab */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>VERSI GAME</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  type="button"
                  className={`chip-filter ${mcFilterTab === 'release' ? 'active' : ''}`}
                  onClick={() => setMcFilterTab('release')}
                  disabled={isRunning}
                >
                  RILIS RESMI
                </button>
                <button
                  type="button"
                  className={`chip-filter ${mcFilterTab === 'snapshot' ? 'active' : ''}`}
                  onClick={() => setMcFilterTab('snapshot')}
                  disabled={isRunning}
                >
                  SNAPSHOT
                </button>
                <button
                  type="button"
                  className={`chip-filter ${mcFilterTab === 'custom' ? 'active' : ''}`}
                  onClick={() => setMcFilterTab('custom')}
                  disabled={isRunning}
                >
                  KUSTOM
                </button>
              </div>
            </div>

            {mcFilterTab === 'custom' ? (
              <input
                className="input-field"
                value={profile.gameVersion}
                disabled={isRunning}
                onChange={(e) => onUpdateProfile({ ...profile, gameVersion: e.target.value })}
                placeholder="misal 26.3"
              />
            ) : (
              <select
                className="input-field"
                value={profile.gameVersion}
                disabled={isRunning || loadingMc}
                onChange={(e) => onUpdateProfile({ ...profile, gameVersion: e.target.value })}
              >
                {/* Fallback to current version option if not yet present in fetched list */}
                {profile.gameVersion &&
                  !mcVersions
                    .filter((v) => (mcFilterTab === 'release' ? v.type === 'release' : v.type === 'snapshot'))
                    .some((v) => v.id === profile.gameVersion) && (
                    <option value={profile.gameVersion}>
                      {profile.gameVersion} (Saat Ini)
                    </option>
                  )}
                {mcVersions
                  .filter((v) => (mcFilterTab === 'release' ? v.type === 'release' : v.type === 'snapshot'))
                  .map((v, idx) => (
                    <option key={v.id} value={v.id}>
                      {v.id} {idx === 0 ? `(Terbaru ${mcFilterTab === 'release' ? 'RILIS' : 'SNAPSHOT'})` : ''}
                    </option>
                  ))}
              </select>
            )}
            <div className="helper-text mono-text" style={{ fontSize: 'var(--type-caption)' }}>
              Dipilih: {profile.gameVersion || 'Tidak ada'} {loadingMc ? '(Memuat versi...)' : '(Terbaru ke terlama)'}
            </div>
          </div>

          {/* Loader Version */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="input-label" style={{ marginBottom: 0 }}>VERSI LOADER ({profile.loader})</label>
              {profile.loader === 'FABRIC' && (
                <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
                  {FABRIC_LOADER_VERSIONS.length} versi (0.1.0.48 – 0.20.0)
                </span>
              )}
            </div>

            {isVanilla ? (
              <input
                className="input-field"
                value=""
                disabled
                placeholder="T/A (Vanilla)"
              />
            ) : profile.loader === 'FABRIC' ? (
              <select
                className="input-field mono-text"
                value={profile.loaderVersion || '0.20.0'}
                disabled={isRunning}
                onChange={(e) => onUpdateProfile({ ...profile, loaderVersion: e.target.value })}
              >
                {FABRIC_LOADER_VERSIONS.map((lv, idx) => (
                  <option key={lv} value={lv}>
                    v{lv} {idx === 0 ? '(Paling Baru / 0.20.0)' : idx === FABRIC_LOADER_VERSIONS.length - 1 ? '(Versi Terawal / 0.1.0.48)' : ''}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="input-field mono-text"
                value={profile.loaderVersion || ''}
                disabled={isRunning}
                onChange={(e) => onUpdateProfile({ ...profile, loaderVersion: e.target.value })}
                placeholder="Otomatis / Bawaan"
              />
            )}
            <div className="helper-text mono-text" style={{ fontSize: 'var(--type-caption)' }}>
              {isVanilla
                ? 'Tidak memerlukan loader untuk Vanilla. Mod loader dikelola di tab loader pada sidebar.'
                : profile.loader === 'FABRIC'
                ? 'Daftar lengkap toolchain Fabric dari 0.1.0.48 hingga paling baru 0.20.0.'
                : `Profil ${profile.loader}. Kelola loader & mod di tab ${profile.loader} pada sidebar.`}
            </div>
          </div>
        </div>
      </div>

      {/* Simple RAM Allocation Card (No complicated JVM flags, fully automated) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0 }}>PENGATURAN MEMORI RAM</h4>
            <div className="helper-text" style={{ marginTop: '4px' }}>
              Atur alokasi memori RAM. Tuning JVM dan runtime Java dikelola 100% otomatis.
            </div>
          </div>
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
            {profile.maxRamMb >= 1024 ? `${(profile.maxRamMb / 1024).toFixed(0)} GB` : `${profile.maxRamMb} MB`} ({profile.maxRamMb} MB)
          </span>
        </div>

        {/* Preset Chips 4 - 16 GB */}
        <div>
          <label className="input-label" style={{ marginBottom: '8px' }}>
            PRESET ALOKASI CEPAT (4 - 16 GB)
          </label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {RAM_PRESETS.map((preset) => {
              const isSelected = profile.maxRamMb === preset;
              const gb = preset / 1024;
              return (
                <button
                  key={preset}
                  type="button"
                  className={`chip-filter ${isSelected ? 'active' : ''}`}
                  onClick={() => handleSetRam(preset)}
                  disabled={isRunning}
                  style={{
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 'var(--type-caption)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    minWidth: '78px',
                  }}
                >
                  <span className="telemetry-num" style={{ fontSize: 'var(--type-subtext)', fontWeight: 600 }}>
                    {gb} GB
                  </span>
                  <span className="tiny-text mono-text" style={{ fontSize: '10px', color: 'var(--text-faint)' }}>
                    {preset} MB
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Fine-Tuning Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
              GESER UNTUK PENYESUAIAN HALUS (512 MB STEP)
            </span>
            <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
              RENTANG: 4 GB — 16 GB
            </span>
          </div>
          <input
            type="range"
            min="4096"
            max="16384"
            step="512"
            value={Math.max(4096, Math.min(16384, profile.maxRamMb || 4096))}
            disabled={isRunning}
            onChange={(e) => handleSetRam(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: 'var(--accent)',
              cursor: isRunning ? 'not-allowed' : 'pointer',
            }}
            aria-label="Pengaturan alokasi memori RAM dalam MB"
          />
          <div className="helper-text mono-text" style={{ fontSize: 'var(--type-caption)', marginTop: '6px' }}>
            {profile.maxRamMb <= 4096
              ? 'Beban standar // Optimal untuk Minecraft vanilla atau penambahan mod ringan.'
              : profile.maxRamMb <= 6144
              ? 'Beban menengah // Cocok untuk instalasi mod sedang dan shaders ringan.'
              : profile.maxRamMb <= 8192
              ? 'Rekomendasi ideal // Performa paling stabil untuk modpack populer dan shaders kualitas tinggi.'
              : profile.maxRamMb <= 12288
              ? 'Beban berat // Kapasitas ekstra untuk modpack besar dengan 150+ mod.'
              : 'Kapasitas ekstrem // Dirancang untuk modpack raksasa (200-300+ mod) dan render distance jauh.'}
          </div>
        </div>

        {/* Automatic Engine Banner */}
        <div
          style={{
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--success)', fontSize: 'var(--type-caption)', fontWeight: 600 }}>⚡ OPTIMASI OTOMATIS:</span>
            <span className="tiny-text mono-text" style={{ color: 'var(--text)' }}>
              TUNING G1GC & RUNTIME AKTIF {detectedJava?.detectedPath ? `(${detectedJava.source || 'Sistem'})` : ''}
            </span>
          </div>
          <div className="tiny-text mono-text" style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Semua argumen JVM seperti pengumpul sampah performa tinggi (G1GC), alokasi heap dinamis, dan pemilihan direktori Java Adoptium/Sistem ({detectedJava?.detectedPath || 'Otomatis Adoptium JRE'}) ditangani 100% otomatis di balik layar. Anda tidak perlu menyetel parameter manual.
          </div>
        </div>
      </div>

      {/* Built-in RawCraft Client Mod Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0 }}>MOD KLIEN BAWAAN // RAWCRAFT CLIENT</h4>
            <div className="helper-text" style={{ marginTop: '4px' }}>
              Fitur ala Lunar Client: Native Click GUI (Right Shift), HUD Studio, 8 Telemetry Widget, dan Pengoptimalan Performa.
            </div>
          </div>
          <span
            className="tiny-text mono-text"
            style={{
              padding: '2px 8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600,
              color: profile.rawcraftClient !== false ? 'var(--success)' : 'var(--text-muted)',
            }}
          >
            {profile.rawcraftClient !== false ? 'AKTIF' : 'NONAKTIF'}
          </span>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            cursor: isRunning ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            type="checkbox"
            className="raw-checkbox"
            checked={profile.rawcraftClient !== false}
            disabled={isRunning}
            onChange={(e) => onUpdateProfile({ ...profile, rawcraftClient: e.target.checked })}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: 'var(--type-subtext)', fontWeight: 600, color: 'var(--text)' }}>
              Sematkan RawCraft Client ke Instance Ini
            </span>
            <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
              Menyediakan modul FPS, Ping, CPS, Armor Status, Keystrokes, Potion HUD, Fullbright, dan ToggleSprint saat bermain.
            </span>
          </div>
        </label>
      </div>

      {/* Local File Manager Card */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>BERKAS LOKAL DI PENYIMPANAN</h4>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={loadFiles}
          >
            SEGARKAN
          </button>
        </div>

        {/* Subfolder Filter Chips */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['mods', 'resourcepacks', 'shaderpacks'] as FileSubfolder[]).map((sf) => (
            <button
              key={sf}
              type="button"
              className={`chip-filter ${subfolder === sf ? 'active' : ''}`}
              onClick={() => setSubfolder(sf)}
            >
              {sf === 'mods' ? 'BERKAS MOD' : sf === 'resourcepacks' ? 'RESOURCE PACK' : 'SHADER'}
            </button>
          ))}
        </div>

        {isVanilla && subfolder === 'mods' && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(255, 189, 105, 0.12)',
              border: '1px solid rgba(255, 189, 105, 0.35)',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--type-caption)',
              color: 'var(--orange)',
              fontWeight: 600,
            }}
          >
            // CATATAN: MOD LOADER TIDAK AKTIF PADA MESIN VANILLA.
          </div>
        )}

        {/* Disk File Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {diskFiles.map((file) => (
            <label
              key={file.fileName}
              className="animated-card-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
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
                disabled={isRunning || (isVanilla && subfolder === 'mods')}
                onChange={() => handleToggleDiskFile(file.fileName)}
              />
              <span
                className="mono-text"
                style={{
                  fontSize: 'var(--type-subtext)',
                  color: isVanilla && subfolder === 'mods' ? 'var(--text-faint)' : 'var(--text)',
                  textDecoration: !file.enabled ? 'line-through' : 'none',
                  wordBreak: 'break-all',
                }}
              >
                {file.fileName}
              </span>
              <span
                className="tiny-text mono-text"
                style={{
                  marginLeft: 'auto',
                  color: file.enabled ? 'var(--success)' : 'var(--text-muted)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {file.enabled ? 'AKTIF' : '.NONAKTIF'}
              </span>
            </label>
          ))}

          {!loadingFiles && diskFiles.length === 0 && (
            <div className="mono-text tiny-text" style={{ color: 'var(--text-faint)', padding: '12px 0' }}>
              TIDAK ADA BERKAS DITEMUKAN DI /{subfolder.toUpperCase()} PADA INSTANCE INI.
            </div>
          )}

          {loadingFiles && (
            <div className="mono-text tiny-text" style={{ padding: '8px 0' }}>
              MEMBACA BERKAS INSTANCE...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
