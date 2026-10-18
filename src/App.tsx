/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ActiveBuff, Direction, GameMode, GameSettings, GameState, GameStats, ScoreEntry, SnakeSkinId } from './types/game';
import { SnakeCanvas } from './components/SnakeCanvas';
import { TitleScreen } from './components/TitleScreen';
import { HUD } from './components/HUD';
import { GameOverModal } from './components/GameOverModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SettingsModal } from './components/SettingsModal';
import { MobileControls } from './components/MobileControls';
import { sound } from './utils/audio';

const DEFAULT_SCORES: ScoreEntry[] = [
  { id: 'seed_1', name: 'NEXUS_9', score: 1420, level: 9, apples: 48, maxCombo: 8, mode: 'CLASSIC', skin: 'cyber', date: '2026-10-12' },
  { id: 'seed_2', name: 'CYBER_VIPER', score: 980, level: 7, apples: 36, maxCombo: 6, mode: 'HAZARDS', skin: 'emerald', date: '2026-10-13' },
  { id: 'seed_3', name: 'SOLARIS', score: 760, level: 6, apples: 29, maxCombo: 5, mode: 'MAZE', skin: 'gold', date: '2026-10-14' },
  { id: 'seed_4', name: 'VOID_RUNNER', score: 540, level: 5, apples: 22, maxCombo: 4, mode: 'PORTALS', skin: 'neon', date: '2026-10-14' },
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  const [mode, setMode] = useState<GameMode>(() => {
    return (localStorage.getItem('viper_mode') as GameMode) || 'CLASSIC';
  });
  const [skinId, setSkinId] = useState<SnakeSkinId>(() => {
    return (localStorage.getItem('viper_skin') as SnakeSkinId) || 'emerald';
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('viper_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return {
      soundEnabled: true,
      musicEnabled: false,
      volume: 0.5,
      gridSize: 25,
      wrapBorders: false,
      particleQuality: 'high',
      touchControls: false,
    };
  });

  const [scores, setScores] = useState<ScoreEntry[]>(() => {
    const saved = localStorage.getItem('viper_scores');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return DEFAULT_SCORES;
  });

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    level: 1,
    applesEaten: 0,
    specialsEaten: 0,
    combo: 0,
    maxCombo: 0,
    comboTimer: 0,
    length: 3,
    timeElapsed: 0,
    speedLevel: 1,
    pointsToNextLevel: 90,
  });

  const [buffs, setBuffs] = useState<ActiveBuff[]>([]);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => sound.getMuted());
  const [levelUpToast, setLevelUpToast] = useState<number | null>(null);
  const [gameKey, setGameKey] = useState(0); // Trigger canvas remount on restart

  const inputDirectionRef = useRef<Direction | null>(null);

  // Highest score in current mode
  const highScore = Math.max(
    0,
    ...scores.filter((s) => s.mode === mode).map((s) => s.score)
  );

  // Save settings
  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('viper_settings', JSON.stringify(updated));
      return updated;
    });
  };

  // Save mode
  const handleSelectMode = (newMode: GameMode) => {
    setMode(newMode);
    localStorage.setItem('viper_mode', newMode);
  };

  // Save skin
  const handleSelectSkin = (newSkin: SnakeSkinId) => {
    setSkinId(newSkin);
    localStorage.setItem('viper_skin', newSkin);
  };

  // Save new score
  const handleSaveScore = (entry: Omit<ScoreEntry, 'id' | 'date'>) => {
    const newEntry: ScoreEntry = {
      ...entry,
      id: `score_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newEntry, ...scores];
    setScores(updated);
    localStorage.setItem('viper_scores', JSON.stringify(updated));
  };

  const handleClearScores = () => {
    setScores([]);
    localStorage.removeItem('viper_scores');
  };

  const handleStartGame = () => {
    sound.playClick();
    setGameKey((k) => k + 1);
    setGameState('PLAYING');
  };

  const handleRestart = () => {
    sound.playClick();
    setGameKey((k) => k + 1);
    setGameState('PLAYING');
  };

  const handleQuitToMenu = () => {
    sound.playClick();
    setGameState('TITLE_MENU');
  };

  const handleTogglePause = useCallback(() => {
    if (gameState === 'PLAYING') {
      sound.playClick();
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      sound.playClick();
      setGameState('PLAYING');
    }
  }, [gameState]);

  const handleToggleMute = useCallback(() => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    handleUpdateSettings({ soundEnabled: !nextMuted });
  }, []);

  const handleLevelUpAlert = useCallback((level: number) => {
    setLevelUpToast(level);
    setTimeout(() => {
      setLevelUpToast(null);
    }, 2400);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      // Do not capture if typing in input
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handleToggleMute();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'TITLE_MENU') {
          handleStartGame();
        } else if (gameState === 'GAME_OVER') {
          handleRestart();
        } else {
          handleTogglePause();
        }
      } else if (e.key === 'Enter') {
        if (gameState === 'TITLE_MENU') {
          handleStartGame();
        } else if (gameState === 'GAME_OVER') {
          handleRestart();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        if (gameState === 'PLAYING' || gameState === 'PAUSED') {
          e.preventDefault();
          handleRestart();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (isLeaderboardOpen) {
          setIsLeaderboardOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (gameState === 'PAUSED') {
          setGameState('PLAYING');
        } else if (gameState === 'PLAYING') {
          setGameState('PAUSED');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [gameState, isLeaderboardOpen, isSettingsOpen, handleToggleMute, handleTogglePause]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#070b12] text-slate-100 flex flex-col justify-center items-center">
      {/* Title Screen View */}
      {gameState === 'TITLE_MENU' && (
        <TitleScreen
          mode={mode}
          skinId={skinId}
          highScore={highScore}
          isMuted={isMuted}
          onSelectMode={handleSelectMode}
          onSelectSkin={handleSelectSkin}
          onStartGame={handleStartGame}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Active Game / Play View */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED' || gameState === 'GAME_OVER') && (
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Top & Bottom Perimeter HUD */}
          <HUD
            stats={stats}
            buffs={buffs}
            mode={mode}
            skinId={skinId}
            highScore={highScore}
            isPaused={gameState === 'PAUSED'}
            isMuted={isMuted}
            onTogglePause={handleTogglePause}
            onToggleMute={handleToggleMute}
            onRestart={handleRestart}
            onQuitToMenu={handleQuitToMenu}
          />

          {/* Canvas Viewport */}
          <SnakeCanvas
            key={gameKey}
            mode={mode}
            skinId={skinId}
            settings={settings}
            isPaused={gameState === 'PAUSED'}
            onGameOver={(finalStats) => {
              setStats(finalStats);
              setGameState('GAME_OVER');
            }}
            onStatsUpdate={(newStats, newBuffs) => {
              setStats(newStats);
              setBuffs(newBuffs);
            }}
            onLevelUpAlert={handleLevelUpAlert}
            inputDirectionRef={inputDirectionRef}
          />

          {/* Level Up Banner Alert */}
          {levelUpToast && (
            <div className="absolute top-20 pointer-events-none z-30 animate-bounce flex flex-col items-center">
              <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500/90 to-teal-500/90 border border-emerald-300 shadow-[0_0_24px_rgba(16,185,129,0.7)] text-slate-950 font-black font-display tracking-widest text-lg">
                LEVEL UP: {levelUpToast}! VELOCITY INCREASED
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {gameState === 'PAUSED' && (
            <div className="absolute inset-0 z-40 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center p-6 bg-[#0b101d] border border-slate-800 rounded-2xl shadow-2xl max-w-xs w-full">
                <h3 className="text-2xl font-bold font-display text-white mb-1">PAUSED</h3>
                <p className="text-xs text-slate-400 mb-6 font-display">Press SPACE or Resume to continue</p>
                <div className="space-y-2">
                  <button
                    onClick={handleTogglePause}
                    className="w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-display text-xs tracking-wider transition-colors"
                  >
                    RESUME
                  </button>
                  <button
                    onClick={handleRestart}
                    className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium font-display text-xs transition-colors"
                  >
                    RESTART
                  </button>
                  <button
                    onClick={handleQuitToMenu}
                    className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-medium font-display text-xs transition-colors"
                  >
                    QUIT TO MENU
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {gameState === 'GAME_OVER' && (
            <GameOverModal
              stats={stats}
              mode={mode}
              skinId={skinId}
              highScore={highScore}
              onRestart={handleRestart}
              onQuitToMenu={handleQuitToMenu}
              onSaveScore={handleSaveScore}
              onViewLeaderboard={() => setIsLeaderboardOpen(true)}
            />
          )}

          {/* Mobile Touch Controls */}
          <MobileControls
            onDirection={(dir) => {
              inputDirectionRef.current = dir;
            }}
            onPause={handleTogglePause}
          />
        </div>
      )}

      {/* Hall of Fame / Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          scores={scores}
          onClose={() => setIsLeaderboardOpen(false)}
          onClearScores={handleClearScores}
        />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
}
