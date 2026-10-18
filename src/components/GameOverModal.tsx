import React, { useState, useEffect } from 'react';
import { GameMode, GameStats, ScoreEntry, SnakeSkinId } from '../types/game';
import { RotateCcw, Home, Trophy, Award, Flame, Apple, Timer } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  stats: GameStats;
  mode: GameMode;
  skinId: SnakeSkinId;
  highScore: number;
  onRestart: () => void;
  onQuitToMenu: () => void;
  onSaveScore: (entry: Omit<ScoreEntry, 'id' | 'date'>) => void;
  onViewLeaderboard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  mode,
  skinId,
  highScore,
  onRestart,
  onQuitToMenu,
  onSaveScore,
  onViewLeaderboard,
}) => {
  const isNewHighScore = stats.score > highScore && stats.score > 0;
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('viper_player_name') || 'VIPER';
  });
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    if (isNewHighScore) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#06b6d4', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isNewHighScore]);

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = playerName.trim().toUpperCase().slice(0, 10) || 'VIPER';
    localStorage.setItem('viper_player_name', cleanName);
    onSaveScore({
      name: cleanName,
      score: stats.score,
      level: stats.level,
      apples: stats.applesEaten,
      maxCombo: stats.maxCombo,
      mode,
      skin: skinId,
    });
    setHasSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-md bg-[#0a0f1d] border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-xs font-display tracking-widest uppercase text-rose-500 font-semibold mb-1">
            CIRCUIT TERMINATED
          </div>
          <h2 className="text-3xl font-extrabold font-display text-white tracking-wide">
            GAME OVER
          </h2>

          {isNewHighScore && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/15 border border-amber-500/30 rounded-full text-xs font-semibold text-amber-300 animate-pulse">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          )}
        </div>

        {/* Score Readout Display */}
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 text-center mb-5">
          <span className="text-[11px] font-display uppercase tracking-wider text-slate-400 block">
            Final Score
          </span>
          <div className="text-4xl font-extrabold font-mono-nums text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.3)] mt-1">
            {stats.score.toLocaleString()}
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-5">
          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-display">LEVEL REACHED</span>
              <span className="font-bold text-slate-200 font-mono-nums">Level {stats.level}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center gap-2.5">
            <Apple className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-display">APPLES EATEN</span>
              <span className="font-bold text-slate-200 font-mono-nums">{stats.applesEaten} Items</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center gap-2.5">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-display">MAX STREAK</span>
              <span className="font-bold text-slate-200 font-mono-nums">{stats.maxCombo}x Combo</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 flex items-center gap-2.5">
            <Timer className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-display">SURVIVAL TIME</span>
              <span className="font-bold text-slate-200 font-mono-nums">
                {Math.floor(stats.timeElapsed / 60)}m {stats.timeElapsed % 60}s
              </span>
            </div>
          </div>
        </div>

        {/* Score Submission Form */}
        {!hasSaved ? (
          <form onSubmit={handleSubmitScore} className="mb-5">
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                placeholder="PILOT NAME"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono tracking-wider text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold font-display text-white transition-colors"
              >
                SAVE RECORD
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-2 text-xs font-display text-emerald-400 mb-5">
            Record logged to Leaderboard!
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold font-display text-sm tracking-wide shadow-lg shadow-emerald-500/20 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => {
                sound.playClick();
                onViewLeaderboard();
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Scoreboard</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onQuitToMenu();
              }}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
