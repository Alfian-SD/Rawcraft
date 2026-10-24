import React, { useState } from 'react';

interface ModIconProps {
  /** Modrinth `icon_url`; falls back to initials when missing or broken. */
  src?: string | null;
  title: string;
  /** Tile size in px. */
  size: number;
  className: string;
}

/** Modrinth project icon tile with initials fallback (DESIGN.md §12). */
export const ModIcon: React.FC<ModIconProps> = ({ src, title, size, className }) => {
  const [broken, setBroken] = useState(false);
  const initials = title.trim().slice(0, 2).toUpperCase() || '??';

  return (
    <div className={className} style={{ width: size, height: size }} aria-hidden="true">
      {src && !broken ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setBroken(true)}
        />
      ) : (
        initials
      )}
    </div>
  );
};
