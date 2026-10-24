import React from 'react';
import { LoaderType } from '../types/launcher';
import { FABRIC_LOADER_VERSIONS } from './fabricVersions';

export interface LoaderConfig {
  id: LoaderType;
  name: string;
  slug: string;
  color: string;
  badgeBg: string;
  icon: (props?: { size?: number }) => React.ReactElement;
  supportedVersions: string[];
  supportedLoaderVersions?: string[];
  defaultVersion: string;
  defaultLoaderVersion?: string;
  description: string;
  tagline: string;
}

/**
 * Single source of truth for mod loaders.
 * To add a new loader, simply append an entry here;
 * the sidebar, pages, version dropdowns, and routes will automatically reflect it.
 */
export const LOADERS_CONFIG: LoaderConfig[] = [
  {
    id: 'RAWCRAFT',
    name: 'RawCraft',
    slug: 'rawcraft',
    color: '#000000',
    badgeBg: 'rgba(0, 0, 0, 0.08)',
    description: 'Loader dan runtime khusus RawCraft yang teroptimisasi tinggi dengan modul bawaan, HUD Studio, dan ESC Menu terintegrasi.',
    tagline: 'High-Performance Dedicated Client Engine',
    defaultVersion: '26.2',
    defaultLoaderVersion: '1.0.0',
    supportedVersions: [
      '26.2',
      '26.3',
      '26.1',
      '26.0',
      '1.21.4',
      '1.21.3',
      '1.21.2',
      '1.21.1',
      '1.21',
      '1.20.6',
      '1.20.4',
      '1.20.1',
    ],
    icon: ({ size = 20 } = {}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="square"
        strokeLinejoin="miter"
        aria-hidden="true"
      >
        {/* Geometric RawCraft Client Emblem */}
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" strokeWidth="2" />
        <polyline points="2 8.5 12 15 22 8.5" strokeWidth="2" />
        <line x1="12" y1="15" x2="12" y2="22" strokeWidth="2" />
        <line x1="12" y1="2" x2="12" y2="7" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: 'FORGE',
    name: 'Forge',
    slug: 'forge',
    color: '#DF6E26',
    badgeBg: 'rgba(223, 110, 38, 0.15)',
    description: 'API modding Minecraft klasik dengan ekosistem mod historis terbesar di dunia modding.',
    tagline: 'Klasik & Ekosistem Terbesar',
    defaultVersion: '26.3',
    defaultLoaderVersion: 'latest',
    supportedVersions: [
      '26.3',
      '26.2',
      '26.1',
      '26.0',
      '1.21.4',
      '1.21.3',
      '1.21.2',
      '1.21.1',
      '1.21',
      '1.20.6',
      '1.20.5',
      '1.20.4',
      '1.20.3',
      '1.20.2',
      '1.20.1',
      '1.20',
      '1.19.4',
      '1.19.3',
      '1.19.2',
      '1.19.1',
      '1.19',
      '1.18.2',
      '1.18.1',
      '1.18',
      '1.17.1',
      '1.17',
      '1.16.5',
      '1.16.4',
      '1.16.3',
      '1.16.2',
      '1.16.1',
      '1.16',
      '1.15.2',
      '1.15.1',
      '1.15',
      '1.14.4',
      '1.14.3',
      '1.14.2',
      '1.14.1',
      '1.14',
      '1.13.2',
      '1.12.2',
      '1.12.1',
      '1.12',
      '1.11.2',
      '1.11',
      '1.10.2',
      '1.10',
      '1.9.4',
      '1.9',
      '1.8.9',
      '1.8.8',
      '1.8',
      '1.7.10',
      '1.7.2',
      '1.6.4',
      '1.6.2',
      '1.5.2',
      '1.4.7',
      '1.3.2',
      '1.2.5',
      '1.1',
    ],
    icon: ({ size = 20 } = {}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Anvil / Forge Hammer */}
        <path d="M4 6h16l-2 4H6L4 6z" />
        <path d="M9 10v4h6v-4" />
        <path d="M6 18h12v-4H6v4z" />
        <path d="M12 2v4" />
      </svg>
    ),
  },
  {
    id: 'NEOFORGE',
    name: 'NeoForge',
    slug: 'neoforge',
    color: '#E59B2A',
    badgeBg: 'rgba(229, 155, 42, 0.15)',
    description: 'Fork komunitas generasi baru dari Forge untuk versi modern Minecraft dengan stabilitas tinggi.',
    tagline: 'Modern & Berorientasi Komunitas',
    defaultVersion: '26.3',
    defaultLoaderVersion: 'latest',
    supportedVersions: [
      '26.3',
      '26.2',
      '26.1',
      '26.0',
      '1.21.4',
      '1.21.3',
      '1.21.2',
      '1.21.1',
      '1.21',
      '1.20.6',
      '1.20.5',
      '1.20.4',
      '1.20.3',
      '1.20.2',
      '1.20.1',
    ],
    icon: ({ size = 20 } = {}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Modern Flame / Dual Anvil */}
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    id: 'FABRIC',
    name: 'Fabric',
    slug: 'fabric',
    color: '#7C6CF0',
    badgeBg: 'rgba(124, 108, 240, 0.15)',
    description: 'Toolchain modular yang ringan dan sangat cepat untuk versi Minecraft modern.',
    tagline: 'Ringan, Cepat & Modular',
    defaultVersion: '26.3',
    defaultLoaderVersion: '0.20.0',
    supportedLoaderVersions: FABRIC_LOADER_VERSIONS,
    supportedVersions: [
      '26.3',
      '26.2',
      '26.1',
      '26.0',
      '1.21.4',
      '1.21.3',
      '1.21.2',
      '1.21.1',
      '1.21',
      '1.20.6',
      '1.20.5',
      '1.20.4',
      '1.20.3',
      '1.20.2',
      '1.20.1',
      '1.20',
      '1.19.4',
      '1.19.3',
      '1.19.2',
      '1.19.1',
      '1.19',
      '1.18.2',
      '1.18.1',
      '1.18',
      '1.17.1',
      '1.17',
      '1.16.5',
      '1.16.4',
      '1.16.3',
      '1.16.2',
      '1.16.1',
      '1.16',
      '1.15.2',
      '1.15.1',
      '1.15',
      '1.14.4',
      '1.14.3',
      '1.14.2',
      '1.14.1',
      '1.14',
    ],
    icon: ({ size = 20 } = {}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Woven Fabric Threads */}
        <path d="M4 4h16v16H4z" />
        <path d="M4 12h16" />
        <path d="M12 4v16" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'QUILT',
    name: 'Quilt',
    slug: 'quilt',
    color: '#C455D9',
    badgeBg: 'rgba(196, 85, 217, 0.15)',
    description: 'Mod loader berbasis komunitas terbuka dengan kompatibilitas bawaan mod Fabric.',
    tagline: 'Komunitas Terbuka & Kompatibel Fabric',
    defaultVersion: '26.3',
    defaultLoaderVersion: '0.27.0',
    supportedVersions: [
      '26.3',
      '26.2',
      '26.1',
      '26.0',
      '1.21.4',
      '1.21.3',
      '1.21.2',
      '1.21.1',
      '1.21',
      '1.20.6',
      '1.20.5',
      '1.20.4',
      '1.20.3',
      '1.20.2',
      '1.20.1',
      '1.20',
      '1.19.4',
      '1.19.3',
      '1.19.2',
      '1.19.1',
      '1.19',
      '1.18.2',
      '1.18.1',
      '1.18',
      '1.17.1',
      '1.17',
      '1.16.5',
      '1.16.4',
      '1.16.3',
      '1.16.2',
      '1.16.1',
      '1.16',
      '1.15.2',
      '1.15.1',
      '1.15',
      '1.14.4',
    ],
    icon: ({ size = 20 } = {}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Patchwork Quilt / Diamond Lattice */}
        <path d="M12 2L2 12l10 10 10-10L12 2z" />
        <path d="M12 6L6 12l6 6 6-6-6-6z" />
      </svg>
    ),
  },
];

export function getLoaderConfig(id: LoaderType): LoaderConfig | undefined {
  return LOADERS_CONFIG.find((l) => l.id === id);
}

export function getLoaderBySlug(slug: string): LoaderConfig | undefined {
  const normalized = slug.toLowerCase().trim();
  return LOADERS_CONFIG.find((l) => l.slug.toLowerCase() === normalized || l.id.toLowerCase() === normalized);
}
