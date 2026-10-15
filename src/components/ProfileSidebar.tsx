import React, { useState } from 'react';
import { Profile, LoaderType } from '../types/launcher';

interface ProfileSidebarProps {
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onAddProfile: () => void;
  onDeleteProfile: (id: string) => void;
  isRunning: boolean;
}

type FilterType = 'ALL' | LoaderType;

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile,
  isRunning,
}) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredProfiles = profiles.filter((p) => {
    if (filter === 'ALL') return true;
    return p.loader === filter;
  });

  return (
    <aside
      style={{
        borderRight: '3px solid var(--color-black)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--color-white)',
        minWidth: '320px',
        width: '320px',
      }}
    >
      <div
        style={{
          padding: '16px',
          borderBottom: '3px solid var(--color-black)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>01 // PROFILES</h3>
          <span className="mono-text tiny-text">[{profiles.length}]</span>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {(['ALL', 'VANILLA', 'FABRIC', 'NEOFORGE', 'FORGE'] as FilterType[]).map((ft) => (
            <button
              key={ft}
              type="button"
              className={`chip-filter ${filter === ft ? 'active' : ''}`}
              onClick={() => setFilter(ft)}
              disabled={isRunning}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      {/* Profile List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ul className="raw-list">
          {filteredProfiles.map((p) => {
            const isActive = p.id === activeProfileId;
            return (
              <li
                key={p.id}
                className={`raw-list-item ${isActive ? 'active' : ''}`}
                onClick={() => !isRunning && onSelectProfile(p.id)}
                style={{
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  borderBottom: '3px solid var(--color-black)',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  <span
                    className="tiny-text mono-text"
                    style={{ color: isActive ? 'var(--color-white)' : 'var(--color-black)' }}
                  >
                    {p.loader} // {p.gameVersion}
                  </span>
                </div>
                {isActive && <span className="mono-text">[ACTIVE]</span>}
              </li>
            );
          })}
          {filteredProfiles.length === 0 && (
            <li style={{ padding: '24px 16px', color: 'var(--color-disabled-text)' }}>
              NO PROFILES MATCH FILTER.
            </li>
          )}
        </ul>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          padding: '16px',
          borderTop: '3px solid var(--color-black)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <button
          type="button"
          className="btn-secondary btn-md"
          style={{ width: '100%' }}
          onClick={onAddProfile}
          disabled={isRunning}
        >
          + NEW INSTANCE
        </button>

        <button
          type="button"
          className="btn-destructive btn-md"
          style={{ width: '100%' }}
          onClick={() => onDeleteProfile(activeProfileId)}
          disabled={isRunning || profiles.length <= 1}
        >
          DELETE INSTANCE
        </button>
      </div>
    </aside>
  );
};
