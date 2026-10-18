import React, { useEffect, useRef, useCallback } from 'react';
import { ActiveBuff, Direction, FoodItem, FoodType, GameMode, GameSettings, GameStats, Obstacle, Point, SnakeSkinId } from '../types/game';
import { SKINS, getMapObstacles, getTickInterval } from '../utils/maps';
import { ParticleSystem } from '../utils/particles';
import { sound } from '../utils/audio';

interface SpeedTheme {
  name: string;
  baseColor: string;
  glowColorCenter: string;
  outerGlow: string;
  gridLineColor: string;
  accentColor: string;
  pulseRate: number;
  hasSpeedRays: boolean;
  borderAccent: string;
}

const SPEED_THEMES: Record<number, SpeedTheme> = {
  1: {
    name: 'Cruise',
    baseColor: '#070b14',
    glowColorCenter: 'rgba(16, 185, 129, 0.14)', // Bio-Emerald
    outerGlow: 'rgba(5, 150, 105, 0.02)',
    gridLineColor: 'rgba(16, 185, 129, 0.045)',
    accentColor: '#10b981',
    pulseRate: 1.4,
    hasSpeedRays: false,
    borderAccent: 'rgba(16, 185, 129, 0.16)',
  },
  2: {
    name: 'Brisk',
    baseColor: '#050d18',
    glowColorCenter: 'rgba(6, 182, 212, 0.16)', // Electric Cyan
    outerGlow: 'rgba(2, 132, 199, 0.03)',
    gridLineColor: 'rgba(6, 182, 212, 0.055)',
    accentColor: '#06b6d4',
    pulseRate: 1.9,
    hasSpeedRays: false,
    borderAccent: 'rgba(6, 182, 212, 0.20)',
  },
  3: {
    name: 'Velocity',
    baseColor: '#060a1e',
    glowColorCenter: 'rgba(59, 130, 246, 0.18)', // Neon Cobalt
    outerGlow: 'rgba(37, 99, 235, 0.04)',
    gridLineColor: 'rgba(59, 130, 246, 0.065)',
    accentColor: '#3b82f6',
    pulseRate: 2.4,
    hasSpeedRays: false,
    borderAccent: 'rgba(59, 130, 246, 0.25)',
  },
  4: {
    name: 'Overdrive',
    baseColor: '#0b081e',
    glowColorCenter: 'rgba(139, 92, 246, 0.20)', // Electric Indigo
    outerGlow: 'rgba(109, 40, 217, 0.05)',
    gridLineColor: 'rgba(139, 92, 246, 0.075)',
    accentColor: '#8b5cf6',
    pulseRate: 3.0,
    hasSpeedRays: true,
    borderAccent: 'rgba(139, 92, 246, 0.30)',
  },
  5: {
    name: 'Supersonic',
    baseColor: '#12071d',
    glowColorCenter: 'rgba(168, 85, 247, 0.23)', // Ultraviolet
    outerGlow: 'rgba(126, 34, 206, 0.06)',
    gridLineColor: 'rgba(168, 85, 247, 0.085)',
    accentColor: '#a855f7',
    pulseRate: 3.6,
    hasSpeedRays: true,
    borderAccent: 'rgba(168, 85, 247, 0.35)',
  },
  6: {
    name: 'Hyper',
    baseColor: '#160817',
    glowColorCenter: 'rgba(236, 72, 153, 0.25)', // Neon Magenta
    outerGlow: 'rgba(190, 24, 93, 0.07)',
    gridLineColor: 'rgba(236, 72, 153, 0.095)',
    accentColor: '#ec4899',
    pulseRate: 4.3,
    hasSpeedRays: true,
    borderAccent: 'rgba(236, 72, 153, 0.40)',
  },
  7: {
    name: 'Mach 2',
    baseColor: '#19080e',
    glowColorCenter: 'rgba(244, 63, 94, 0.28)', // Crimson Laser
    outerGlow: 'rgba(225, 29, 72, 0.08)',
    gridLineColor: 'rgba(244, 63, 94, 0.11)',
    accentColor: '#f43f5e',
    pulseRate: 5.0,
    hasSpeedRays: true,
    borderAccent: 'rgba(244, 63, 94, 0.45)',
  },
  8: {
    name: 'Quantum',
    baseColor: '#190a07',
    glowColorCenter: 'rgba(249, 115, 22, 0.30)', // Solar Amber
    outerGlow: 'rgba(194, 65, 12, 0.09)',
    gridLineColor: 'rgba(249, 115, 22, 0.12)',
    accentColor: '#f97316',
    pulseRate: 5.8,
    hasSpeedRays: true,
    borderAccent: 'rgba(249, 115, 22, 0.50)',
  },
  9: {
    name: 'Apex',
    baseColor: '#1c0606',
    glowColorCenter: 'rgba(239, 68, 68, 0.34)', // Molten Plasma
    outerGlow: 'rgba(185, 28, 28, 0.11)',
    gridLineColor: 'rgba(239, 68, 68, 0.14)',
    accentColor: '#ef4444',
    pulseRate: 6.8,
    hasSpeedRays: true,
    borderAccent: 'rgba(239, 68, 68, 0.55)',
  },
  10: {
    name: 'Singularity',
    baseColor: '#14031c',
    glowColorCenter: 'rgba(217, 70, 239, 0.38)', // Hyper Singularity
    outerGlow: 'rgba(147, 51, 234, 0.13)',
    gridLineColor: 'rgba(217, 70, 239, 0.16)',
    accentColor: '#d946ef',
    pulseRate: 8.0,
    hasSpeedRays: true,
    borderAccent: 'rgba(217, 70, 239, 0.65)',
  },
};

