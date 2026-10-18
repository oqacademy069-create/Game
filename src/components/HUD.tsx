import React from 'react';
import { ActiveBuff, GameMode, GameStats, SnakeSkinId } from '../types/game';
import { SKINS, SPEED_LEVELS } from '../utils/maps';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Home, Zap, Shield, Sparkles, Magnet } from 'lucide-react';

interface HUDProps {
  stats: GameStats;
  buffs: ActiveBuff[];
  mode: GameMode;
  skinId: SnakeSkinId;
  highScore: number;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
  onQuitToMenu: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  buffs,
  mode,
  skinId,
  highScore,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onRestart,
  onQuitToMenu,
}) => {
  const skin = SKINS[skinId] || SKINS.emerald;
  const currentSpeed = SPEED_LEVELS[Math.min(SPEED_LEVELS.length - 1, Math.max(0, stats.level - 1))];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 md:p-6 z-10 select-none">
      {/* Top Perimeter Status Cluster */}
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Score & High Score */}
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 block font-display">
              Score
            </span>
            <div className="text-2xl md:text-3xl font-bold font-mono-nums text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-800" />

          <div>
            <span className="text-[10px] tracking-wider uppercase text-slate-400 block font-display">
              Best
            </span>
            <div className="text-xl md:text-2xl font-bold font-mono-nums text-slate-300">
              {Math.max(highScore, stats.score).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Center: Level & Speedometer */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="flex items-center gap-2 text-xs font-display text-slate-300">
            <span className="text-emerald-400 font-bold">LEVEL {stats.level}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 uppercase tracking-wider">{currentSpeed.name} SPEED</span>
          </div>

          {/* Speed / Next Level progress bar */}
          <div className="w-36 h-1.5 bg-slate-800/80 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300"
              style={{
                width: `${Math.min(100, ((stats.score % 90) / 90) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-800">
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onTogglePause}
            title={isPaused ? 'Resume (Space)' : 'Pause (Space)'}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            onClick={onRestart}
            title="Quick Restart (R)"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onQuitToMenu}
            title="Quit to Menu (Esc)"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Middle Floating Sidebars: Combo and Buffs */}
      <div className="w-full flex items-center justify-between">
        {/* Left: Combo Meter */}
        <div className="w-32">
          {stats.combo > 1 && (
            <div className="animate-pulse-glow transition-all">
              <div className="flex items-baseline gap-1.5 font-display">
                <span className="text-xl md:text-2xl font-black text-amber-400 italic">
                  {stats.combo}x
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-200/80">
                  STREAK
                </span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800/80 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{ width: `${Math.max(0, stats.comboTimer * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Active Buffs */}
        <div className="flex flex-col items-end gap-1.5">
          {buffs.map((buff) => {
            const pct = Math.max(0, Math.min(100, (buff.remainingMs / buff.totalMs) * 100));
            return (
              <div
                key={buff.type}
                className="flex items-center gap-2 text-right transition-all"
              >
                <div className="w-20">
                  <div className="flex justify-between items-center text-[10px] font-display font-semibold uppercase" style={{ color: buff.color }}>
                    <span>{buff.name}</span>
                    <span className="font-mono-nums">{(buff.remainingMs / 1000).toFixed(1)}s</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-0.5">
                    <div
                      className="h-full transition-all duration-100"
                      style={{ width: `${pct}%`, backgroundColor: buff.color }}
                    />
                  </div>
                </div>
                <div
                  className="w-5 h-5 rounded flex items-center justify-center border"
                  style={{ borderColor: buff.color, backgroundColor: `${buff.color}22` }}
                >
                  {buff.type === 'SPEED_BOOST' && <Zap className="w-3 h-3 text-orange-400" />}
                  {buff.type === 'SLOW_MO' && <Sparkles className="w-3 h-3 text-cyan-400" />}
                  {buff.type === 'GHOST' && <Shield className="w-3 h-3 text-purple-400" />}
                  {buff.type === 'MAGNET' && <Magnet className="w-3 h-3 text-blue-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Perimeter: Minimal telemetry footer */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 font-display">
        <div className="flex items-center gap-3">
          <span>MODE: <strong className="text-slate-300 font-semibold">{mode}</strong></span>
          <span className="text-slate-700">·</span>
          <span>LENGTH: <strong className="text-slate-300 font-mono-nums">{stats.length}</strong></span>
          <span className="text-slate-700">·</span>
          <span>TIME: <strong className="text-slate-300 font-mono-nums">{Math.floor(stats.timeElapsed / 60)}:{String(stats.timeElapsed % 60).padStart(2, '0')}</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-slate-500">
          <span>WASD / Arrows to Slither</span>
          <span className="text-slate-700">·</span>
          <span>Space to Pause</span>
        </div>
      </div>
    </div>
  );
};
