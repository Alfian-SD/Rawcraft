import React, { useState } from 'react';
import { Profile } from '../types/launcher';
import { EngineAndFilesTab } from './EngineAndFilesTab';
import { ModInstallerTab } from './ModInstallerTab';

interface ProfileConfigProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  isRunning: boolean;
}

type TabType = 'ENGINE' | 'STORE';

export const ProfileConfig: React.FC<ProfileConfigProps> = ({
  profile,
  onUpdateProfile,
  isRunning,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('ENGINE');

  return (
    <section
      style={{
        borderRight: '3px solid var(--color-black)',
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: 'var(--color-white)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>02 // WORKSPACE TABS</h3>
        <span className="mono-text tiny-text">ID: {profile.id}</span>
      </div>

      {/* Top Tab Bar Filter Chips */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          className={`chip-filter ${activeTab === 'ENGINE' ? 'active' : ''}`}
          onClick={() => setActiveTab('ENGINE')}
        >
          [TAB A: ENGINE & LOCAL FILES]
        </button>
        <button
          type="button"
          className={`chip-filter ${activeTab === 'STORE' ? 'active' : ''}`}
          onClick={() => setActiveTab('STORE')}
        >
          [TAB B: MOD & ADDON STORE]
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'ENGINE' ? (
        <EngineAndFilesTab
          profile={profile}
          onUpdateProfile={onUpdateProfile}
          isRunning={isRunning}
        />
      ) : (
        <ModInstallerTab
          profile={profile}
          isRunning={isRunning}
        />
      )}
    </section>
  );
};
