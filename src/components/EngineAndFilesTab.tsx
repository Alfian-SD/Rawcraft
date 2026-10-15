import React, { useState, useEffect } from 'react';
import { Profile, LoaderType } from '../types/launcher';
import { validateRam } from '../utils/buildCommand';
import {
  fetchInstanceFiles,
  toggleInstanceFile,
  InstanceFile,
} from '../api/instanceClient';

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

  const isVanilla = profile.loader === 'VANILLA';
  const isRamValid = validateRam(profile.maxRamMb);

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

  const handleRamChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    onUpdateProfile({
      ...profile,
      maxRamMb: isNaN(val) ? 0 : val,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Instance Settings Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label className="input-label">INSTANCE NAME</label>
          <input
            className="input-field"
            value={profile.name}
            disabled={isRunning}
            onChange={(e) => onUpdateProfile({ ...profile, name: e.target.value })}
            placeholder="Instance Name"
          />
        </div>

        <div>
          <label className="input-label">GAME DIRECTORY</label>
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
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ marginBottom: '4px' }}>ENGINE // LOADER</h4>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {(['VANILLA', 'FABRIC', 'QUILT', 'NEOFORGE', 'FORGE'] as LoaderType[]).map((ldr) => (
            <label
              key={ldr}
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
                checked={profile.loader === ldr}
                disabled={isRunning}
                onChange={() => handleLoaderChange(ldr)}
              />
              <span className="mono-text" style={{ fontSize: '13px', fontWeight: 600 }}>
                {ldr}
              </span>
            </label>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label className="input-label">GAME VERSION</label>
            <input
              className="input-field"
              value={profile.gameVersion}
              disabled={isRunning}
              onChange={(e) => onUpdateProfile({ ...profile, gameVersion: e.target.value })}
              placeholder="e.g. 1.21.4"
            />
          </div>

          <div>
            <label className="input-label">LOADER VERSION</label>
            <input
              className="input-field"
              value={profile.loaderVersion || ''}
              disabled={isRunning || isVanilla}
              onChange={(e) => onUpdateProfile({ ...profile, loaderVersion: e.target.value })}
              placeholder={isVanilla ? 'N/A' : 'e.g. 0.16.9'}
            />
          </div>
        </div>
      </div>

      {/* JVM Arguments & Memory Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ marginBottom: '4px' }}>JVM // MEMORY TUNER</h4>

        <div>
          <label className="input-label">MAX ALLOCATED RAM (MB)</label>
          <input
            type="number"
            className={`input-field ${!isRamValid ? 'error' : ''}`}
            value={profile.maxRamMb || ''}
            disabled={isRunning}
            onChange={(e) => handleRamChange(e.target.value)}
            placeholder="e.g. 4096"
          />
          {!isRamValid ? (
            <div className="helper-text error">
              ERROR: RAM must be a numeric integer between 1024 and 32768 MB.
            </div>
          ) : (
            <div className="helper-text">
              Heap allocation: -Xmx{profile.maxRamMb}M (Min 1024MB / Max 32768MB).
            </div>
          )}
        </div>

        <div>
          <label className="input-label">CUSTOM JVM FLAGS</label>
          <input
            className="input-field"
            value={profile.jvmFlags}
            disabled={isRunning}
            onChange={(e) => onUpdateProfile({ ...profile, jvmFlags: e.target.value })}
            placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled"
          />
          <div className="helper-text">Appended directly to the Java runtime arguments.</div>
        </div>
      </div>

      {/* Local File Manager Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>LOCAL FILES ON DISK</h4>
          <button
            type="button"
            className="btn-ghost"
            style={{ fontSize: '12px', padding: 0 }}
            onClick={loadFiles}
          >
            REFRESH DISK
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
              {sf.toUpperCase()}
            </button>
          ))}
        </div>

        {isVanilla && subfolder === 'mods' && (
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: 'var(--color-sunken)',
              border: '2px solid var(--color-black)',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            // NOTE: MOD LOADER BYPASSED IN VANILLA ENGINE.
          </div>
        )}

        {/* Disk File Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {diskFiles.map((file) => (
            <label
              key={file.fileName}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 10px',
                backgroundColor: 'var(--color-sunken)',
                border: '1px solid var(--color-black)',
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
                  fontSize: '13px',
                  color: isVanilla && subfolder === 'mods' ? 'var(--color-disabled-text)' : 'var(--color-black)',
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
                  color: file.enabled ? 'var(--color-success)' : 'var(--color-disabled-text)',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {file.enabled ? 'ACTIVE' : '.DISABLED'}
              </span>
            </label>
          ))}

          {!loadingFiles && diskFiles.length === 0 && (
            <div className="mono-text tiny-text" style={{ color: 'var(--color-disabled-text)', padding: '12px 0' }}>
              NO FILES FOUND IN /{subfolder.toUpperCase()} FOR THIS INSTANCE.
            </div>
          )}

          {loadingFiles && (
            <div className="mono-text tiny-text" style={{ padding: '8px 0' }}>
              READING INSTANCE FILES...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
