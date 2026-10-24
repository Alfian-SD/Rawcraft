import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Profile } from '../types/launcher';
import {
  StoreCategory,
  StoreSort,
  StoreItem,
  searchStore,
  installStoreItem,
} from '../api/unifiedStore';
import { fetchMinecraftVersions } from '../api/instanceClient';
import { ModDetailView } from './ModDetailView';
import { ModIcon } from './ModIcon';

interface ModInstallerTabProps {
  profile: Profile;
  isRunning: boolean;
  onInstalled?: () => void;
}

const CATEGORIES: { id: StoreCategory; label: string }[] = [
  { id: 'mod', label: 'Mod' },
  { id: 'modpack', label: 'Modpack' },
  { id: 'resourcepack', label: 'Resource Pack' },
  { id: 'shader', label: 'Shader' },
];

const SORTS: { id: StoreSort; label: string }[] = [
  { id: 'trend', label: 'Sedang Trend' },
  { id: 'popular', label: 'Paling Populer' },
  { id: 'updated', label: 'Baru Diperbarui' },
  { id: 'relevance', label: 'Paling Relevan' },
];

const LOADERS = ['all', 'FABRIC', 'NEOFORGE', 'FORGE', 'QUILT'];
const MOD_LOADERS = new Set(['FABRIC', 'NEOFORGE', 'FORGE', 'QUILT']);

/** RAWCRAFT / VANILLA instances have no mod loader to filter by — fall back to "all". */
const effectiveLoader = (value: string) => (MOD_LOADERS.has(value) ? value : 'all');

const formatCount = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(n);
};