interface SnakeCanvasProps {
  mode: GameMode;
  skinId: SnakeSkinId;
  settings: GameSettings;
  isPaused: boolean;
  onGameOver: (finalStats: GameStats) => void;
  onStatsUpdate: (stats: GameStats, buffs: ActiveBuff[]) => void;
  onLevelUpAlert: (level: number) => void;
  inputDirectionRef: React.MutableRefObject<Direction | null>;
}

export const SnakeCanvas: React.FC<SnakeCanvasProps> = ({
  mode,
  skinId,
  settings,
  isPaused,
  onGameOver,
  onStatsUpdate,
  onLevelUpAlert,
  inputDirectionRef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core internal game state stored in mutable refs to avoid React re-render lag
  const gameRef = useRef<{
    gridSize: number;
    snake: Point[];
    prevSnake: Point[];
    direction: Direction;
    nextDirection: Direction;
    inputQueue: Direction[];
    food: FoodItem[];
    obstacles: Obstacle[];
    score: number;
    level: number;
    applesEaten: number;
    specialsEaten: number;
    combo: number;
    maxCombo: number;
    comboTimeRemaining: number;
    timeElapsed: number;
    speedBuffTime: number;
    slowMoBuffTime: number;
    ghostBuffTime: number;
    magnetBuffTime: number;
    isAlive: boolean;
    lastTickTime: number;
    accumulatedTime: number;
    shake: number;
    particles: ParticleSystem;
    tongueTimer: number;
    laserTimer: number;
    lastPortalUseTime: number;
  }>({
    gridSize: settings.gridSize,
    snake: [],
    prevSnake: [],
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    inputQueue: [],
    food: [],
    obstacles: [],
    score: 0,
    level: 1,
    applesEaten: 0,
    specialsEaten: 0,
    combo: 0,
    maxCombo: 0,
    comboTimeRemaining: 0,
    timeElapsed: 0,
    speedBuffTime: 0,
    slowMoBuffTime: 0,
    ghostBuffTime: 0,
    magnetBuffTime: 0,
    isAlive: true,
    lastTickTime: 0,
    accumulatedTime: 0,
    shake: 0,
    particles: new ParticleSystem(),
    tongueTimer: 0,
    laserTimer: 0,
    lastPortalUseTime: 0,
  });

  const skin = SKINS[skinId] || SKINS.emerald;

  // Helper: check if point is occupied by snake or obstacles
  const isOccupied = useCallback((pt: Point, checkFood = true): boolean => {
    const g = gameRef.current;
    if (g.snake.some((s) => s.x === pt.x && s.y === pt.y)) return true;
    if (g.obstacles.some((o) => o.pos.x === pt.x && o.pos.y === pt.y)) return true;
    if (checkFood && g.food.some((f) => f.pos.x === pt.x && f.pos.y === pt.y)) return true;
    return false;
  }, []);

  // Helper: spawn food
  const spawnFood = useCallback((specificType?: FoodType): FoodItem | null => {
    const g = gameRef.current;
    const maxTries = 100;
    let tries = 0;

    while (tries < maxTries) {
      tries++;
      const pt: Point = {
        x: Math.floor(Math.random() * g.gridSize),
        y: Math.floor(Math.random() * g.gridSize),
      };

      if (!isOccupied(pt)) {
        // Determine type if not specified
        let type: FoodType = specificType || 'APPLE';
        if (!specificType) {
          const roll = Math.random();
          if (roll < 0.65) {
            type = 'APPLE';
          } else if (roll < 0.77) {
            type = 'GOLDEN_APPLE';
          } else if (roll < 0.85) {
            type = 'SPEED_BOOST';
          } else if (roll < 0.92) {
            type = 'SLOW_MO';
          } else if (roll < 0.96) {
            type = 'MAGNET';
          } else {
            type = 'GHOST';
          }
        }

        const isSpecial = type !== 'APPLE';
        const points = type === 'GOLDEN_APPLE' ? 50 : type === 'APPLE' ? 10 : 25;
        const duration = isSpecial ? (type === 'GOLDEN_APPLE' ? 9000 : 8000) : undefined;

        return {
          id: `food_${Date.now()}_${Math.random()}`,
          type,
          pos: pt,
          points,
          expiresAt: duration ? Date.now() + duration : undefined,
          spawnTime: Date.now(),
        };
      }
    }
    return null;
  }, [isOccupied]);

  // Reset or initialize game
  const initGame = useCallback(() => {
    const size = settings.gridSize;
    const midY = Math.floor(size / 2);
    const startX = Math.floor(size / 3);

    const initialSnake: Point[] = [
      { x: startX, y: midY },
      { x: startX - 1, y: midY },
      { x: startX - 2, y: midY },
    ];

    const initialObstacles = getMapObstacles(mode, size, 1);

    gameRef.current = {
      gridSize: size,
      snake: initialSnake,
      prevSnake: JSON.parse(JSON.stringify(initialSnake)),
      direction: 'RIGHT',
      nextDirection: 'RIGHT',
      inputQueue: [],
      food: [],
      obstacles: initialObstacles,
      score: 0,
      level: 1,
      applesEaten: 0,
      specialsEaten: 0,
      combo: 0,
      maxCombo: 0,
      comboTimeRemaining: 0,
      timeElapsed: 0,
      speedBuffTime: 0,
      slowMoBuffTime: 0,
      ghostBuffTime: 0,
      magnetBuffTime: 0,
      isAlive: true,
      lastTickTime: performance.now(),
      accumulatedTime: 0,
      shake: 0,
      particles: new ParticleSystem(),
      tongueTimer: 0,
      laserTimer: 0,
      lastPortalUseTime: 0,
    };

    // Spawn 1 standard apple and 1 chance for special fruit
    const apple = spawnFood('APPLE');
    if (apple) gameRef.current.food.push(apple);

    if (Math.random() > 0.4) {
      const bonus = spawnFood();
      if (bonus) gameRef.current.food.push(bonus);
    }
  }, [mode, settings.gridSize, spawnFood]);

  // Turn direction logic (prevents 180 degree reversal)
  const isOpposite = (d1: Direction, d2: Direction): boolean => {
    return (
      (d1 === 'UP' && d2 === 'DOWN') ||
      (d1 === 'DOWN' && d2 === 'UP') ||
      (d1 === 'LEFT' && d2 === 'RIGHT') ||
      (d1 === 'RIGHT' && d2 === 'LEFT')
    );
  };

  const enqueueDirection = useCallback((newDir: Direction) => {
    const g = gameRef.current;
    if (!g.isAlive) return;

    const lastPlanned = g.inputQueue.length > 0 
      ? g.inputQueue[g.inputQueue.length - 1] 
      : g.direction;

    if (newDir !== lastPlanned && !isOpposite(newDir, lastPlanned)) {
      if (g.inputQueue.length < 3) {
        g.inputQueue.push(newDir);
      }
    }
  }, []);

  // Sync external inputDirectionRef if provided
  useEffect(() => {
    if (inputDirectionRef.current) {
      enqueueDirection(inputDirectionRef.current);
      inputDirectionRef.current = null;
    }
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          enqueueDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          enqueueDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          enqueueDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          enqueueDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enqueueDirection]);

  // Start initial game on mount or settings change
  useEffect(() => {
    initGame();
  }, [initGame]);

  // Main Simulation Step (Tick)
  const simulationTick = useCallback(() => {
    const g = gameRef.current;
    if (!g.isAlive || isPaused) return;

    // Apply next direction from queue if available
    if (g.inputQueue.length > 0) {
      g.direction = g.inputQueue.shift()!;
    }

    g.prevSnake = JSON.parse(JSON.stringify(g.snake));
    const head = { ...g.snake[0] };

    // Move head
    switch (g.direction) {
      case 'UP':
        head.y -= 1;
        break;
      case 'DOWN':
        head.y += 1;
        break;
      case 'LEFT':
        head.x -= 1;
        break;
      case 'RIGHT':
        head.x += 1;
        break;
    }

    // Border handling: wrap or collide
    const isGhostActive = g.ghostBuffTime > 0;

    if (settings.wrapBorders) {
      if (head.x < 0) head.x = g.gridSize - 1;
      else if (head.x >= g.gridSize) head.x = 0;
      if (head.y < 0) head.y = g.gridSize - 1;
      else if (head.y >= g.gridSize) head.y = 0;
    } else {
      if (head.x < 0 || head.x >= g.gridSize || head.y < 0 || head.y >= g.gridSize) {
        if (!isGhostActive) {
          // Dead by border collision
          g.isAlive = false;
          g.shake = 18;
          sound.playCrash();
          g.particles.emitCrashDebris(g.snake, 600 / g.gridSize, skin.headColor);
          onGameOver({
            score: g.score,
            level: g.level,
            applesEaten: g.applesEaten,
            specialsEaten: g.specialsEaten,
            combo: g.combo,
            maxCombo: g.maxCombo,
            comboTimer: 0,
            length: g.snake.length,
            timeElapsed: Math.floor(g.timeElapsed),
            speedLevel: g.level,
            pointsToNextLevel: Math.max(0, g.level * 100 - g.score),
          });
          return;
        } else {
          // Ghost phase wraps borders even if wrap is off
          if (head.x < 0) head.x = g.gridSize - 1;
          else if (head.x >= g.gridSize) head.x = 0;
          if (head.y < 0) head.y = g.gridSize - 1;
          else if (head.y >= g.gridSize) head.y = 0;
        }
      }
    }

    // Portal interaction
    const portalHit = g.obstacles.find(
      (o) => o.type === 'PORTAL' && o.pos.x === head.x && o.pos.y === head.y
    );
    const now = Date.now();
    if (portalHit && portalHit.targetPos && now - g.lastPortalUseTime > 800) {
      g.lastPortalUseTime = now;
      sound.playPortal();
      
      const tileSize = 600 / g.gridSize;
      g.particles.emitFoodBurst(
        head.x * tileSize + tileSize / 2,
        head.y * tileSize + tileSize / 2,
        portalHit.color || '#38bdf8',
        14
      );

      // Emerge one step forward from the target portal in current direction
      head.x = portalHit.targetPos.x;
      head.y = portalHit.targetPos.y;
      
      g.particles.addFloatingText(
        head.x * tileSize + tileSize / 2,
        head.y * tileSize + tileSize / 2,
        'WARPED!',
        '#38bdf8'
      );
    }

    // Obstacle collision (Walls, Hazard Spikes, Active Laser Gates)
    if (!isGhostActive) {
      const obstacleCollision = g.obstacles.find((o) => {
        if (o.type === 'PORTAL') return false; // Handled above
        if (o.type === 'LASER_GATE' && o.active === false) return false;
        return o.pos.x === head.x && o.pos.y === head.y;
      });

      if (obstacleCollision) {
        g.isAlive = false;
        g.shake = 22;
        sound.playCrash();
        g.particles.emitCrashDebris(g.snake, 600 / g.gridSize, '#ef4444');
        onGameOver({
          score: g.score,
          level: g.level,
          applesEaten: g.applesEaten,
          specialsEaten: g.specialsEaten,
          combo: g.combo,
          maxCombo: g.maxCombo,
          comboTimer: 0,
          length: g.snake.length,
          timeElapsed: Math.floor(g.timeElapsed),
          speedLevel: g.level,
          pointsToNextLevel: Math.max(0, g.level * 100 - g.score),
        });
        return;
      }

      // Self-collision (exclude tail if it's going to move this step, but standard check is index > 0)
      for (let i = 0; i < g.snake.length - 1; i++) {
        if (g.snake[i].x === head.x && g.snake[i].y === head.y) {
          g.isAlive = false;
          g.shake = 18;
          sound.playCrash();
          g.particles.emitCrashDebris(g.snake, 600 / g.gridSize, skin.headColor);
          onGameOver({
            score: g.score,
            level: g.level,
            applesEaten: g.applesEaten,
            specialsEaten: g.specialsEaten,
            combo: g.combo,
            maxCombo: g.maxCombo,
            comboTimer: 0,
            length: g.snake.length,
            timeElapsed: Math.floor(g.timeElapsed),
            speedLevel: g.level,
            pointsToNextLevel: Math.max(0, g.level * 100 - g.score),
          });
          return;
        }
      }
    }

    // Move snake body
    g.snake.unshift(head);

    // Food collision check
    const eatenIndex = g.food.findIndex((f) => f.pos.x === head.x && f.pos.y === head.y);
    const tileSize = 600 / g.gridSize;

    if (eatenIndex !== -1) {
      const eaten = g.food[eatenIndex];
      g.food.splice(eatenIndex, 1);

      // Combo management
      g.combo += 1;
      g.maxCombo = Math.max(g.maxCombo, g.combo);
      g.comboTimeRemaining = 4.0; // 4 seconds window

      const comboMultiplier = g.combo >= 6 ? 3 : g.combo >= 3 ? 2 : 1;
      const speedMultiplier = g.speedBuffTime > 0 ? 2 : 1;
      const totalPoints = eaten.points * comboMultiplier * speedMultiplier;

      const prevScore = g.score;
      g.score += totalPoints;

      // Sound & visuals
      const isGolden = eaten.type === 'GOLDEN_APPLE';
      sound.playBite(isGolden);
      if (g.combo > 1) {
        sound.playCombo(g.combo);
      }

      const foodColor =
        eaten.type === 'APPLE'
          ? '#ef4444'
          : eaten.type === 'GOLDEN_APPLE'
          ? '#fbbf24'
          : eaten.type === 'SPEED_BOOST'
          ? '#f97316'
          : eaten.type === 'SLOW_MO'
          ? '#38bdf8'
          : eaten.type === 'GHOST'
          ? '#c084fc'
          : '#3b82f6';

      g.particles.emitFoodBurst(
        head.x * tileSize + tileSize / 2,
        head.y * tileSize + tileSize / 2,
        foodColor,
        isGolden ? 24 : 14
      );

      let text = `+${totalPoints}`;
      if (comboMultiplier > 1) text += ` (x${comboMultiplier})`;
      g.particles.addFloatingText(
        head.x * tileSize + tileSize / 2,
        head.y * tileSize + tileSize / 2 - 8,
        text,
        foodColor
      );

      // Handle powerup effects
      if (eaten.type === 'APPLE') {
        g.applesEaten += 1;
      } else {
        g.specialsEaten += 1;
        sound.playPowerup(eaten.type);

        if (eaten.type === 'SPEED_BOOST') {
          g.speedBuffTime = 6.0;
          g.particles.addFloatingText(
            head.x * tileSize + tileSize / 2,
            head.y * tileSize + tileSize / 2 - 24,
            'TURBO BOOST!',
            '#f97316'
          );
        } else if (eaten.type === 'SLOW_MO') {
          g.slowMoBuffTime = 6.5;
          g.particles.addFloatingText(
            head.x * tileSize + tileSize / 2,
            head.y * tileSize + tileSize / 2 - 24,
            'CHILL SLOW-MO',
            '#38bdf8'
          );
        } else if (eaten.type === 'GHOST') {
          g.ghostBuffTime = 5.0;
          g.particles.addFloatingText(
            head.x * tileSize + tileSize / 2,
            head.y * tileSize + tileSize / 2 - 24,
            'GHOST PHASE ACTIVE',
            '#c084fc'
          );
        } else if (eaten.type === 'MAGNET') {
          g.magnetBuffTime = 7.0;
          g.particles.addFloatingText(
            head.x * tileSize + tileSize / 2,
            head.y * tileSize + tileSize / 2 - 24,
            'MAGNETIC FIELD',
            '#60a5fa'
          );
        }
      }

      // Check level progression (every 80 points or 5 food items)
      const newLevel = Math.min(10, 1 + Math.floor(g.score / 90));
      if (newLevel > g.level) {
        g.level = newLevel;
        sound.playLevelUp();
        g.shake = 12;
        onLevelUpAlert(g.level);
        
        // Refresh & expand obstacles for the new level
        g.obstacles = getMapObstacles(mode, g.gridSize, g.level);

        g.particles.shockwaves.push({
          x: head.x * tileSize + tileSize / 2,
          y: head.y * tileSize + tileSize / 2,
          radius: 10,
          maxRadius: 120,
          color: '#10b981',
          lineWidth: 5,
          alpha: 1,
        });
      }

      // Spawn next foods
      // Maintain at least 1 apple
      const hasApple = g.food.some((f) => f.type === 'APPLE');
      if (!hasApple) {
        const nextApple = spawnFood('APPLE');
        if (nextApple) g.food.push(nextApple);
      }

      // Chance to spawn special fruit if less than 2 foods on screen
      if (g.food.length < 2 && Math.random() < 0.45) {
        const special = spawnFood();
        if (special) g.food.push(special);
      }
    } else {
      // Normal step: pop tail
      g.snake.pop();
    }

    // Magnet powerup pull check: pulls food towards head if within 4 tiles
    if (g.magnetBuffTime > 0) {
      g.food.forEach((f) => {
        const dx = head.x - f.pos.x;
        const dy = head.y - f.pos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= 4.2 && dist > 0.5) {
          // Nudge 1 step closer along largest delta
          if (Math.abs(dx) > Math.abs(dy)) {
            const stepX = dx > 0 ? 1 : -1;
            if (!isOccupied({ x: f.pos.x + stepX, y: f.pos.y }, false)) {
              f.pos.x += stepX;
            }
          } else {
            const stepY = dy > 0 ? 1 : -1;
            if (!isOccupied({ x: f.pos.x, y: f.pos.y + stepY }, false)) {
              f.pos.y += stepY;
            }
          }
        }
      });
    }
  }, [isPaused, settings.wrapBorders, settings.gridSize, mode, skin, onGameOver, onLevelUpAlert, spawnFood, isOccupied]);

  // Main 60FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const rawDt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      const dt = Math.max(0, Math.min(isNaN(rawDt) ? 0.016 : rawDt, 0.05)); // Strict non-negative clamp

      const g = gameRef.current;
      const canvas = canvasRef.current;

      if (g.isAlive && !isPaused) {
        g.timeElapsed += dt;

        // Buff timers
        if (g.speedBuffTime > 0) g.speedBuffTime = Math.max(0, g.speedBuffTime - dt);
        if (g.slowMoBuffTime > 0) g.slowMoBuffTime = Math.max(0, g.slowMoBuffTime - dt);
        if (g.ghostBuffTime > 0) g.ghostBuffTime = Math.max(0, g.ghostBuffTime - dt);
        if (g.magnetBuffTime > 0) g.magnetBuffTime = Math.max(0, g.magnetBuffTime - dt);

        // Combo decay
        if (g.comboTimeRemaining > 0) {
          g.comboTimeRemaining = Math.max(0, g.comboTimeRemaining - dt);
          if (g.comboTimeRemaining === 0) {
            g.combo = 0;
          }
        }

        // Food expiration
        const now = Date.now();
        g.food = g.food.filter((f) => !f.expiresAt || f.expiresAt > now);
        // Ensure at least 1 apple always exists
        if (!g.food.some((f) => f.type === 'APPLE')) {
          const apple = spawnFood('APPLE');
          if (apple) g.food.push(apple);
        }

        // Laser gates toggle timer
        g.laserTimer += dt * 1000;
        g.obstacles.forEach((o) => {
          if (o.type === 'LASER_GATE' && o.cycleInterval) {
            if (g.laserTimer - (o.lastToggled || 0) > o.cycleInterval) {
              o.active = !o.active;
              o.lastToggled = g.laserTimer;
            }
          }
        });

        // Tongue animation timer
        g.tongueTimer += dt;

        // Screen shake decay
        if (g.shake > 0) {
          g.shake = Math.max(0, g.shake - dt * 45);
        }

        // Tick accumulation for smooth variable speed
        const tickInterval = getTickInterval(
          g.level,
          g.speedBuffTime > 0,
          g.slowMoBuffTime > 0
        ) / 1000;

        g.accumulatedTime += dt;
        if (g.accumulatedTime >= tickInterval) {
          g.accumulatedTime -= tickInterval;
          simulationTick();
        }

        // Particle system update
        g.particles.update(dt);

        // Emit slither particles
        if (g.snake.length > 0 && Math.random() < 0.25) {
          const head = g.snake[0];
          const tileSize = 600 / g.gridSize;
          g.particles.emitTrail(
            head.x * tileSize + tileSize / 2,
            head.y * tileSize + tileSize / 2,
            skin.trailColor
          );
        }

        // Notify parent HUD
        const activeBuffsList: ActiveBuff[] = [];
        if (g.speedBuffTime > 0) {
          activeBuffsList.push({
            type: 'SPEED_BOOST',
            name: 'TURBO',
            remainingMs: Math.round(g.speedBuffTime * 1000),
            totalMs: 6000,
            color: '#f97316',
          });
        }
        if (g.slowMoBuffTime > 0) {
          activeBuffsList.push({
            type: 'SLOW_MO',
            name: 'SLOW-MO',
            remainingMs: Math.round(g.slowMoBuffTime * 1000),
            totalMs: 6500,
            color: '#38bdf8',
          });
        }
        if (g.ghostBuffTime > 0) {
          activeBuffsList.push({
            type: 'GHOST',
            name: 'GHOST',
            remainingMs: Math.round(g.ghostBuffTime * 1000),
            totalMs: 5000,
            color: '#c084fc',
          });
        }
        if (g.magnetBuffTime > 0) {
          activeBuffsList.push({
            type: 'MAGNET',
            name: 'MAGNET',
            remainingMs: Math.round(g.magnetBuffTime * 1000),
            totalMs: 7000,
            color: '#60a5fa',
          });
        }

        onStatsUpdate(
          {
            score: g.score,
            level: g.level,
            applesEaten: g.applesEaten,
            specialsEaten: g.specialsEaten,
            combo: g.combo,
            maxCombo: g.maxCombo,
            comboTimer: g.comboTimeRemaining / 4.0,
            length: g.snake.length,
            timeElapsed: Math.floor(g.timeElapsed),
            speedLevel: g.level,
            pointsToNextLevel: Math.max(0, g.level * 90 - g.score),
          },
          activeBuffsList
        );
      }

      // Render onto canvas
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderCanvas(ctx, canvas.width, canvas.height);
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, skin, simulationTick, onStatsUpdate, onGameOver, spawnFood]);

  // Canvas Rendering routine
  const renderCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const g = gameRef.current;
    const size = g.gridSize;
    const tileSize = width / size;

    ctx.save();

    // Screen Shake
    if (g.shake > 0) {
      const offsetX = (Math.random() - 0.5) * g.shake;
      const offsetY = (Math.random() - 0.5) * g.shake;
      ctx.translate(offsetX, offsetY);
    }

    // Resolve dynamic speed level theme (levels 1-10 clamped)
    const currentLvl = Math.max(1, Math.min(10, g.level || 1));
    const theme = SPEED_THEMES[currentLvl] || SPEED_THEMES[1];
    const nowSec = performance.now() / 1000;

    // Pulse factor based on current speed level's pulse frequency
    const isTurbo = g.speedBuffTime > 0;
    const isSlowMo = g.slowMoBuffTime > 0;
    const activePulseRate = isTurbo ? theme.pulseRate * 1.4 : isSlowMo ? theme.pulseRate * 0.6 : theme.pulseRate;
    const pulse = 0.84 + Math.sin(nowSec * activePulseRate) * 0.16;

    // 1. Dynamic Background Arena fill
    ctx.fillStyle = theme.baseColor;
    ctx.fillRect(0, 0, width, height);

    // 2. Central Pulsing Radial Nebula
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.max(width, height) * 0.72;
    const radialGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);
    
    // Choose dynamic center glow color (override if turbo or slow-mo)
    const centerColor = isTurbo 
      ? `rgba(249, 115, 22, ${0.35 * pulse})` 
      : isSlowMo 
      ? `rgba(56, 189, 248, ${0.28 * pulse})` 
      : theme.glowColorCenter;

    radialGrad.addColorStop(0, centerColor);
    radialGrad.addColorStop(0.55, theme.outerGlow);
    radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, width, height);

    // 3. Traveling Digital Grid Scanline Wave
    // Scanline travels across diagonal at a speed proportional to current speed level
    const scanSpeed = 50 + currentLvl * 30;
    const scanPos = (nowSec * scanSpeed) % (width + height);

    // 4. Dynamic Grid Lines with Traveling Scanline Illumination
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i++) {
      const gx = i * tileSize;
      const gy = i * tileSize;

      // Vertical line
      const distV = Math.abs(gx - (scanPos % width));
      const scanBoostV = Math.max(0, 1 - distV / (tileSize * 3.5));
      ctx.strokeStyle = scanBoostV > 0 
        ? `${theme.accentColor}${Math.round(Math.min(255, (0.08 + scanBoostV * 0.22) * 255)).toString(16).padStart(2, '0')}`
        : theme.gridLineColor;

      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
      ctx.stroke();

      // Horizontal line
      const distH = Math.abs(gy - (scanPos % height));
      const scanBoostH = Math.max(0, 1 - distH / (tileSize * 3.5));
      ctx.strokeStyle = scanBoostH > 0
        ? `${theme.accentColor}${Math.round(Math.min(255, (0.08 + scanBoostH * 0.22) * 255)).toString(16).padStart(2, '0')}`
        : theme.gridLineColor;

      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
      ctx.stroke();
    }

    // 5. Corner Speed Warp Rays for high velocity (Levels 4+)
    if (theme.hasSpeedRays || isTurbo) {
      const rayAlpha = Math.min(0.22, (0.04 + (currentLvl - 3) * 0.02) * pulse);
      const cornerSize = Math.min(width, height) * 0.32;

      // Top-Left Corner Ray
      const gradTL = ctx.createRadialGradient(0, 0, 0, 0, 0, cornerSize);
      gradTL.addColorStop(0, isTurbo ? `rgba(249, 115, 22, ${rayAlpha * 1.3})` : `${theme.accentColor}33`);
      gradTL.addColorStop(1, 'transparent');
      ctx.fillStyle = gradTL;
      ctx.fillRect(0, 0, cornerSize, cornerSize);

      // Top-Right Corner Ray
      const gradTR = ctx.createRadialGradient(width, 0, 0, width, 0, cornerSize);
      gradTR.addColorStop(0, isTurbo ? `rgba(249, 115, 22, ${rayAlpha * 1.3})` : `${theme.accentColor}33`);
      gradTR.addColorStop(1, 'transparent');
      ctx.fillStyle = gradTR;
      ctx.fillRect(width - cornerSize, 0, cornerSize, cornerSize);

      // Bottom-Left Corner Ray
      const gradBL = ctx.createRadialGradient(0, height, 0, 0, height, cornerSize);
      gradBL.addColorStop(0, isTurbo ? `rgba(249, 115, 22, ${rayAlpha * 1.3})` : `${theme.accentColor}33`);
      gradBL.addColorStop(1, 'transparent');
      ctx.fillStyle = gradBL;
      ctx.fillRect(0, height - cornerSize, cornerSize, cornerSize);

      // Bottom-Right Corner Ray
      const gradBR = ctx.createRadialGradient(width, height, 0, width, height, cornerSize);
      gradBR.addColorStop(0, isTurbo ? `rgba(249, 115, 22, ${rayAlpha * 1.3})` : `${theme.accentColor}33`);
      gradBR.addColorStop(1, 'transparent');
      ctx.fillStyle = gradBR;
      ctx.fillRect(width - cornerSize, height - cornerSize, cornerSize, cornerSize);
    }

    // 6. Grid center accent & quadrant markings
    ctx.strokeStyle = theme.borderAccent;
    ctx.strokeRect(tileSize, tileSize, width - tileSize * 2, height - tileSize * 2);

    // Render Obstacles
    g.obstacles.forEach((obs) => {
      const x = obs.pos.x * tileSize;
      const y = obs.pos.y * tileSize;

      if (obs.type === 'WALL') {
        // High-tech reinforced barrier
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Metallic beveled border
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Core jewel / accent rivet
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(x + tileSize / 2 - 2, y + tileSize / 2 - 2, 4, 4);
      } else if (obs.type === 'HAZARD_SPIKE') {
        // Pulsing Razor Spike Hazard
        const pulse = 0.8 + Math.sin(Date.now() / 200) * 0.2;
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Warning Hazard diagonal stripes
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

        // Red core spike cross
        ctx.fillStyle = `rgba(239, 68, 68, ${pulse})`;
        ctx.beginPath();
        ctx.moveTo(x + tileSize / 2, y + 3);
        ctx.lineTo(x + tileSize - 3, y + tileSize / 2);
        ctx.lineTo(x + tileSize / 2, y + tileSize - 3);
        ctx.lineTo(x + 3, y + tileSize / 2);
        ctx.closePath();
        ctx.fill();
      } else if (obs.type === 'LASER_GATE') {
        // Laser barrier emitter
        const isActive = obs.active !== false;
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

        // Laser beam
        if (isActive) {
          const glow = Math.sin(Date.now() / 80) * 0.3 + 0.7;
          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 10;
          ctx.fillStyle = `rgba(244, 63, 94, ${glow})`;
          ctx.fillRect(x + tileSize * 0.2, y + tileSize * 0.4, tileSize * 0.6, tileSize * 0.2);
          ctx.shadowBlur = 0;
        } else {
          // Inactive warning outline
          ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, tileSize - 6, tileSize - 6);
        }
      } else if (obs.type === 'PORTAL') {
        // Swirling Spatial Portal
        const pColor = obs.color || '#38bdf8';
        const rot = (Date.now() / 400) % (Math.PI * 2);
        const cx = x + tileSize / 2;
        const cy = y + tileSize / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        ctx.shadowColor = pColor;
        ctx.shadowBlur = 12;

        // Outer ring
        ctx.strokeStyle = pColor;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, tileSize * 0.44, tileSize * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glowing core
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(0, 0, tileSize * 0.16, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    });

    // Render Food Items
    g.food.forEach((item) => {
      const fx = item.pos.x * tileSize + tileSize / 2;
      const fy = item.pos.y * tileSize + tileSize / 2;
      const radius = Math.max(1, tileSize * 0.38);
      const bounce = Math.sin((Date.now() - item.spawnTime) / 200) * 1.5;

      ctx.save();
      ctx.translate(fx, fy + bounce);

      if (item.type === 'APPLE') {
        // Crisp Ruby Apple
        ctx.shadowColor = 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 10;

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 1, radius, 0, Math.PI * 2);
        ctx.fill();

        // Apple shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.beginPath();
        ctx.arc(-radius * 0.35, -radius * 0.35, Math.max(0.5, radius * 0.28), 0, Math.PI * 2);
        ctx.fill();

        // Green Leaf
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(radius * 0.3, -radius * 0.8, Math.max(0.5, radius * 0.4), Math.max(0.2, radius * 0.2), Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'GOLDEN_APPLE') {
        // High-Value Golden Apple with spinning halo
        ctx.shadowColor = 'rgba(251, 191, 36, 0.9)';
        ctx.shadowBlur = 16;

        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, radius * 1.1), 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(-radius * 0.3, -radius * 0.3, Math.max(0.5, radius * 0.35), 0, Math.PI * 2);
        ctx.fill();

        // Golden sparkle halo ring
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, radius * 1.35), 0, Math.PI * 2);
        ctx.stroke();
      } else if (item.type === 'SPEED_BOOST') {
        // Turbo Speed Boost (Orange Flame orb)
        ctx.shadowColor = 'rgba(249, 115, 22, 0.9)';
        ctx.shadowBlur = 14;

        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Lightning bolt icon
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.moveTo(2, -radius * 0.65);
        ctx.lineTo(-radius * 0.4, 0);
        ctx.lineTo(1, 0);
        ctx.lineTo(-2, radius * 0.65);
        ctx.lineTo(radius * 0.4, 0);
        ctx.lineTo(-1, 0);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'SLOW_MO') {
        // Freeze / Slow-Mo (Cyan Frost crystal)
        ctx.shadowColor = 'rgba(56, 189, 248, 0.9)';
        ctx.shadowBlur = 14;

        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        // Ice diamond
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.moveTo(0, -radius * 0.6);
        ctx.lineTo(radius * 0.6, 0);
        ctx.lineTo(0, radius * 0.6);
        ctx.lineTo(-radius * 0.6, 0);
        ctx.closePath();
        ctx.fill();
      } else if (item.type === 'GHOST') {
        // Ghost Phase (Amethyst Diamond)
        ctx.shadowColor = 'rgba(192, 132, 252, 0.9)';
        ctx.shadowBlur = 14;

        ctx.fillStyle = '#7e22ce';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f3e8ff';
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, radius * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'MAGNET') {
        // Magnet Orb (Blue pulse)
        ctx.shadowColor = 'rgba(96, 165, 250, 0.9)';
        ctx.shadowBlur = 14;

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0.5, radius * 0.55), 0, Math.PI);
        ctx.stroke();
      }

      ctx.restore();
    });

    // Render Snake Body
    const isGhost = g.ghostBuffTime > 0;
    const bodyAlpha = isGhost ? 0.45 : 1.0;
    const snakeLen = g.snake.length;

    // Render from tail to head
    for (let i = snakeLen - 1; i >= 0; i--) {
      const seg = g.snake[i];
      const sx = seg.x * tileSize;
      const sy = seg.y * tileSize;
      const isHead = i === 0;

      ctx.save();
      ctx.globalAlpha = bodyAlpha;

      if (isHead) {
        // Snake Head
        ctx.shadowColor = skin.glowColor;
        ctx.shadowBlur = 16;
        ctx.fillStyle = skin.headColor;

        const radius = Math.max(1, tileSize * 0.46);
        const cx = sx + tileSize / 2;
        const cy = sy + tileSize / 2;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;

        // Directional Head Details (Eyes & Flickering Tongue)
        let eyeOffset1 = { x: 0, y: 0 };
        let eyeOffset2 = { x: 0, y: 0 };
        let tongueStart = { x: 0, y: 0 };
        let tongueEnd = { x: 0, y: 0 };

        const ed = radius * 0.5;
        const forward = radius * 0.35;

        switch (g.direction) {
          case 'UP':
            eyeOffset1 = { x: -ed, y: -forward };
            eyeOffset2 = { x: ed, y: -forward };
            tongueStart = { x: cx, y: cy - radius };
            tongueEnd = { x: cx, y: cy - radius - 7 };
            break;
          case 'DOWN':
            eyeOffset1 = { x: -ed, y: forward };
            eyeOffset2 = { x: ed, y: forward };
            tongueStart = { x: cx, y: cy + radius };
            tongueEnd = { x: cx, y: cy + radius + 7 };
            break;
          case 'LEFT':
            eyeOffset1 = { x: -forward, y: -ed };
            eyeOffset2 = { x: -forward, y: ed };
            tongueStart = { x: cx - radius, y: cy };
            tongueEnd = { x: cx - radius - 7, y: cy };
            break;
          case 'RIGHT':
            eyeOffset1 = { x: forward, y: -ed };
            eyeOffset2 = { x: forward, y: ed };
            tongueStart = { x: cx + radius, y: cy };
            tongueEnd = { x: cx + radius + 7, y: cy };
            break;
        }

        // Animated flicking red tongue
        const tongueFlick = Math.sin(g.tongueTimer * 8);
        if (tongueFlick > 0.4) {
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(tongueStart.x, tongueStart.y);
          ctx.lineTo(tongueEnd.x, tongueEnd.y);
          ctx.stroke();
        }

        // Snake Eyes
        ctx.fillStyle = skin.eyeColor;
        ctx.beginPath();
        ctx.arc(cx + eyeOffset1.x, cy + eyeOffset1.y, Math.max(0.5, radius * 0.24), 0, Math.PI * 2);
        ctx.arc(cx + eyeOffset2.x, cy + eyeOffset2.y, Math.max(0.5, radius * 0.24), 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(cx + eyeOffset1.x, cy + eyeOffset1.y, Math.max(0.5, radius * 0.12), 0, Math.PI * 2);
        ctx.arc(cx + eyeOffset2.x, cy + eyeOffset2.y, Math.max(0.5, radius * 0.12), 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Body Segment (tapers slightly towards tail)
        const progress = i / Math.max(1, snakeLen);
        const segRadius = Math.max(0.5, (tileSize * 0.42) * (1 - progress * 0.25));
        const cx = sx + tileSize / 2;
        const cy = sy + tileSize / 2;

        ctx.fillStyle = i % 2 === 0 ? skin.bodyColor : skin.accentColor;
        ctx.beginPath();
        ctx.arc(cx, cy, segRadius, 0, Math.PI * 2);
        ctx.fill();

        // Connect segments smoothly with rounded line to previous segment
        const prevSeg = g.snake[i - 1];
        // Only connect if adjacent (not wrapped or warped)
        const isAdjacent =
          Math.abs(seg.x - prevSeg.x) <= 1 && Math.abs(seg.y - prevSeg.y) <= 1;

        if (isAdjacent) {
          const pcx = prevSeg.x * tileSize + tileSize / 2;
          const pcy = prevSeg.y * tileSize + tileSize / 2;
          ctx.strokeStyle = skin.bodyColor;
          ctx.lineWidth = segRadius * 1.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(pcx, pcy);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    // Render Particles & Floaters
    g.particles.render(ctx);

    // Border Frame with dynamic speed level accent
    ctx.strokeStyle = theme.borderAccent;
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    ctx.restore();
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-2 select-none">
      <div className="relative w-[min(88vw,80vh)] aspect-square max-w-[650px] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#080c14]">
        <canvas
          ref={canvasRef}
          width={650}
          height={650}
          className="w-full h-full block cursor-none"
        />
      </div>
    </div>
  );
};
