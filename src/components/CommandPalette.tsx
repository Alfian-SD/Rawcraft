import React, { useState, useEffect, useRef } from 'react';
import { Profile, LoaderType } from '../types/launcher';
import { ActiveView } from './NavigationRail';
import { LOADERS_CONFIG } from '../config/loaders';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: Profile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onSelectView: (view: ActiveView) => void;
  onSelectLoader?: (loaderId: LoaderType) => void;
  onLaunch: () => void;
  isRunning: boolean;
  onToggleAnimations?: () => void;
  animationsEnabled?: boolean;
  isModLoaderContext?: boolean;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'ACTIONS' | 'PROFILES' | 'NAVIGATION';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onSelectView,
  onSelectLoader,
  onLaunch,
  isRunning,
  onToggleAnimations,
  animationsEnabled = true,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K / Cmd+K and Escape handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open
        }
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build command items
  const items: CommandItem[] = [
    // Primary Actions
    {
      id: 'action-launch',
      title: isRunning ? 'Hentikan Minecraft Aktif' : 'Luncurkan Profil Minecraft Aktif',
      subtitle: isRunning ? 'Kirim sinyal penghentian ke JVM' : 'Jalankan runner MCLC',
      category: 'ACTIONS',
      shortcut: '↵ Enter',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="6 4 20 12 6 20 6 4" />
        </svg>
      ),
      action: () => {
        onLaunch();
        onClose();
      },
    },
    {
      id: 'action-perf',
      title: animationsEnabled ? 'Nonaktifkan Animasi UI (Mode Performa)' : 'Aktifkan Animasi UI (Efek Ambient)',
      subtitle: 'Kurangi beban siklus CPU & GPU',
      category: 'ACTIONS',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      action: () => {
        if (onToggleAnimations) onToggleAnimations();
        onClose();
      },
    },

    // Navigation Views
    {
      id: 'nav-configure',
      title: 'Buka Konfigurasi Instance',
      subtitle: 'Atur alokasi RAM, runtime Java, dan argumen JVM',
      category: 'NAVIGATION',
      shortcut: 'C',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
        </svg>
      ),
      action: () => {
        onSelectView('CONFIGURE');
        onClose();
      },
    },
    {
      id: 'nav-mods',
      title: 'Buka Pengelola Mod Terpasang',
      subtitle: 'Periksa berkas .jar mod lokal dan aktifkan/nonaktifkan',
      category: 'NAVIGATION',
      shortcut: 'M',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
      action: () => {
        onSelectView('MODS');
        onClose();
      },
    },
    {
      id: 'nav-store',
      title: 'Pusat Instalasi Mod & Addon',
      subtitle: 'Cari & pasang mod, shader, dan resource pack 1-klik dari Modrinth',
      category: 'NAVIGATION' as const,
      shortcut: 'S',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      ),
      action: () => {
        onSelectView('STORE');
        onClose();
      },
    },
    {
      id: 'nav-console',
      title: 'Buka Log Konsol Langsung',
      subtitle: 'Pantau stdout Minecraft, peringatan, dan laporan crash secara real-time',
      category: 'NAVIGATION',
      shortcut: 'L',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      ),
      action: () => {
        onSelectView('CONSOLE');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      title: 'Buka Pengaturan Global',
      subtitle: 'Nama pemain, direktori Java, dan opsi autentikasi',
      category: 'NAVIGATION',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
      action: () => {
        onSelectView('SETTINGS');
        onClose();
      },
    },

    // Mod Loaders Navigation Tabs
    ...LOADERS_CONFIG.map((l) => ({
      id: `nav-loader-${l.slug}`,
      title: `Buka Instance & Mod ${l.name}`,
      subtitle: `${l.description} (Mendukung ${l.supportedVersions.length} versi)`,
      category: 'NAVIGATION' as const,
      icon: <span style={{ color: l.color, display: 'flex', alignItems: 'center' }}>{l.icon({ size: 15 })}</span>,
      action: () => {
        if (onSelectLoader) {
          onSelectLoader(l.id);
        } else {
          onSelectView('LOADER');
        }
        onClose();
      },
    })),

    // Profiles Switcher
    ...profiles.map((p) => ({
      id: `prof-${p.id}`,
      title: `Ganti Profil: ${p.name}`,
      subtitle: `${p.loader} · ${p.gameVersion} (${p.maxRamMb}MB RAM)${p.id === activeProfileId ? ' · Aktif' : ''}`,
      category: 'PROFILES' as const,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      action: () => {
        onSelectProfile(p.id);
        onClose();
      },
    })),
  ];

  // Filter items
  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    }
  };

  return (
    <div
      className="cmd-palette-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Palet Perintah"
    >
      <div className="cmd-palette-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Row */}
        <div className="cmd-palette-search-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--color-purple-light)' }}>
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className="cmd-palette-input"
            role="combobox"
            aria-expanded={filtered.length > 0}
            aria-autocomplete="list"
            aria-controls="cmd-palette-list"
            aria-activedescendant={filtered[selectedIndex]?.id || undefined}
            placeholder="Ketik perintah, ganti profil, atau cari aksi..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <span className="cmd-palette-kbd">ESC</span>
        </div>

        {/* Results List */}
        <div id="cmd-palette-list" className="cmd-palette-list" role="listbox" aria-label="Daftar Perintah">
          {filtered.length === 0 ? (
            <div style={{ padding: '28px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Tidak ada perintah yang cocok dengan "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => (
              <button
                key={item.id}
                id={item.id}
                type="button"
                role="option"
                aria-selected={idx === selectedIndex}
                className={`cmd-palette-item ${idx === selectedIndex ? 'selected' : ''}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div className="cmd-palette-item-left">
                  <div className="cmd-palette-item-icon">{item.icon}</div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)' }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.subtitle}</div>
                  </div>
                </div>

                {item.shortcut && <span className="cmd-palette-kbd">{item.shortcut}</span>}
              </button>
            ))
          )}
        </div>

        {/* Footer Helper */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-subtle)',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <span>↑↓ Navigasi</span>
            <span>↵ Pilih</span>
            <span>ESC Tutup</span>
          </div>
          <span>Tekan Ctrl+K untuk membuka kapan saja</span>
        </div>
      </div>
    </div>
  );
};