/** Arrow-key roving for radiogroup pill rows (WAI-ARIA radio pattern). */
const handleGroupKeys = (e: React.KeyboardEvent<HTMLDivElement>) => {
  const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const group = e.currentTarget;
  const radios = Array.from(group.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
  if (!radios.length) return;
  e.preventDefault();
  const current = radios.indexOf(document.activeElement as HTMLButtonElement);
  const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
  const next =
    e.key === 'Home'
      ? 0
      : e.key === 'End'
      ? radios.length - 1
      : forward
      ? (current + 1 + radios.length) % radios.length
      : (current - 1 + radios.length) % radios.length;
  radios[next].focus();
  radios[next].click();
};

export const ModInstallerTab: React.FC<ModInstallerTabProps> = ({ profile, isRunning, onInstalled }) => {
  const [category, setCategory] = useState<StoreCategory>('mod');
  const [sort, setSort] = useState<StoreSort>('trend');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [matchVersion, setMatchVersion] = useState(true);
  const [version, setVersion] = useState('all');
  const [loader, setLoader] = useState('all');

  const [items, setItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const [installing, setInstalling] = useState<Record<string, string>>({});
  const [installErrors, setInstallErrors] = useState<Record<string, string>>({});
  const [versions, setVersions] = useState<string[]>([]);
  const [detailItem, setDetailItem] = useState<StoreItem | null>(null);

  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    fetchMinecraftVersions().then((list) => {
      if (!cancelled) setVersions(list.filter((v) => v.type === 'release').map((v) => v.id));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const runSearch = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setErrors([]);
    try {
      const res = await searchStore({
        category,
        sort,
        query: submittedQuery,
        gameVersion: matchVersion ? profile.gameVersion : version,
        loader: matchVersion ? effectiveLoader(profile.loader) : loader,
      });
      if (requestId.current !== id) return;
      setItems(res.items);
      setErrors(res.errors);
    } catch (err) {
      if (requestId.current !== id) return;
      setErrors([err instanceof Error ? err.message : 'Pencarian gagal.']);
      setItems([]);
    } finally {
      if (requestId.current === id) setLoading(false);
    }
  }, [category, sort, submittedQuery, matchVersion, version, loader, profile.gameVersion, profile.loader]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  const handleInstall = async (item: StoreItem) => {
    if (isRunning) return;
    setInstalling((prev) => ({ ...prev, [item.id]: 'MENGUNDUH…' }));
    setInstallErrors((prev) => {
      const next = { ...prev };
      delete next[item.id];
      return next;
    });

    try {
      await installStoreItem(item, profile, { matchVersion, category });
      setInstalling((prev) => ({ ...prev, [item.id]: 'TERPASANG' }));
      onInstalled?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Pemasangan gagal.';
      setInstalling((prev) => ({ ...prev, [item.id]: 'GAGAL' }));
      setInstallErrors((prev) => ({ ...prev, [item.id]: msg }));
    }
  };

  const showVanillaWarning =
    profile.loader === 'VANILLA' && (category === 'mod' || category === 'modpack');

  if (detailItem) {
    return (
      <div className="mi">
        <div className="mi-orb mi-orb-a" aria-hidden="true" />
        <div className="mi-orb mi-orb-b" aria-hidden="true" />
        <ModDetailView
          item={detailItem}
          profile={profile}
          isRunning={isRunning}
          category={category}
          matchVersion={matchVersion}
          onBack={() => setDetailItem(null)}
          onInstalled={onInstalled}
        />
      </div>
    );
  }

  return (
    <div className="mi">
      <div className="mi-orb mi-orb-a" aria-hidden="true" />
      <div className="mi-orb mi-orb-b" aria-hidden="true" />

      <header className="mi-head">
        <div>
          <div className="mi-title-row">
            <span className="mi-tag">Store</span>
            <h4 className="mi-title">Instalasi Mod &amp; Addon</h4>
          </div>
          <p className="mi-sub">
            Cari dan pasang ribuan mod, modpack, resource pack, dan shader langsung dari Modrinth.
          </p>
        </div>
        <div className="mi-target">
          <span className="mi-live-dot" aria-hidden="true" />
          Target <b>{profile.name}</b> · {profile.loader}
        </div>
      </header>

      <div className="mi-panel">
        <div className="mi-panel-in">
          <div className="mi-row">
            <span className="mi-lbl">Kategori</span>
            <div className="mi-pills" role="radiogroup" aria-label="Kategori konten" onKeyDown={handleGroupKeys}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={category === c.id}
                  className={`mi-pill ${category === c.id ? 'on' : ''}`}
                  onClick={() => setCategory(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mi-row">
            <span className="mi-lbl">Urutan</span>
            <div className="mi-pills" role="radiogroup" aria-label="Urutan hasil" onKeyDown={handleGroupKeys}>
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={sort === s.id}
                  className={`mi-pill mi-sort ${sort === s.id ? 'on' : ''}`}
                  onClick={() => setSort(s.id)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mi-divider" aria-hidden="true" />

          <div className="mi-row">
            <button
              type="button"
              role="switch"
              aria-checked={matchVersion}
              className={`mi-toggle ${matchVersion ? 'on' : ''}`}
              onClick={() => setMatchVersion(!matchVersion)}
            >
              <span className="mi-sw" aria-hidden="true" />
              Sesuaikan versi instance
            </button>

            <label className="mi-field">
              <span>Versi</span>
              <select
                className="mi-select"
                value={matchVersion ? profile.gameVersion : version}
                disabled={matchVersion}
                onChange={(e) => setVersion(e.target.value)}
              >
                <option value="all">Semua versi</option>
                {(versions.length ? versions : [profile.gameVersion]).map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label className="mi-field">
              <span>Loader</span>
              <select
                className="mi-select"
                value={matchVersion ? effectiveLoader(profile.loader) : loader}
                disabled={matchVersion}
                onChange={(e) => setLoader(e.target.value)}
              >
                {LOADERS.map((l) => (
                  <option key={l} value={l}>
                    {l === 'all' ? 'Semua loader' : l}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <form
            className="mi-search"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittedQuery(query);
            }}
          >
            <div className="mi-input-wrap">
              <input
                className="mi-input"
                type="text"
                value={query}
                placeholder="Cari mod, shader, resource pack di Modrinth…"
                aria-label="Kata kunci pencarian mod"
                onChange={(e) => setQuery(e.target.value)}
              />
              <svg
                className="mi-input-icon"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="21" y2="21" />
              </svg>
            </div>
            <button type="submit" className="mi-btn-go" disabled={loading}>
              Cari
            </button>
          </form>
        </div>
      </div>

      {showVanillaWarning && (
        <div className="mi-notice mi-notice-warn" role="status">
          <span aria-hidden="true">⚠</span>
          <span>
            Instance ini masih Vanilla. Pilih instance Fabric, NeoForge, Forge, atau Quilt di sidebar untuk
            memasang mod.
          </span>
        </div>
      )}

      {errors.length > 0 && (
        <div className="mi-notice mi-notice-error" role="alert">
          <span>{errors.join(' · ')}</span>
          <button type="button" className="mi-pill" onClick={runSearch}>
            Coba lagi
          </button>
        </div>
      )}

      <div className="mi-results" aria-live="polite" aria-busy={loading}>
        {loading &&
          [0, 1, 2].map((i) => <div key={i} className="mi-skel" />)}

        {!loading && items.length === 0 && errors.length === 0 && (
          <div className="mi-empty">
            <strong>Tidak ada hasil.</strong>
            <span>
              Filter aktif: {matchVersion ? profile.gameVersion : version === 'all' ? 'semua versi' : version}
              {' · '}
              {matchVersion ? effectiveLoader(profile.loader) : loader}
              {' · '}
              {CATEGORIES.find((c) => c.id === category)?.label}
            </span>
            <span>Coba longgarkan filter versi/loader atau ganti kata kunci.</span>
            <div className="mi-empty-actions">
              {matchVersion && (
                <button type="button" className="mi-pill" onClick={() => setMatchVersion(false)}>
                  Matikan filter instance
                </button>
              )}
              <button
                type="button"
                className="mi-pill"
                onClick={() => {
                  setQuery('');
                  setSubmittedQuery('');
                }}
              >
                Reset pencarian
              </button>
            </div>
          </div>
        )}

        {!loading &&
          items.map((item, index) => {
            const status = installing[item.id];
            const srcCls = 'mr';
            return (
              <article
                key={item.id}
                className={`mi-card ${srcCls}`}
                style={{ animationDelay: `${Math.min(index, 5) * 80 + 140}ms` }}
                onClick={() => setDetailItem(item)}
              >
                <ModIcon src={item.iconUrl} title={item.title} size={46} className={`mi-icon ${srcCls}`} />

                <div className="mi-body">
                  <div className="mi-name-row">
                    <button
                      type="button"
                      className="mi-name mi-name-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDetailItem(item);
                      }}
                    >
                      {item.title}
                    </button>
                    <span className={`mi-badge ${srcCls}`}>Modrinth</span>
                    {item.loaderHints.slice(0, 2).map((l) => (
                      <span key={l} className="mi-badge mi-badge-loader">
                        {l}
                      </span>
                    ))}
                  </div>
                  <p className="mi-desc">{item.description}</p>
                  <div className="mi-stats">
                    <span>
                      <b>{formatCount(item.downloads)}</b> unduhan
                    </span>
                    {item.follows ? (
                      <span>
                        <b>{formatCount(item.follows)}</b> pengikut
                      </span>
                    ) : null}
                    <span>oleh {item.author}</span>
                  </div>
                  {installErrors[item.id] && (
                    <div className="mi-inline-error" role="alert">
                      ⚠ {installErrors[item.id]}
                    </div>
                  )}
                </div>

                {status === 'TERPASANG' ? (
                  <button type="button" className="mi-btn-install done" disabled>
                    <span className="mi-check">✓</span> Terpasang
                  </button>
                ) : status === 'MENGUNDUH…' ? (
                  <button type="button" className="mi-btn-install" disabled>
                    Memasang…
                  </button>
                ) : (
                  <button
                    type="button"
                    className={`mi-btn-install ${status === 'GAGAL' ? 'retry' : ''}`}
                    disabled={isRunning}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstall(item);
                    }}
                    title={status === 'GAGAL' ? 'Klik untuk coba pasang lagi' : undefined}
                  >
                    {status === 'GAGAL' ? 'Coba lagi' : 'Pasang'}
                  </button>
                )}
              </article>
            );
          })}
      </div>

      <div className="mi-foot">
        <span>Hasil diambil langsung dari API Modrinth.</span>
        <span>
          Sumber aktif:
          <span className="mi-chip-src">
            <i style={{ background: '#10C46A' }} aria-hidden="true" />
            Modrinth
          </span>
        </span>
      </div>
    </div>
  );
};
