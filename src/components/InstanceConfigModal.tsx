import React, { useEffect } from 'react';
import { Profile } from '../types/launcher';
import { InstanceConfigPanel } from './InstanceConfigPanel';

interface InstanceConfigModalProps {
  profile: Profile;
  onUpdateProfile: (updated: Profile) => void;
  onClose: () => void;
  isRunning: boolean;
}

/**
 * Config popup that stacks over whatever view is currently open.
 * Kept out of `activeView` on purpose: opening it must not swap the page
 * underneath (previously it replaced the Instance tab with the hero).
 */
export const InstanceConfigModal: React.FC<InstanceConfigModalProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  isRunning,
}) => {
  useEffect(() => {
    // Capture phase + stopImmediatePropagation so Escape closes only this popup,
    // not the drawer mounted underneath it (which also listens on window).
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onClose]);

  return (
    <div className="drawer-overlay drawer-overlay-center drawer-overlay-config" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="instance-config-title"
        className="drawer-dialog drawer-dialog-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h3
              id="instance-config-title"
              style={{
                fontSize: 'var(--type-h3)',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                color: 'var(--text)',
                lineHeight: 1.25,
              }}
            >
              KONFIGURASI INSTANCE
            </h3>
            <span className="tiny-text" style={{ color: 'var(--text-muted)' }}>
              Profil Aktif: {profile.name} ({profile.id})
            </span>
          </div>

          <button type="button" onClick={onClose} className="glass-pill" aria-label="Tutup konfigurasi">
            ✕ TUTUP
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px 24px' }}>
          <InstanceConfigPanel
            profile={profile}
            onUpdateProfile={onUpdateProfile}
            isRunning={isRunning}
          />
        </div>
      </div>
    </div>
  );
};
