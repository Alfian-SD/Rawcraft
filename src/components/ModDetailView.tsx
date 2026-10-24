import React, { useEffect, useMemo, useState } from 'react';
import { Profile } from '../types/launcher';
import {
  getModrinthProject,
  getModrinthVersions,
  getModrinthMembers,
  ModrinthProject,
  ModrinthVersion,
  ModrinthTeamMember,
} from '../api/modrinth';
import { installModrinthFile } from '../api/instanceClient';
import { StoreCategory, StoreItem } from '../api/unifiedStore';
import { renderMarkdown } from '../utils/markdown';
import { formatCount, formatBytes, sortGameVersions } from '../utils/storeFormat';
import { ModIcon } from './ModIcon';

interface ModDetailViewProps {
  item: StoreItem;
  profile: Profile;
  isRunning: boolean;
  category: StoreCategory;
  matchVersion: boolean;
  onBack: () => void;
  onInstalled?: () => void;
}

type DetailTab = 'DESCRIPTION' | 'CHANGELOG' | 'VERSIONS';

const MOD_LOADERS = new Set(['FABRIC', 'NEOFORGE', 'FORGE', 'QUILT']);

const formatDate = (iso: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const ModDetailView: React.FC<ModDetailViewProps> = ({
  item,
  profile,
  isRunning,
  category,
  matchVersion,
  onBack,
  onInstalled,
}) => {
  const [project, setProject] = useState<ModrinthProject | null>(null);
  const [versions, setVersions] = useState<ModrinthVersion[]>([]);
  const [members, setMembers] = useState<ModrinthTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<DetailTab>('DESCRIPTION');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [installing, setInstalling] = useState<string | null>(null);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installedVersionId, setInstalledVersionId] = useState<string | null>(null);

  const projectId = item.raw.modrinthHit.project_id;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setProject(null);
    setVersions([]);
    setMembers([]);
    setSelectedVersionId(null);
    setInstalledVersionId(null);
    setInstallError(null);
    setTab('DESCRIPTION');

    Promise.all([
      getModrinthProject(projectId),
      getModrinthVersions(projectId),
      getModrinthMembers(projectId),
    ])
      .then(([p, v, m]) => {
        if (cancelled) return;
        setProject(p);
        setVersions(v);
        setMembers(m);
        setSelectedVersionId(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat detail proyek.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId]);

  /** Version that the instance would actually accept, used as the default install target. */
  const recommended = useMemo(() => {
    if (!versions.length) return null;
    if (!matchVersion) return versions[0];
    const loader = MOD_LOADERS.has(profile.loader) ? profile.loader.toLowerCase() : null;
    const hit = versions.find(
      (v) =>
        v.game_versions.includes(profile.gameVersion) &&
        (!loader || v.loaders.includes(loader)) &&
        v.version_type === 'release'
    );
    return (
      hit ||
      versions.find(
        (v) => v.game_versions.includes(profile.gameVersion) && (!loader || v.loaders.includes(loader))
      ) ||
      versions[0]
    );
  }, [versions, matchVersion, profile.gameVersion, profile.loader]);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || recommended;

  const install = async (version: ModrinthVersion) => {
    if (isRunning) return;
    const file = version.files.find((f) => f.primary) || version.files[0];
    if (!file) {
      setInstallError('Rilis ini tidak menyediakan berkas unduhan.');
      return;
    }
    setInstalling(version.id);
    setInstallError(null);
    try {
      await installModrinthFile(profile.id, category, file.url, file.filename);
      setInstalledVersionId(version.id);
      onInstalled?.();
    } catch (err) {
      setInstallError(err instanceof Error ? err.message : 'Pemasangan gagal.');
    } finally {
      setInstalling(null);
    }
  };

  const siteUrl = project ? `https://modrinth.com/${project.project_type}/${project.slug}` : null;
  const compatVersions = sortGameVersions(project?.game_versions || []).slice(-14).reverse();

  const links = [
    project?.issues_url && { label: 'Laporkan masalah', url: project.issues_url },
    project?.source_url && { label: 'Kode sumber', url: project.source_url },
    project?.wiki_url && { label: 'Wiki / dokumentasi', url: project.wiki_url },
    project?.discord_url && { label: 'Discord', url: project.discord_url },
  ].filter(Boolean) as { label: string; url: string }[];

  return (
    <div className="md">
      <button type="button" className="md-back" onClick={onBack}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Kembali ke hasil pencarian
      </button>

      <header className="md-head">
        <ModIcon
          src={project?.icon_url ?? item.iconUrl}
          title={item.title}
          size={64}
          className="md-icon"
        />

        <div className="md-head-main">
          <h3 className="md-title">{project?.title || item.title}</h3>
          <p className="md-sub">{project?.description || item.description}</p>
          <div className="md-stats">
            <span>
              <b>{formatCount(project?.downloads ?? item.downloads)}</b> unduhan
            </span>
            <span>
              <b>{formatCount(project?.followers ?? item.follows ?? 0)}</b> pengikut
            </span>
            {(project?.categories || item.categories).slice(0, 2).map((c) => (
              <span key={c} className="md-chip">
                {c}
              </span>
            ))}
            {siteUrl && (
              <a className="md-chip md-chip-link" href={siteUrl} target="_blank" rel="noopener noreferrer">
                Modrinth ↗
              </a>
            )}
          </div>
        </div>

        <div className="md-actions">
          {installedVersionId && installedVersionId === selectedVersion?.id ? (
            <button type="button" className="md-btn-install done" disabled>
              ✓ Terpasang
            </button>
          ) : (
            <button
              type="button"
              className="md-btn-install"
              disabled={isRunning || loading || !selectedVersion || installing !== null}
              onClick={() => selectedVersion && install(selectedVersion)}
            >
              {installing ? 'Memasang…' : 'Pasang'}
            </button>
          )}
        </div>
      </header>

      {installError && (
        <div className="mi-notice mi-notice-error" role="alert">
          <span>{installError}</span>
        </div>
      )}

      <div className="md-tabs" role="tablist" aria-label="Bagian detail mod">
        {(
          [
            ['DESCRIPTION', 'Deskripsi'],
            ['CHANGELOG', 'Changelog'],
            ['VERSIONS', `Versi (${versions.length})`],
          ] as [DetailTab, string][]
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={`md-tab ${tab === id ? 'on' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="md-grid">
        <div className="md-main">
          {loading && [0, 1, 2].map((i) => <div key={i} className="mi-skel" />)}

          {!loading && error && (
            <div className="mi-empty">
              <strong>Detail gagal dimuat.</strong>
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && tab === 'DESCRIPTION' && (
            <article className="md-body">
              {project?.body?.trim() ? (
                renderMarkdown(project.body)
              ) : (
                <p className="md-p">Proyek ini belum menulis deskripsi panjang di Modrinth.</p>
              )}
            </article>
          )}

          {!loading && !error && tab === 'CHANGELOG' && (
            <article className="md-body">
              <div className="md-cl-head">
                <strong>{selectedVersion?.version_number || '—'}</strong>
                {selectedVersion && (
                  <span className={`md-type ${selectedVersion.version_type}`}>{selectedVersion.version_type}</span>
                )}
                <span className="md-muted">{formatDate(selectedVersion?.date_published || '')}</span>
              </div>
              {selectedVersion?.changelog?.trim() ? (
                renderMarkdown(selectedVersion.changelog)
              ) : (
                <p className="md-p">Rilis ini tidak menyertakan changelog.</p>
              )}
            </article>
          )}

          {!loading && !error && tab === 'VERSIONS' && (
            <div className="md-versions">
              {versions.length === 0 && (
                <div className="mi-empty">
                  <strong>Belum ada rilis.</strong>
                  <span>Proyek ini belum menerbitkan versi apa pun.</span>
                </div>
              )}
              {versions.slice(0, 40).map((v) => {
                const isRecommended = recommended?.id === v.id;
                const isSelected = (selectedVersionId ?? recommended?.id) === v.id;
                return (
                  <div
                    key={v.id}
                    className={`md-ver ${isSelected ? 'on' : ''}`}
                    onClick={() => setSelectedVersionId(v.id)}
                  >
                    <span className="md-ver-name">
                      {v.version_number}
                      {isRecommended && <span className="md-ver-tag">cocok</span>}
                    </span>
                    <span className={`md-type ${v.version_type}`}>{v.version_type}</span>
                    <span className="md-ver-meta">{v.game_versions.slice(0, 3).join(', ')}</span>
                    <span className="md-ver-meta">{v.loaders.join(' · ')}</span>
                    <span className="md-ver-meta">{formatDate(v.date_published)}</span>
                    <button
                      type="button"
                      className="md-ver-install"
                      disabled={isRunning || installing !== null}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVersionId(v.id);
                        install(v);
                      }}
                    >
                      {installedVersionId === v.id ? '✓ Terpasang' : installing === v.id ? 'Memasang…' : 'Pasang'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <aside className="md-side">
          <section className="md-card">
            <h4 className="md-card-title">Kompatibilitas</h4>
            <div className="md-card-sub">Minecraft: Java Edition</div>
            <div className="md-chips">
              {compatVersions.length ? (
                compatVersions.map((v) => (
                  <span key={v} className={`md-chip ${v === profile.gameVersion ? 'hot' : ''}`}>
                    {v}
                  </span>
                ))
              ) : (
                <span className="md-muted">—</span>
              )}
            </div>
            <div className="md-card-sub">Platform</div>
            <div className="md-chips">
              {(project?.loaders || []).map((l) => (
                <span key={l} className="md-chip">
                  {l}
                </span>
              ))}
            </div>
            <div className="md-card-sub">Lingkungan</div>
            <div className="md-chips">
              <span className="md-chip">Klien: {project?.client_side || '—'}</span>
              <span className="md-chip">Server: {project?.server_side || '—'}</span>
            </div>
          </section>

          {links.length > 0 && (
            <section className="md-card">
              <h4 className="md-card-title">Tautan</h4>
              <ul className="md-links">
                {links.map((l) => (
                  <li key={l.url}>
                    <a href={l.url} target="_blank" rel="noopener noreferrer">
                      {l.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="md-card">
            <h4 className="md-card-title">Tag</h4>
            <div className="md-chips">
              {[...(project?.categories || []), ...(project?.additional_categories || [])].map((c) => (
                <span key={c} className="md-chip">
                  {c}
                </span>
              ))}
            </div>
          </section>

          {members.length > 0 && (
            <section className="md-card">
              <h4 className="md-card-title">Kreator</h4>
              <ul className="md-members">
                {members.map((m) => (
                  <li key={m.username}>
                    <span className="md-avatar" aria-hidden="true">
                      {m.username.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <b>{m.username}</b>
                      <em>{m.role}</em>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="md-card">
            <h4 className="md-card-title">Detail</h4>
            <ul className="md-facts">
              <li>
                <span>Lisensi</span>
                <b>{project?.license?.name || '—'}</b>
              </li>
              <li>
                <span>Diterbitkan</span>
                <b>{formatDate(project?.published || '')}</b>
              </li>
              <li>
                <span>Diperbarui</span>
                <b>{formatDate(project?.updated || '')}</b>
              </li>
              <li>
                <span>Rilis terbaru</span>
                <b>{versions[0]?.version_number || '—'}</b>
              </li>
              <li>
                <span>Ukuran berkas</span>
                <b>
                  {versions[0]?.files[0] ? formatBytes(versions[0].files[0].size) : '—'}
                </b>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
};
