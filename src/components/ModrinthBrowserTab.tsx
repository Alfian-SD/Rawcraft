import React, { useState, useEffect } from 'react';
import { Profile } from '../types/launcher';
import {
  searchModrinth,
  getLatestCompatibleVersionFile,
  ModrinthSearchResult,
} from '../api/modrinth';
import { installModrinthFile } from '../api/instanceClient';

interface ModrinthBrowserTabProps {
  profile: Profile;
  isRunning: boolean;
  onInstalled?: () => void;
}

type ProjectType = 'mod' | 'modpack' | 'resourcepack' | 'shader';

export const ModrinthBrowserTab: React.FC<ModrinthBrowserTabProps> = ({
  profile,
  isRunning,
  onInstalled,
}) => {
  const [projectType, setProjectType] = useState<ProjectType>('mod');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchVersion, setMatchVersion] = useState(true);
  const [results, setResults] = useState<ModrinthSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [installingMap, setInstallingMap] = useState<Record<string, string>>({});

  const isVanilla = profile.loader === 'VANILLA';
  const showVanillaWarning = isVanilla && (projectType === 'mod' || projectType === 'modpack');

  const executeSearch = async (queryText = searchQuery) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await searchModrinth({
        query: queryText,
        projectType,
        gameVersion: matchVersion ? profile.gameVersion : undefined,
        loader: matchVersion ? profile.loader : undefined,
        limit: 25,
      });
      setResults(res.hits);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Search failed';
      setErrorMsg(msg);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch();
  }, [projectType, matchVersion, profile.gameVersion, profile.loader]);

  const handleInstall = async (hit: ModrinthSearchResult) => {
    if (isRunning) return;
    setInstallingMap((prev) => ({ ...prev, [hit.project_id]: 'DOWNLOADING' }));

    try {
      const fileInfo = await getLatestCompatibleVersionFile({
        projectId: hit.project_id,
        gameVersion: matchVersion ? profile.gameVersion : undefined,
        loader: matchVersion ? profile.loader : undefined,
        projectType,
      });

      if (!fileInfo) {
        throw new Error('No compatible release file found for this version.');
      }

      await installModrinthFile(
        profile.id,
        projectType,
        fileInfo.url,
        fileInfo.filename
      );

      setInstallingMap((prev) => ({ ...prev, [hit.project_id]: 'INSTALLED' }));
      if (onInstalled) onInstalled();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Install failed';
      alert(`[INSTALL ERROR] ${msg}`);
      setInstallingMap((prev) => ({ ...prev, [hit.project_id]: 'FAILED' }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Category Filter Chips & Version Toggle */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['mod', 'modpack', 'resourcepack', 'shader'] as ProjectType[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`chip-filter ${projectType === cat ? 'active' : ''}`}
                onClick={() => setProjectType(cat)}
              >
                {cat.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`chip-filter ${matchVersion ? 'active' : ''}`}
            onClick={() => setMatchVersion(!matchVersion)}
            title="Scope search facets to active instance game version and mod loader"
          >
            MATCH INSTANCE VERSION: {matchVersion ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch();
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            className="input-field"
            placeholder="Search Modrinth (e.g. Sodium, Iris, Faithless)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary btn-md">
            SEARCH
          </button>
        </form>
      </div>

      {/* Vanilla Guardrail Banner */}
      {showVanillaWarning && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'var(--color-sunken)',
            border: '3px solid var(--color-warning)',
            fontFamily: 'var(--font-headline)',
            fontSize: '13px',
            color: 'var(--color-black)',
            letterSpacing: '1px',
          }}
        >
          // WARNING: ACTIVE ENGINE IS VANILLA. SWITCH ENGINE TO FABRIC/NEOFORGE/QUILT TO RUN MODS.
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            border: '3px solid var(--color-error)',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--color-error)',
          }}
        >
          // MODRINTH API ERROR: {errorMsg}
        </div>
      )}

      {/* Search Results List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading && (
          <div className="mono-text" style={{ padding: '24px', textAlign: 'center' }}>
            QUERYING MODRINTH REPOSITORY...
          </div>
        )}

        {!loading && results.length === 0 && !errorMsg && (
          <div className="card">
            <h4 style={{ marginBottom: '8px' }}>NO PROJECTS FOUND</h4>
            <p className="mono-text tiny-text" style={{ color: 'var(--color-disabled-text)' }}>
              No results found matching query and active version facets. Try turning off [MATCH INSTANCE VERSION].
            </p>
          </div>
        )}

        {!loading &&
          results.map((hit) => {
            const status = installingMap[hit.project_id];
            return (
              <div
                key={hit.project_id}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderBottom: '3px solid var(--color-black)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '20px', textTransform: 'uppercase' }}>
                      {hit.title}
                    </h4>
                    <span className="tiny-text mono-text" style={{ color: 'var(--color-disabled-text)' }}>
                      BY {hit.author.toUpperCase()} // DL: {hit.downloads.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    {status === 'DOWNLOADING' ? (
                      <span className="chip-status warning">DOWNLOADING...</span>
                    ) : status === 'INSTALLED' ? (
                      <span className="chip-status active">✓ INSTALLED</span>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary btn-sm"
                        disabled={isRunning}
                        onClick={() => handleInstall(hit)}
                      >
                        [+ INSTALL]
                      </button>
                    )}
                  </div>
                </div>

                <p className="body-text small-text" style={{ color: 'var(--color-black)' }}>
                  {hit.description}
                </p>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {hit.display_categories.map((c) => (
                    <span
                      key={c}
                      className="tiny-text mono-text"
                      style={{
                        padding: '2px 6px',
                        border: '1px solid var(--color-black)',
                        backgroundColor: 'var(--color-sunken)',
                      }}
                    >
                      {c.toUpperCase()}
                    </span>
                  ))}
                  {hit.latest_version && (
                    <span
                      className="tiny-text mono-text"
                      style={{
                        padding: '2px 6px',
                        border: '1px solid var(--color-black)',
                        backgroundColor: 'var(--color-sunken)',
                      }}
                    >
                      v{hit.latest_version}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
