import { GameMode, Obstacle, Point, SnakeSkin, SnakeSkinId } from '../types/game';

export const SKINS: Record<SnakeSkinId, SnakeSkin> = {
  emerald: {
    id: 'emerald',
    name: 'Emerald Viper',
    headColor: '#10b981',
    bodyColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    accentColor: '#34d399',
    eyeColor: '#fef08a',
    trailColor: '#10b981',
    description: 'The legendary bio-luminescent forest serpent.',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyber Neon',
    headColor: '#06b6d4',
    bodyColor: '#0284c7',
    glowColor: 'rgba(6, 182, 212, 0.6)',
    accentColor: '#38bdf8',
    eyeColor: '#f43f5e',
    trailColor: '#06b6d4',
    description: 'Electric neural cybernetics with high-voltage pulse.',
  },
  magma: {
    id: 'magma',
    name: 'Lava Drake',
    headColor: '#f97316',
    bodyColor: '#dc2626',
    glowColor: 'rgba(249, 115, 22, 0.65)',
    accentColor: '#fb923c',
    eyeColor: '#fef08a',
    trailColor: '#ea580c',
    description: 'Forged in subterranean basalt with molten embers.',
  },
  gold: {
    id: 'gold',
    name: 'Golden Wyrm',
    headColor: '#eab308',
    bodyColor: '#ca8a04',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    accentColor: '#fde047',
    eyeColor: '#ffffff',
    trailColor: '#eab308',
    description: 'Imperial auric scales that shimmer under neon light.',
  },
  neon: {
    id: 'neon',
    name: 'Void Lotus',
    headColor: '#a855f7',
    bodyColor: '#7c3aed',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    accentColor: '#c084fc',
    eyeColor: '#38bdf8',
    trailColor: '#9333ea',
    description: 'Dark matter entity wrapped in violet corona waves.',
  },
  void: {
    id: 'void',
    name: 'Phosphor 84',
    headColor: '#4ade80',
    bodyColor: '#16a34a',
    glowColor: 'rgba(74, 222, 128, 0.55)',
    accentColor: '#86efac',
    eyeColor: '#ffffff',
    trailColor: '#22c55e',
    description: 'Retro CRT terminal phosphor with scanline glow.',
  },
};

