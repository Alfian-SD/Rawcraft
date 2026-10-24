import React from 'react';

export const VoxelHeroBackground: React.FC = () => {
  return (
    <div
      className="voxel-hero-bg"
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        background: 'linear-gradient(180deg, #151926 0%, #221D2E 32%, #382534 60%, #583335 80%, #764434 100%)',
      }}
    >
      {/* 1. Subtle Twinkling Stars in Evening Sky */}
      <div className="voxel-stars">
        <span className="voxel-star" style={{ top: '12%', left: '8%', animationDelay: '0s' }} />
        <span className="voxel-star" style={{ top: '8%', left: '22%', animationDelay: '1.2s' }} />
        <span className="voxel-star" style={{ top: '18%', left: '38%', animationDelay: '0.6s' }} />
        <span className="voxel-star" style={{ top: '6%', left: '54%', animationDelay: '2.1s' }} />
        <span className="voxel-star" style={{ top: '15%', left: '68%', animationDelay: '1.7s' }} />
        <span className="voxel-star" style={{ top: '10%', left: '88%', animationDelay: '0.9s' }} />
        <span className="voxel-star" style={{ top: '22%', left: '94%', animationDelay: '2.5s' }} />
      </div>

      {/* 2. Blocky Pixel Sun with Sunset Radiance */}
      <div className="voxel-sun-wrapper">
        <div className="voxel-sun-glow" />
        <div className="voxel-sun-core" />
      </div>

      {/* 3. Drifting Minecraft Sunset Clouds */}
      <div className="voxel-clouds">
        {/* Cloud 1 */}
        <div className="voxel-cloud cloud-1">
          <div className="cloud-block" style={{ width: '150px', height: '28px' }} />
          <div className="cloud-block" style={{ width: '90px', height: '20px', top: '-14px', left: '28px' }} />
          <div className="cloud-block" style={{ width: '50px', height: '14px', bottom: '-8px', left: '70px' }} />
        </div>

        {/* Cloud 2 */}
        <div className="voxel-cloud cloud-2">
          <div className="cloud-block" style={{ width: '210px', height: '34px' }} />
          <div className="cloud-block" style={{ width: '130px', height: '22px', top: '-16px', left: '42px' }} />
          <div className="cloud-block" style={{ width: '80px', height: '16px', top: '-26px', left: '72px' }} />
        </div>

        {/* Cloud 3 */}
        <div className="voxel-cloud cloud-3">
          <div className="cloud-block" style={{ width: '170px', height: '26px' }} />
          <div className="cloud-block" style={{ width: '100px', height: '18px', top: '-12px', left: '34px' }} />
        </div>
      </div>

      {/* 4. Distant Mountain Silhouette (Far Voxel Ridge) */}
      <svg
        className="voxel-layer-far"
        preserveAspectRatio="none"
        viewBox="0 0 1440 200"
        style={{
          position: 'absolute',
          bottom: '180px',
          left: 0,
          width: '100%',
          height: '200px',
          opacity: 0.75,
        }}
      >
        <path
          d="M0,200 L0,120 L70,120 L70,95 L140,95 L140,70 L230,70 L230,110 L320,110 L320,60 L410,60 L410,40 L500,40 L500,85 L610,85 L610,50 L700,50 L700,30 L800,30 L800,75 L910,75 L910,45 L1020,45 L1020,85 L1130,85 L1130,55 L1240,55 L1240,90 L1340,90 L1340,115 L1440,115 L1440,200 Z"
          fill="#291F33"
        />
      </svg>

      {/* 5. Midground Hills with Spruce & Pine Silhouettes */}
      <svg
        className="voxel-layer-mid"
        preserveAspectRatio="none"
        viewBox="0 0 1440 220"
        style={{
          position: 'absolute',
          bottom: '120px',
          left: 0,
          width: '100%',
          height: '220px',
        }}
      >
        <path
          d="M0,220 L0,140 L100,140 L100,115 L220,115 L220,145 L360,145 L360,95 L490,95 L490,135 L640,135 L640,80 L790,80 L790,120 L940,120 L940,90 L1090,90 L1090,130 L1260,130 L1260,105 L1440,105 L1440,220 Z"
          fill="#1F1728"
        />
        {/* Distant Stepped Voxel Pines on Ridges */}
        <g fill="#16101E">
          {/* Tree cluster on left ridge */}
          <rect x="180" y="80" width="8" height="35" />
          <polygon points="184,55 168,80 200,80" />
          <polygon points="184,40 172,62 196,62" />

          {/* Tree on center ridge */}
          <rect x="740" y="50" width="8" height="30" />
          <polygon points="744,25 728,50 760,50" />
          <polygon points="744,12 732,32 756,32" />

          {/* Tree on right ridge */}
          <rect x="1030" y="60" width="8" height="30" />
          <polygon points="1034,35 1018,60 1050,60" />
          <polygon points="1034,22 1022,42 1046,42" />
        </g>
      </svg>

      {/* 6. Foreground 2.5D Voxel Landscape: Rolling Grass, Stratified Dirt & Bedrock Stone */}
      <svg
        className="voxel-layer-fore"
        preserveAspectRatio="none"
        viewBox="0 0 1440 460"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '460px',
        }}
      >
        <defs>
          {/* Minecraft Pixel Dirt Pattern */}
          <pattern id="minecraftDirt" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#845E40" />
            <rect x="2" y="2" width="4" height="4" fill="#714E33" />
            <rect x="10" y="1" width="5" height="5" fill="#62422A" />
            <rect x="0" y="9" width="4" height="4" fill="#62422A" />
            <rect x="6" y="8" width="5" height="5" fill="#966D4C" />
            <rect x="12" y="11" width="3" height="4" fill="#714E33" />
            <rect x="3" y="13" width="3" height="3" fill="#543722" />
          </pattern>

          {/* Minecraft Pixel Stone Pattern */}
          <pattern id="minecraftStone" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#626266" />
            <rect x="3" y="2" width="5" height="4" fill="#525255" />
            <rect x="11" y="1" width="4" height="5" fill="#747478" />
            <rect x="1" y="9" width="4" height="5" fill="#444447" />
            <rect x="8" y="8" width="5" height="4" fill="#57575B" />
            <rect x="13" y="10" width="3" height="5" fill="#47474A" />
            <rect x="4" y="13" width="4" height="3" fill="#6F6F74" />
          </pattern>

          {/* Minecraft Voxel Oak Leaves Clump Pattern */}
          <pattern id="minecraftLeaves" width="16" height="16" patternUnits="userSpaceOnUse">
            <rect width="16" height="16" fill="#4C8229" />
            <rect x="1" y="2" width="4" height="4" fill="#3B681F" />
            <rect x="7" y="1" width="5" height="4" fill="#629F38" />
            <rect x="2" y="8" width="4" height="5" fill="#578E31" />
            <rect x="9" y="7" width="5" height="5" fill="#2E5217" />
            <rect x="12" y="2" width="4" height="4" fill="#73B543" />
            <rect x="6" y="12" width="4" height="4" fill="#406E22" />
          </pattern>
        </defs>

        {/* 6.1 Underground Stone Layer (Lower 150px) */}
        <rect x="0" y="310" width="1440" height="150" fill="url(#minecraftStone)" />
        <path
          d="M0,310 L140,305 L280,315 L450,298 L640,312 L820,300 L1020,318 L1220,304 L1440,312 L1440,325 L0,325 Z"
          fill="#444447"
        />

        {/* 6.2 Stratified Dirt Layer */}
        <path
          d="M0,175 L120,175 L120,140 L280,140 L280,185 L440,185 L440,225 L640,225 L640,205 L780,205 L780,230 L960,230 L960,170 L1140,170 L1140,145 L1300,145 L1300,180 L1440,180 L1440,310 L0,310 Z"
          fill="url(#minecraftDirt)"
        />

        {/* Natural Cave Hollow on Left Slope */}
        <path
          d="M190,195 L245,195 L255,235 L180,235 Z"
          fill="#2B1E19"
        />
        <rect x="195" y="202" width="42" height="25" rx="3" fill="#1C1310" />

        {/* 6.3 Grass Under-Drop Fringe (Darker green voxel tassels) */}
        <path
          d="M0,175 L120,175 L120,140 L280,140 L280,185 L440,185 L440,225 L640,225 L640,205 L780,205 L780,230 L960,230 L960,170 L1140,170 L1140,145 L1300,145 L1300,180 L1440,180 L1440,192 L1300,192 L1300,157 L1140,157 L1140,182 L960,182 L960,242 L780,242 L780,217 L640,217 L640,237 L440,237 L440,197 L280,197 L280,152 L120,152 L120,187 L0,187 Z"
          fill="#37631E"
        />

        {/* 6.4 Lush Green Grass Top Surface */}
        <path
          d="M0,175 L120,175 L120,140 L280,140 L280,185 L440,185 L440,225 L640,225 L640,205 L780,205 L780,230 L960,230 L960,170 L1140,170 L1140,145 L1300,145 L1300,180 L1440,180 L1440,186 L1300,186 L1300,151 L1140,151 L1140,176 L960,176 L960,236 L780,236 L780,211 L640,211 L640,231 L440,231 L440,191 L280,191 L280,146 L120,146 L120,181 L0,181 Z"
          fill="#6FB33A"
        />

        {/* 6.5 Golden Hour Sunset Rim Highlight (Campfire Orange / Warm Gold Edge) */}
        <path
          d="M0,175 L120,175 L120,140 L280,140 L280,185 L440,185 L440,225 L640,225 L640,205 L780,205 L780,230 L960,230 L960,170 L1140,170 L1140,145 L1300,145 L1300,180 L1440,180 L1440,182 L1300,182 L1300,147 L1140,147 L1140,172 L960,172 L960,232 L780,232 L780,207 L640,207 L640,227 L440,227 L440,187 L280,187 L280,142 L120,142 L120,177 L0,177 Z"
          fill="#FFBD69"
        />

        {/* 6.6 Voxel Oak Tree (Left Ridge, near campfire) */}
        <g className="voxel-tree-left">
          {/* Oak Trunk */}
          <rect x="195" y="95" width="18" height="45" fill="#4B311E" />
          <rect x="200" y="98" width="6" height="42" fill="#5F3F28" />
          {/* Canopy Blocks (3D Voxel Shading) */}
          <rect x="155" y="38" width="98" height="58" rx="4" fill="url(#minecraftLeaves)" />
          <rect x="170" y="20" width="68" height="24" rx="3" fill="#69A83E" />
          <rect x="155" y="80" width="98" height="16" fill="#305619" />
          <rect x="215" y="44" width="30" height="20" rx="2" fill="#7CBD4A" />
        </g>

        {/* 6.7 Voxel Oak Trees (Right Ridge Plateau) */}
        <g className="voxel-tree-right">
          {/* Tall Oak Tree */}
          <rect x="1200" y="100" width="18" height="45" fill="#4B311E" />
          <rect x="1205" y="104" width="6" height="41" fill="#5F3F28" />
          <rect x="1160" y="42" width="98" height="60" rx="4" fill="url(#minecraftLeaves)" />
          <rect x="1175" y="24" width="68" height="24" rx="3" fill="#69A83E" />
          <rect x="1160" y="86" width="98" height="16" fill="#305619" />
          <rect x="1170" y="48" width="30" height="20" rx="2" fill="#7CBD4A" />

          {/* Secondary smaller tree on right slope */}
          <rect x="1340" y="142" width="14" height="38" fill="#4B311E" />
          <rect x="1310" y="98" width="74" height="46" rx="4" fill="url(#minecraftLeaves)" />
          <rect x="1322" y="84" width="50" height="18" rx="2" fill="#5C9E35" />
          <rect x="1310" y="132" width="74" height="12" fill="#305619" />
        </g>

        {/* 6.8 Cozy Campfire on Left Plateau */}
        <g className="voxel-campfire" transform="translate(245, 126)">
          {/* Campfire logs base */}
          <rect x="0" y="10" width="22" height="6" rx="1" fill="#422919" />
          <rect x="4" y="6" width="14" height="6" rx="1" fill="#563723" />
          {/* Amber radial glow */}
          <circle cx="11" cy="4" r="32" fill="#FFA500" opacity="0.32" className="campfire-ambient-glow" />
          {/* Flickering Fire Flame Polygons */}
          <polygon points="11,-12 4,8 18,8" fill="#FF5722" className="campfire-flame flame-outer" />
          <polygon points="11,-8 6,8 16,8" fill="#FF9800" className="campfire-flame flame-mid" />
          <polygon points="11,-4 8,8 14,8" fill="#FFF176" className="campfire-flame flame-core" />
          {/* Rising Ember Sparks */}
          <rect x="7" y="-18" width="3" height="3" fill="#FFD54F" className="campfire-ember ember-1" />
          <rect x="14" y="-24" width="2" height="2" fill="#FFAB00" className="campfire-ember ember-2" />
          <rect x="10" y="-32" width="3" height="3" fill="#FF7043" className="campfire-ember ember-3" />
        </g>
      </svg>

      {/* 7. Bottom Shadow Blend into Footer */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(180deg, rgba(21, 25, 38, 0) 0%, rgba(21, 25, 38, 0.75) 100%)',
        }}
      />
    </div>
  );
};
