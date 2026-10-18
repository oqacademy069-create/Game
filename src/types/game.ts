export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType = 
  | 'APPLE'          // Standard food (+10)
  | 'GOLDEN_APPLE'   // High value (+50, timed)
  | 'SPEED_BOOST'    // Turbo boost & 2x multiplier
  | 'SLOW_MO'        // Slows down snake for safe navigation
  | 'GHOST'          // Walk through walls/tail for 5 seconds
  | 'MAGNET';        // Pulls food within radius

export interface FoodItem {
  id: string;
  type: FoodType;
  pos: Point;
  points: number;
  expiresAt?: number; // timestamp in ms
  spawnTime: number;
}

export type ObstacleType = 
  | 'WALL'           // Static barrier
  | 'HAZARD_SPIKE'   // Deadly pulsing spikes
  | 'LASER_GATE'     // Blinking laser gate (active on cycle)
  | 'PORTAL';        // Matched warp wormhole

export interface Obstacle {
  id: string;
  type: ObstacleType;
  pos: Point;
  // For portals
  portalId?: number; // 1 or 2
  targetPos?: Point;
  color?: string;
  // For laser gates
  active?: boolean;
  cycleInterval?: number; // ms
  lastToggled?: number;
}

export type SnakeSkinId = 'emerald' | 'cyber' | 'magma' | 'gold' | 'neon' | 'void';

export interface SnakeSkin {
  id: SnakeSkinId;
  name: string;
  headColor: string;
  bodyColor: string;
  glowColor: string;
  accentColor: string;
  eyeColor: string;
  trailColor: string;
  description: string;
}

export type GameMode = 
  | 'CLASSIC'       // Classic arena with progressive hazard spawning
  | 'MAZE'          // Fixed complex labyrinth maps
  | 'HAZARDS'       // Laser gates, spike corridors, dynamic traps
  | 'PORTALS';      // Spatial warping wormholes across arenas

export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface ActiveBuff {
  type: FoodType;
  name: string;
  remainingMs: number;
  totalMs: number;
  color: string;
}

export interface ScoreEntry {
  id: string;
  name: string;
  score: number;
  level: number;
  apples: number;
  maxCombo: number;
  mode: GameMode;
  skin: SnakeSkinId;
  date: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  gridSize: 20 | 25 | 30; // 20: small, 25: standard, 30: large
  wrapBorders: boolean;
  particleQuality: 'low' | 'high';
  touchControls: boolean;
}

export interface GameStats {
  score: number;
  level: number;
  applesEaten: number;
  specialsEaten: number;
  combo: number;
  maxCombo: number;
  comboTimer: number; // 0 to 1
  length: number;
  timeElapsed: number; // seconds
  speedLevel: number;
  pointsToNextLevel: number;
}