export function getMapObstacles(mode: GameMode, gridSize: number, level = 1): Obstacle[] {
  const obstacles: Obstacle[] = [];
  const mid = Math.floor(gridSize / 2);
  const q1 = Math.floor(gridSize / 4);
  const q3 = Math.floor((gridSize * 3) / 4);

  if (mode === 'CLASSIC') {
    // Progressive hazard pillars: at level 1 none, at level 2+ spawn small safety-spaced hazard pillars
    if (level >= 2) {
      const count = Math.min(8, level - 1);
      const spots: Point[] = [
        { x: q1, y: q1 },
        { x: q3, y: q1 },
        { x: q1, y: q3 },
        { x: q3, y: q3 },
        { x: mid, y: q1 - 1 },
        { x: mid, y: q3 + 1 },
        { x: q1 - 1, y: mid },
        { x: q3 + 1, y: mid },
      ];

      for (let i = 0; i < count; i++) {
        obstacles.push({
          id: `classic_pillar_${i}`,
          type: 'HAZARD_SPIKE',
          pos: spots[i],
        });
      }
    }
    return obstacles;
  }

  if (mode === 'MAZE') {
    // Symmetrical geometric labyrinth with ample navigation corridors
    // 1. Central Vault posts
    const vaultSize = Math.max(2, Math.floor(gridSize / 8));
    for (let dx = -vaultSize; dx <= vaultSize; dx += vaultSize * 2) {
      for (let dy = -vaultSize; dy <= vaultSize; dy += vaultSize * 2) {
        obstacles.push({
          id: `maze_vault_${dx}_${dy}`,
          type: 'WALL',
          pos: { x: mid + dx, y: mid + dy },
        });
      }
    }

    // 2. Corner brackets
    const armLen = Math.floor(gridSize / 6);
    // Top-left bracket
    for (let i = 0; i < armLen; i++) {
      obstacles.push({ id: `maze_tl_h_${i}`, type: 'WALL', pos: { x: q1 + i, y: q1 } });
      obstacles.push({ id: `maze_tl_v_${i}`, type: 'WALL', pos: { x: q1, y: q1 + i } });
    }
    // Top-right bracket
    for (let i = 0; i < armLen; i++) {
      obstacles.push({ id: `maze_tr_h_${i}`, type: 'WALL', pos: { x: q3 - i, y: q1 } });
      obstacles.push({ id: `maze_tr_v_${i}`, type: 'WALL', pos: { x: q3, y: q1 + i } });
    }
    // Bottom-left bracket
    for (let i = 0; i < armLen; i++) {
      obstacles.push({ id: `maze_bl_h_${i}`, type: 'WALL', pos: { x: q1 + i, y: q3 } });
      obstacles.push({ id: `maze_bl_v_${i}`, type: 'WALL', pos: { x: q1, y: q3 - i } });
    }
    // Bottom-right bracket
    for (let i = 0; i < armLen; i++) {
      obstacles.push({ id: `maze_br_h_${i}`, type: 'WALL', pos: { x: q3 - i, y: q3 } });
      obstacles.push({ id: `maze_br_v_${i}`, type: 'WALL', pos: { x: q3, y: q3 - i } });
    }

    // Additional level-based hazards
    if (level >= 3) {
      obstacles.push({ id: 'maze_h1', type: 'HAZARD_SPIKE', pos: { x: mid, y: q1 - 1 } });
      obstacles.push({ id: 'maze_h2', type: 'HAZARD_SPIKE', pos: { x: mid, y: q3 + 1 } });
    }

    return obstacles;
  }

  if (mode === 'HAZARDS') {
    // Dynamic Laser Gates + Perimeter Defense Spikes
    // Laser gate bars that toggle active/inactive
    const gateLen = Math.floor(gridSize / 5);

    // North-South laser gate (center-top)
    for (let i = 0; i < gateLen; i++) {
      obstacles.push({
        id: `laser_top_${i}`,
        type: 'LASER_GATE',
        pos: { x: mid, y: q1 - Math.floor(gateLen / 2) + i },
        active: true,
        cycleInterval: 3000,
        lastToggled: Date.now(),
      });
    }

    // North-South laser gate (center-bottom)
    for (let i = 0; i < gateLen; i++) {
      obstacles.push({
        id: `laser_bottom_${i}`,
        type: 'LASER_GATE',
        pos: { x: mid, y: q3 - Math.floor(gateLen / 2) + i },
        active: true,
        cycleInterval: 3000,
        lastToggled: Date.now(),
      });
    }

    // Static hazard clusters
    const clusters: Point[] = [
      { x: q1, y: mid },
      { x: q3, y: mid },
      { x: q1, y: q1 },
      { x: q3, y: q3 },
    ];
    clusters.forEach((pt, idx) => {
      obstacles.push({
        id: `hazard_static_${idx}`,
        type: 'HAZARD_SPIKE',
        pos: pt,
      });
    });

    return obstacles;
  }

  if (mode === 'PORTALS') {
    // 2 pairs of spatial portals:
    // Blue Pair (Portal 1): Left to Right
    const p1A: Point = { x: 3, y: mid };
    const p1B: Point = { x: gridSize - 4, y: mid };

    obstacles.push({
      id: 'portal_1_a',
      type: 'PORTAL',
      pos: p1A,
      portalId: 1,
      targetPos: p1B,
      color: '#38bdf8', // Neon Sky Blue
    });
    obstacles.push({
      id: 'portal_1_b',
      type: 'PORTAL',
      pos: p1B,
      portalId: 1,
      targetPos: p1A,
      color: '#38bdf8',
    });

    // Orange Pair (Portal 2): Top to Bottom
    const p2A: Point = { x: mid, y: 3 };
    const p2B: Point = { x: mid, y: gridSize - 4 };

    obstacles.push({
      id: 'portal_2_a',
      type: 'PORTAL',
      pos: p2A,
      portalId: 2,
      targetPos: p2B,
      color: '#f97316', // Neon Orange
    });
    obstacles.push({
      id: 'portal_2_b',
      type: 'PORTAL',
      pos: p2B,
      portalId: 2,
      targetPos: p2A,
      color: '#f97316',
    });

    // Some defensive walls in the corners to create interesting warp routing
    const cornerOffset = 4;
    obstacles.push({ id: 'portal_w1', type: 'WALL', pos: { x: cornerOffset, y: cornerOffset } });
    obstacles.push({ id: 'portal_w2', type: 'WALL', pos: { x: gridSize - cornerOffset - 1, y: cornerOffset } });
    obstacles.push({ id: 'portal_w3', type: 'WALL', pos: { x: cornerOffset, y: gridSize - cornerOffset - 1 } });
    obstacles.push({ id: 'portal_w4', type: 'WALL', pos: { x: gridSize - cornerOffset - 1, y: gridSize - cornerOffset - 1 } });

    return obstacles;
  }

  return obstacles;
}

export const SPEED_LEVELS: { level: number; intervalMs: number; name: string }[] = [
  { level: 1, intervalMs: 145, name: 'Cruise' },
  { level: 2, intervalMs: 130, name: 'Brisk' },
  { level: 3, intervalMs: 115, name: 'Velocity' },
  { level: 4, intervalMs: 102, name: 'Overdrive' },
  { level: 5, intervalMs: 90, name: 'Supersonic' },
  { level: 6, intervalMs: 80, name: 'Hyper' },
  { level: 7, intervalMs: 72, name: 'Mach 2' },
  { level: 8, intervalMs: 65, name: 'Quantum' },
  { level: 9, intervalMs: 58, name: 'Apex' },
  { level: 10, intervalMs: 50, name: 'Singularity' },
];

export function getTickInterval(level: number, hasSpeedBuff = false, hasSlowMoBuff = false): number {
  const index = Math.min(SPEED_LEVELS.length - 1, Math.max(0, level - 1));
  let baseMs = SPEED_LEVELS[index].intervalMs;

  if (hasSpeedBuff) {
    baseMs = Math.round(baseMs * 0.72); // 28% faster
  } else if (hasSlowMoBuff) {
    baseMs = Math.round(baseMs * 1.55); // 55% slower
  }

  return Math.max(40, baseMs);
}
