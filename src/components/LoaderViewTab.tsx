import React, { useState, useEffect } from 'react';
import { LoaderConfig } from '../config/loaders';
import { Profile, ModItem } from '../types/launcher';
import { useLoaderProfiles, SortOption, validateProfileName } from '../hooks/useLoaderProfiles';
import { launcherApi } from '../services/launcherApi';

interface LoaderViewTabProps {
  loader: LoaderConfig;
  profiles: Profile[];
  activeProfile: Profile;
  onSelectProfile: (id: string) => void;
  onAddProfile: (newProfile: Profile) => void;
  onUpdateProfile: (updatedProfile: Profile) => void;
  onDeleteProfile: (id: string) => void;
  onLaunch?: (profileToLaunch?: Profile) => void;
  onOpenConfigure?: (id: string) => void;
  onOpenStore?: () => void;
  isRunning: boolean;
}

export const LoaderViewTab: React.FC<LoaderViewTabProps> = ({
  loader,
  profiles,
  activeProfile,
  onSelectProfile,
  onAddProfile,
  onUpdateProfile,
  onDeleteProfile,
  onLaunch,
  onOpenConfigure,
  onOpenStore,
  isRunning,
}) => {
  // Toolbar states
  const [searchQuery, setSearchQuery] = useState('');
  const [versionFilter, setVersionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('lastPlayed');
  const [viewLayout, setViewLayout] = useState<'grid' | 'list'>('grid');

  // Modal & Selection states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);

  // New Mod modal states
  const [isAddingMod, setIsAddingMod] = useState(false);
  const [newModFileName, setNewModFileName] = useState('');

  // Keyboard Escape listener for modal dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreateOpen) setIsCreateOpen(false);
        else if (deleteConfirmId) setDeleteConfirmId(null);
        else if (isAddingMod) setIsAddingMod(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateOpen, deleteConfirmId, isAddingMod]);

  // Create Form states
  const [newName, setNewName] = useState(`${loader.name.toUpperCase()} // ${loader.defaultVersion}`);
  const [newVersion, setNewVersion] = useState(loader.defaultVersion);
  const [newLoaderVersion, setNewLoaderVersion] = useState(loader.defaultLoaderVersion || '');
  const [newRam, setNewRam] = useState(4096);

  // Decoupled filtering, searching, and sorting
  const { filteredProfiles, totalCount, totalMods, availableVersions } = useLoaderProfiles(
    profiles,
    loader.id,
    { searchQuery, gameVersion: versionFilter, sortBy }
  );

  // Determine currently selected instance for mods management
  const loaderProfiles = profiles.filter((p) => p && p.loader === loader.id);
  const selectedInstance =
    loaderProfiles.find((p) => p.id === selectedInstanceId) ||
    loaderProfiles.find((p) => p.id === activeProfile?.id) ||
    loaderProfiles[0] ||
    null;

  // Validation for new instance name
  const nameValidation = validateProfileName(newName, profiles);

  const handleOpenCreateModal = () => {
    let candidateName = `${loader.name.toUpperCase()} // ${loader.defaultVersion}`;
    let counter = 1;
    while (profiles.some((p) => p.name.trim().toLowerCase() === candidateName.toLowerCase())) {
      candidateName = `${loader.name.toUpperCase()} // ${loader.defaultVersion} (${counter})`;
      counter++;
    }
    setNewName(candidateName);
    setNewVersion(loader.defaultVersion);
    setNewLoaderVersion(loader.defaultLoaderVersion || '');
    setNewRam(4096);
    setIsCreateOpen(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameValidation.valid) return;

    const newId = `prof-${Date.now().toString().slice(-4)}`;
    const createdProfile: Profile = {
      id: newId,
      name: newName.trim(),
      gameVersion: newVersion,
      loader: loader.id,
      loaderVersion: newLoaderVersion.trim() || undefined,
      maxRamMb: newRam,
      jvmFlags: '-XX:+UseG1GC',
      gameDir: `/instances/${newId}`,
      mods: [],
      lastPlayed: Date.now(),
    };

    onAddProfile(createdProfile);
    setSelectedInstanceId(newId);
    setIsCreateOpen(false);
  };

  const handleDuplicateProfile = (target: Profile) => {
    let candidateName = `${target.name} - Copy`;
    let counter = 2;
    while (profiles.some((p) => p.name.trim().toLowerCase() === candidateName.toLowerCase())) {
      candidateName = `${target.name} - Copy ${counter}`;
      counter++;
    }

    const newId = `prof-${Date.now().toString().slice(-4)}`;
    const clonedProfile: Profile = {
      ...target,
      id: newId,
      name: candidateName,
      gameDir: `/instances/${newId}`,
      mods: target.mods ? target.mods.map((m) => ({ ...m })) : [],
      lastPlayed: Date.now(),
    };

    onAddProfile(clonedProfile);
    setSelectedInstanceId(newId);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    onDeleteProfile(deleteConfirmId);
    if (selectedInstanceId === deleteConfirmId) {
      setSelectedInstanceId(null);
    }
    setDeleteConfirmId(null);
  };

  // Mod management actions
  const handleToggleMod = async (mod: ModItem) => {
    if (!selectedInstance) return;
    const nextState = !mod.enabled;

    // Call service adapter
    await launcherApi.toggleFile(selectedInstance.id, 'mods', mod.fileName);

    // Update in-memory profile state
    const updatedMods = selectedInstance.mods.map((m) =>
      m.fileName === mod.fileName ? { ...m, enabled: nextState } : m
    );

    onUpdateProfile({
      ...selectedInstance,
      mods: updatedMods,
    });
  };

  const handleDeleteMod = (fileName: string) => {
    if (!selectedInstance) return;
    const updatedMods = selectedInstance.mods.filter((m) => m.fileName !== fileName);
    onUpdateProfile({
      ...selectedInstance,
      mods: updatedMods,
    });
  };

  const handleAddModConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance || !newModFileName.trim()) return;

    let sanitized = newModFileName.trim();
    if (!sanitized.endsWith('.jar')) {
      sanitized += '.jar';
    }

    const updatedMods = [
      ...selectedInstance.mods.filter((m) => m.fileName !== sanitized),
      { fileName: sanitized, enabled: true },
    ];

    onUpdateProfile({
      ...selectedInstance,
      mods: updatedMods,
    });

    setNewModFileName('');
    setIsAddingMod(false);
  };

  const profileToDelete = profiles.find((p) => p.id === deleteConfirmId);

  return (
    <div className="full-page-container" data-loader={loader.id}>
      {/* 1. HEADER */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-muted)',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text)',
                flexShrink: 0,
              }}
            >
              {loader.icon({ size: 28 })}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'var(--type-h2)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                  {loader.name.toUpperCase()}
                </h2>
                <span
                  className="tiny-text"
                  style={{
                    color: 'var(--text-muted)',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-pill)',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                  }}
                >
                  MOD LOADER
                </span>
                {loader.tagline && (
                  <span
                    className="tiny-text mono-text"
                    style={{
                      color: 'var(--text-faint)',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)',
                      fontWeight: 500,
                    }}
                  >
                    {loader.tagline}
                  </span>
                )}
              </div>
              <p className="small-text" style={{ marginTop: '6px', maxWidth: '640px' }}>
                {loader.description}
              </p>
              <div className="tiny-text mono-text" style={{ color: 'var(--text-muted)', marginTop: '6px' }}>
                Instance Aktif: <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{activeProfile?.name || 'Tidak ada'}</strong>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {onOpenStore && (
              <button
                type="button"
                className="btn-secondary btn-md"
                onClick={onOpenStore}
                title={`Buka Pusat Instalasi Mod untuk ${loader.name}`}
                aria-label={`Buka Pusat Instalasi Mod untuk ${loader.name}`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                <span>PUSAT INSTALASI MOD</span>
              </button>
            )}

            <button
              type="button"
              className="btn-primary btn-md"
              onClick={handleOpenCreateModal}
              disabled={isRunning}
              aria-label={`Buat instance ${loader.name}`}
            >
              + BUAT INSTANCE {loader.name.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Header Stats Bar */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="glass-pill">
            <span className="telemetry-num">{totalCount}</span>
            <span>TOTAL INSTANCE</span>
          </div>

          <div className="glass-pill">
            <span className="telemetry-num">{totalMods}</span>
            <span>MODS TERPASANG</span>
          </div>

          <div className="glass-pill">
            <span className="telemetry-num">{loader.supportedVersions.length}</span>
            <span>VERSI DIDUKUNG (<span className="telemetry-num">{loader.supportedVersions[loader.supportedVersions.length - 1]}</span> - <span className="telemetry-num">{loader.supportedVersions[0]}</span>)</span>
          </div>
        </div>
      </section>

      {/* 2. TOOLBAR (Search, Filter, Sort, Layout Toggle) */}
      <section
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="🔍 Cari nama instance atau versi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '40px' }}
              aria-label="Cari instance"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-faint)',
                  cursor: 'pointer',
                  fontSize: 'var(--type-caption)',
                }}
                aria-label="Bersihkan pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Version Filter */}
          <select
            className="input-field"
            value={versionFilter}
            onChange={(e) => setVersionFilter(e.target.value)}
            style={{ width: '180px', height: '40px' }}
            aria-label="Filter berdasarkan versi Minecraft"
          >
            <option value="ALL">Semua Versi MC</option>
            {availableVersions.length > 0
              ? availableVersions.map((v) => (
                  <option key={v} value={v}>
                    MC {v}
                  </option>
                ))
              : loader.supportedVersions.map((v) => (
                  <option key={v} value={v}>
                    MC {v}
                  </option>
                ))}
          </select>

          {/* Sort Option */}
          <select
            className="input-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            style={{ width: '200px', height: '40px' }}
            aria-label="Urutkan daftar instance"
          >
            <option value="lastPlayed">Terakhir Dimainkan</option>
            <option value="name">Nama (A - Z)</option>
            <option value="version">Versi MC (Terbaru)</option>
          </select>
        </div>

        {/* View Layout Switcher (Grid vs List) */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            className={`chip-filter ${viewLayout === 'grid' ? 'active' : ''}`}
            onClick={() => setViewLayout('grid')}
            aria-label="Tampilan kotak"
            title="Tampilan Kotak"
          >
            ⊞ KOTAK
          </button>
          <button
            type="button"
            className={`chip-filter ${viewLayout === 'list' ? 'active' : ''}`}
            onClick={() => setViewLayout('list')}
            aria-label="Tampilan baris"
            title="Tampilan Baris"
          >
            ☰ BARIS
          </button>
        </div>
      </section>

      {/* 3. DAFTAR INSTANCE / EMPTY STATE */}
      {totalCount === 0 ? (
        /* Empty State */
        <div
          className="card"
          style={{
            padding: '64px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px',
            borderStyle: 'dashed',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-muted)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loader.icon({ size: 32 })}
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--type-h3)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              BELUM ADA INSTANCE {loader.name.toUpperCase()}
            </h3>
            <p className="small-text" style={{ maxWidth: '480px' }}>
              Kamu belum memiliki profil untuk {loader.name}. Buat instance baru untuk mulai memasang
              mod dan memainkan Minecraft dengan toolchain {loader.name}.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary btn-md"
            style={{ marginTop: '8px' }}
            onClick={handleOpenCreateModal}
            disabled={isRunning}
          >
            + BUAT INSTANCE {loader.name.toUpperCase()}
          </button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        /* No Match for Current Filter */
        <div
          className="card"
          style={{
            padding: '48px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '12px',
            marginBottom: '32px',
          }}
        >
          <span style={{ fontSize: '28px' }}>🔍</span>
          <h4 style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            TIDAK ADA INSTANCE YANG COCOK
          </h4>
          <p className="small-text">
            Tidak ada instance {loader.name} yang cocok dengan pencarian &quot;{searchQuery}&quot; atau filter versi saat ini.
          </p>
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery('');
              setVersionFilter('ALL');
            }}
          >
            RESET FILTER
          </button>
        </div>
      ) : (
        /* Cards Container (Grid or List) */
        <div className={viewLayout === 'grid' ? 'instance-card-grid' : 'instance-card-list'} style={{ marginBottom: '32px' }}>
          {filteredProfiles.map((p) => {
            const isCurrentActive = p.id === activeProfile?.id;
            const isCurrentlySelected = p.id === selectedInstance?.id;

            return (
              <div
                key={p.id}
                className={`instance-card ${isCurrentlySelected ? 'selected' : ''}`}
                onClick={() => setSelectedInstanceId(p.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedInstanceId(p.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isCurrentlySelected}
                aria-label={`Instance ${p.name}, Minecraft ${p.gameVersion}`}
              >
                {/* Card Top / Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-muted)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: isCurrentActive ? 'var(--text)' : 'var(--text-muted)',
                      flexShrink: 0,
                    }}
                  >
                    {loader.icon({ size: 20 })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: 'var(--type-ui)', color: 'var(--text)', wordBreak: 'break-word' }}>
                        {p.name}
                      </span>
                      {isCurrentActive && (
                        <span className="chip-status active">AKTIF</span>
                      )}
                    </div>
                    <div className="tiny-text mono-text" style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      Minecraft {p.gameVersion} • {p.loader} {p.loaderVersion || ''}
                    </div>
                  </div>
                </div>

                {/* Metadata Row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: 'var(--type-caption)', color: 'var(--text-muted)' }}>
                  <span>💾 <span className="telemetry-num">{p.maxRamMb}</span>MB RAM</span>
                  <span>📦 <span className="telemetry-num">{p.mods ? p.mods.length : 0}</span> Mods</span>
                  <span>
                    ⏱ {p.lastPlayed ? <span className="telemetry-num">{new Date(p.lastPlayed).toLocaleDateString()}</span> : 'Belum pernah dimainkan'}
                  </span>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                  {isCurrentActive ? (
                    <button
                      type="button"
                      className="btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onLaunch) onLaunch(p);
                      }}
                      disabled={isRunning}
                    >
                      ▶ MAIN
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProfile(p.id);
                      }}
                      disabled={isRunning}
                    >
                      AKTIFKAN
                    </button>
                  )}

                  {onOpenConfigure && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenConfigure(p.id);
                      }}
                      title="Buka Konfigurasi Instance"
                    >
                      ⚙ CONFIG
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateProfile(p);
                    }}
                    disabled={isRunning}
                    title="Duplikat Instance ini"
                  >
                    ⎘ DUPLIKAT
                  </button>

                  {profiles.length > 1 && (
                    <button
                      type="button"
                      className="btn-destructive btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(p.id);
                      }}
                      disabled={isRunning}
                      title="Hapus Instance"
                    >
                      🗑 HAPUS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. BAGIAN MODS INSTANCE */}
      <section
        className="card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {selectedInstance ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  DAFTAR MOD // <span style={{ color: 'var(--text-muted)' }}>{selectedInstance.name}</span>
                </h3>
                <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
                  {selectedInstance.mods ? selectedInstance.mods.filter((m) => m.enabled).length : 0} aktif dari{' '}
                  {selectedInstance.mods ? selectedInstance.mods.length : 0} mod terpasang
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => setIsAddingMod(true)}
                  disabled={isRunning}
                >
                  + TAMBAH MOD
                </button>
              </div>
            </div>

            {/* Mod Items Table / List */}
            {selectedInstance.mods && selectedInstance.mods.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedInstance.mods.map((mod) => (
                  <div
                    key={mod.fileName}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <span className="mono-text" style={{ fontSize: 'var(--type-subtext)', color: mod.enabled ? 'var(--text)' : 'var(--text-muted)' }}>
                        {mod.fileName}
                      </span>
                      <span
                        className="tiny-text mono-text"
                        style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-pill)',
                          background: mod.enabled ? 'var(--bg-muted)' : 'transparent',
                          color: mod.enabled ? 'var(--text)' : 'var(--text-faint)',
                          border: `1px solid ${mod.enabled ? 'var(--border-strong)' : 'var(--border)'}`,
                        }}
                      >
                        {mod.enabled ? 'AKTIF' : 'NONAKTIF'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => handleToggleMod(mod)}
                        disabled={isRunning}
                      >
                        {mod.enabled ? 'NONAKTIFKAN' : 'AKTIFKAN'}
                      </button>
                      <button
                        type="button"
                        className="btn-destructive btn-sm"
                        onClick={() => handleDeleteMod(mod.fileName)}
                        disabled={isRunning}
                        title="Hapus mod dari instance ini"
                      >
                        HAPUS
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-card)',
                  border: '1px dashed var(--border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <p className="small-text" style={{ margin: 0 }}>
                  Belum ada mod di instance ini. Klik <strong>&quot;+ TAMBAH MOD&quot;</strong> atau unduh langsung dari Pusat Instalasi Mod.
                </p>
                {onOpenStore && (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={onOpenStore}
                  >
                    🛍 BUKA PUSAT INSTALASI MOD
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <p className="small-text">
              Pilih sebuah instance di atas untuk melihat dan mengelola daftar mod terpasang.
            </p>
          </div>
        )}
      </section>

      {/* 5. MODAL FLOW BUAT INSTANCE */}
      {isCreateOpen && (
        <div className="drawer-overlay" onClick={() => setIsCreateOpen(false)}>
          <div
            className="card"
            style={{
              width: '560px',
              maxWidth: '92vw',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-modal-title"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--text-muted)', display: 'inline-flex' }}>{loader.icon({ size: 20 })}</span>
                <h3 id="create-modal-title" style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
                  BUAT INSTANCE {loader.name.toUpperCase()} BARU
                </h3>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsCreateOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmCreate} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Nama Instance */}
              <div>
                <label className="input-label">NAMA INSTANCE (WAJIB, TIDAK BOLEH DUPLIKAT)</label>
                <input
                  type="text"
                  className="input-field"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Misal: Fabric Tech Adventures"
                  required
                />
                {!nameValidation.valid && (
                  <div className="helper-text error">
                    {nameValidation.error}
                  </div>
                )}
              </div>

              {/* Versi Minecraft */}
              <div>
                <label className="input-label">VERSI MINECRAFT (DIDUKUNG {loader.name.toUpperCase()})</label>
                <select
                  className="input-field"
                  value={newVersion}
                  onChange={(e) => {
                    const chosen = e.target.value;
                    setNewVersion(chosen);
                    setNewName(`${loader.name.toUpperCase()} // ${chosen}`);
                  }}
                >
                  {loader.supportedVersions.map((v) => (
                    <option key={v} value={v}>
                      Minecraft {v} {v === loader.defaultVersion ? '(Disarankan)' : ''}
                    </option>
                  ))}
                </select>
                <div className="helper-text">
                  Hanya versi yang didukung resmi oleh toolchain {loader.name}.
                </div>
              </div>

              {/* Versi Loader */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>
                    VERSI LOADER ({loader.name.toUpperCase()})
                  </label>
                  {loader.supportedLoaderVersions && loader.supportedLoaderVersions.length > 0 && (
                    <span className="tiny-text mono-text" style={{ color: 'var(--text-muted)' }}>
                      {loader.supportedLoaderVersions.length} versi (0.1.0.48 – 0.20.0)
                    </span>
                  )}
                </div>

                {loader.supportedLoaderVersions && loader.supportedLoaderVersions.length > 0 ? (
                  <select
                    className="input-field mono-text"
                    value={newLoaderVersion}
                    onChange={(e) => setNewLoaderVersion(e.target.value)}
                  >
                    {loader.supportedLoaderVersions.map((lv, idx) => (
                      <option key={lv} value={lv}>
                        v{lv} {idx === 0 ? '(Paling Baru / 0.20.0)' : idx === loader.supportedLoaderVersions!.length - 1 ? '(Versi Terawal / 0.1.0.48)' : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    className="input-field mono-text"
                    value={newLoaderVersion}
                    onChange={(e) => setNewLoaderVersion(e.target.value)}
                    placeholder="Bawaan / Terbaru"
                  />
                )}
                <div className="helper-text mono-text">
                  {loader.supportedLoaderVersions && loader.supportedLoaderVersions.length > 0
                    ? 'Daftar lengkap dari versi terawal 0.1.0.48 hingga paling baru 0.20.0.'
                    : `Versi toolchain ${loader.name} yang akan diunduh dan dipasang.`}
                </div>
              </div>

              {/* Alokasi RAM */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="input-label" style={{ marginBottom: 0 }}>ALOKASI MEMORI RAM</label>
                  <span className="telemetry-num" style={{ color: 'var(--text)' }}>
                    {newRam} MB ({(newRam / 1024).toFixed(1)} GB)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {[4096, 6144, 8192, 10240, 12288, 16384].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`chip-filter ${newRam === preset ? 'active' : ''}`}
                      onClick={() => setNewRam(preset)}
                    >
                      <span className="telemetry-num">{preset >= 1024 ? `${preset / 1024} GB` : `${preset} MB`}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="4096"
                  max="16384"
                  step="512"
                  value={newRam}
                  onChange={(e) => setNewRam(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                  aria-label="Alokasi memori RAM dalam MB"
                />
                <div className="helper-text mono-text" style={{ marginTop: '4px' }}>
                  {newRam <= 4096
                    ? 'Beban standar // Vanilla & modifikasi ringan.'
                    : newRam <= 6144
                    ? 'Beban menengah // Stabil untuk mod sedang dan shaders ringan.'
                    : newRam <= 8192
                    ? 'Rekomendasi ideal // Performa stabil untuk modpack besar dan shaders kompleks.'
                    : newRam <= 12288
                    ? 'Beban berat // Kapasitas ekstra untuk modpack besar dengan 150+ mod.'
                    : 'Kapasitas ekstrem // Alokasi tinggi untuk extreme modpacks dengan 250+ mod.'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsCreateOpen(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={!nameValidation.valid || isRunning}
                >
                  BUAT INSTANCE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL KONFIRMASI HAPUS */}
      {deleteConfirmId && profileToDelete && (
        <div className="drawer-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div
            className="card"
            style={{
              width: '460px',
              maxWidth: '92vw',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-confirm-title"
          >
            <h3 id="delete-confirm-title" style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--error)', letterSpacing: '-0.01em', marginBottom: '10px' }}>
              KONFIRMASI HAPUS INSTANCE
            </h3>
            <p className="small-text" style={{ color: 'var(--text)', lineHeight: 1.6, marginBottom: '20px' }}>
              Apakah kamu yakin ingin menghapus instance <strong>&quot;{profileToDelete.name}&quot;</strong>?
              Semua file mod dan konfigurasi lokal instance ini tidak akan dapat dikembalikan.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary btn-sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                BATAL
              </button>
              <button
                type="button"
                className="btn-destructive btn-sm"
                onClick={handleConfirmDelete}
                disabled={isRunning}
              >
                HAPUS INSTANCE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL TAMBAH MOD CEPAT */}
      {isAddingMod && selectedInstance && (
        <div className="drawer-overlay" onClick={() => setIsAddingMod(false)}>
          <div
            className="card"
            style={{
              width: '480px',
              maxWidth: '92vw',
              margin: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-mod-title"
          >
            <h3 id="add-mod-title" style={{ fontSize: 'var(--type-h4)', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em', marginBottom: '12px' }}>
              TAMBAH MOD // {selectedInstance.name}
            </h3>
            <form onSubmit={handleAddModConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="input-label">NAMA FILE MOD (.jar)</label>
                <input
                  type="text"
                  className="input-field mono-text"
                  value={newModFileName}
                  onChange={(e) => setNewModFileName(e.target.value)}
                  placeholder="e.g. sodium-fabric-0.6.0.jar"
                  required
                  autoFocus
                />
                <div className="helper-text">
                  Masukkan nama file mod .jar yang ingin didaftarkan ke instance ini.
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setIsAddingMod(false)}
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm"
                  disabled={!newModFileName.trim()}
                >
                  TAMBAH MOD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
