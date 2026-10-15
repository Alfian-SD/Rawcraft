import React from 'react';
import { Profile, LoaderType, ModItem } from '../types/launcher';
import { validateRam } from '../utils/buildCommand';

interface ProfileConfigProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  isRunning: boolean;
}

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
  isRunning,
}) => {
  const isVanilla = profile.loader === 'VANILLA';
  const isRamValid = validateRam(profile.maxRamMb);

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

  const handleToggleMod = (index: number) => {
    if (isVanilla || isRunning) return;
    const updatedMods = profile.mods.map((m, idx) => {
      if (idx === index) {
        return { ...m, enabled: !m.enabled };
      }
      return m;
    });
    onUpdateProfile({
      ...profile,
      mods: updatedMods,
    });
  };

  const handleAddMod = (fileName: string) => {
    if (!fileName.trim()) return;
    const newMod: ModItem = {
      fileName: fileName.trim().endsWith('.jar') ? fileName.trim() : `${fileName.trim()}.jar`,
      enabled: true,
    };
    onUpdateProfile({
      ...profile,
      mods: [...profile.mods, newMod],
    });
  };

  return (
    <section
      style={{
        borderRight: '3px solid var(--color-black)',
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>02 // CONFIGURATION & MODULES</h3>
        <span className="mono-text tiny-text">ID: {profile.id}</span>
      </div>

      {/* Instance Metadata */}
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

      {/* Engine & Loader Selection */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h4 style={{ marginBottom: '4px' }}>ENGINE // LOADER</h4>
        
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {(['VANILLA', 'FABRIC', 'NEOFORGE'] as LoaderType[]).map((ldr) => (
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
              <span className="mono-text" style={{ fontSize: '14px', fontWeight: 600 }}>
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

      {/* JVM Arguments & Memory */}
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

      {/* Mod Modules Checklist */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{ marginBottom: '4px' }}>MOD MODULES (.JAR)</h4>
          <span className="mono-text tiny-text">
            [{profile.mods.filter((m) => m.enabled).length}/{profile.mods.length} ACTIVE]
          </span>
        </div>

        {isVanilla && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'var(--color-sunken)',
              border: '2px solid var(--color-black)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            // NOTE: MOD LOADER BYPASSED IN VANILLA ENGINE.
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {profile.mods.map((mod, idx) => (
            <label
              key={`${mod.fileName}-${idx}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 10px',
                backgroundColor: 'var(--color-sunken)',
                border: '1px solid var(--color-black)',
                cursor: isVanilla || isRunning ? 'not-allowed' : 'pointer',
              }}
            >
              <input
                type="checkbox"
                className="raw-checkbox"
                checked={mod.enabled && !isVanilla}
                disabled={isVanilla || isRunning}
                onChange={() => handleToggleMod(idx)}
              />
              <span
                className="mono-text"
                style={{
                  fontSize: '14px',
                  color: isVanilla ? 'var(--color-disabled-text)' : 'var(--color-black)',
                  textDecoration: !mod.enabled && !isVanilla ? 'line-through' : 'none',
                }}
              >
                {mod.fileName}
              </span>
              <span
                className="tiny-text mono-text"
                style={{
                  marginLeft: 'auto',
                  color:
                    isVanilla
                      ? 'var(--color-disabled-text)'
                      : mod.enabled
                      ? 'var(--color-success)'
                      : 'var(--color-disabled-text)',
                  fontWeight: 600,
                }}
              >
                {isVanilla ? 'BYPASSED' : mod.enabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </label>
          ))}

          {profile.mods.length === 0 && (
            <div className="mono-text tiny-text" style={{ color: 'var(--color-disabled-text)' }}>
              NO .JAR MODS INSTALLED IN /MODS DIRECTORY.
            </div>
          )}
        </div>

        {/* Add Mock Mod File Input */}
        {!isVanilla && !isRunning && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('newMod') as HTMLInputElement;
              if (input && input.value) {
                handleAddMod(input.value);
                input.value = '';
              }
            }}
            style={{ display: 'flex', gap: '8px', marginTop: '8px' }}
          >
            <input
              name="newMod"
              className="input-field"
              placeholder="e.g. sodium-fabric-0.6.0.jar"
              style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
            />
            <button type="submit" className="btn-secondary btn-sm">
              + ADD MOD
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
