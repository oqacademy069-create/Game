import React, { useState } from 'react';
import { GameMode, SnakeSkinId } from '../types/game';
import { SKINS } from '../utils/maps';
import { Play, Trophy, Sliders, Volume2, VolumeX, Shield, Zap, Sparkles, Magnet } from 'lucide-react';
import { sound } from '../utils/audio';

interface TitleScreenProps {
  mode: GameMode;
  skinId: SnakeSkinId;
  highScore: number;
  isMuted: boolean;
  onSelectMode: (mode: GameMode) => void;
  onSelectSkin: (skinId: SnakeSkinId) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  mode,
  skinId,
  highScore,
  isMuted,
  onSelectMode,
  onSelectSkin,
  onStartGame,
  onOpenLeaderboard,
  onOpenSettings,
  onToggleMute,
}) => {
  const [activeTab, setActiveTab] = useState<'MODE' | 'SKINS' | 'POWERUPS'>('MODE');

  const modes: { id: GameMode; name: string; tag: string; desc: string }[] = [
    {
      id: 'CLASSIC',
      name: 'Classic Arena',
      tag: 'Progressive Spikes',
      desc: 'Pure arcade snake with hazard spikes spawning as speed levels climb.',
    },
    {
      id: 'MAZE',
      name: 'Labyrinth',
      tag: 'Tactical Vaults',
      desc: 'Complex stone corridors, corner brackets, and narrow chokepoints.',
    },
    {
      id: 'HAZARDS',
      name: 'Laser Matrix',
      tag: 'Dynamic Traps',
      desc: 'Timed electric laser gates that switch states and electric hazards.',
    },
    {
      id: 'PORTALS',
      name: 'Warp Portals',
      tag: 'Spatial Wormholes',
      desc: 'Paired quantum portals teleport your serpent instantly across the arena.',
    },
  ];

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      {/* Ambient background grid with glowing radial vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/60 via-[#070b12] to-[#04060a] -z-10 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none -z-10"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
        }}
      />

      {/* Top Bar: Best Score, Mute, Settings */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 text-xs font-medium text-slate-300 transition-colors shadow-sm"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenSettings();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 text-xs font-medium text-slate-300 transition-colors shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span>Options</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] tracking-wider uppercase text-slate-400 block font-display">
              High Score
            </span>
            <span className="text-base font-bold font-mono-nums text-emerald-400">
              {highScore.toLocaleString()}
            </span>
          </div>

          <button
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-colors"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center z-10 max-w-xl">
        {/* Title Lockup SVG */}
        <div className="relative mb-3 flex items-center justify-center">
          <svg className="w-64 sm:w-80 h-20" viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="viperGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Circuit background traces */}
            <path d="M20 40 H70 L90 20 H230 L250 40 H300" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="20" cy="40" r="3" fill="#10b981" fillOpacity="0.4" />
            <circle cx="300" cy="40" r="3" fill="#06b6d4" fillOpacity="0.4" />

            {/* Stylized Serpent Fang Icon */}
            <path
              d="M160 12 L168 28 L160 38 L152 28 Z"
              fill="url(#viperGlow)"
              filter="url(#neonFilter)"
            />

            {/* VIPER GRID text */}
            <text
              x="160"
              y="68"
              textAnchor="middle"
              className="font-display font-black"
              fill="url(#viperGlow)"
              fontSize="34"
              letterSpacing="6"
              filter="url(#neonFilter)"
            >
              VIPER GRID
            </text>
          </svg>
        </div>

        <p className="text-slate-400 text-sm mb-6 max-w-md font-sans">
          Navigate cyber arenas, dodge dynamic hazard traps, swallow power cores, and survive accelerating velocity.
        </p>

        {/* Primary Start CTA Button */}
        <button
          onClick={() => {
            sound.playClick();
            onStartGame();
          }}
          className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold font-display text-base tracking-wide hover:from-emerald-400 hover:to-teal-400 shadow-[0_0_24px_rgba(16,185,129,0.35)] hover:shadow-[0_0_32px_rgba(16,185,129,0.55)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START SLITHER</span>
          <span className="text-xs font-mono-nums bg-black/20 px-2 py-0.5 rounded text-slate-950/90 ml-1">
            SPACE
          </span>
        </button>

        {/* Flat control-hint line */}
        <div className="mt-4 text-xs text-slate-400 tracking-wide font-display">
          <span>WASD / Arrows to Slither</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>Space to Pause</span>
          <span className="mx-2 text-slate-600">·</span>
          <span>M to Mute</span>
        </div>
      </div>

      {/* Bottom Segmented Controls: Mode / Skins / Powerups */}
      <div className="w-full max-w-2xl bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 z-10 mb-2 shadow-xl backdrop-blur-md">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-center gap-1 mb-3 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('MODE')}
            className={`px-4 py-1.5 text-xs font-display font-medium rounded-lg transition-colors ${
              activeTab === 'MODE'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Arena Map
          </button>
          <button
            onClick={() => setActiveTab('SKINS')}
            className={`px-4 py-1.5 text-xs font-display font-medium rounded-lg transition-colors ${
              activeTab === 'SKINS'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Serpent Skins
          </button>
          <button
            onClick={() => setActiveTab('POWERUPS')}
            className={`px-4 py-1.5 text-xs font-display font-medium rounded-lg transition-colors ${
              activeTab === 'POWERUPS'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fruit Guide
          </button>
        </div>

        {/* Tab 1: Arena Modes */}
        {activeTab === 'MODE' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {modes.map((m) => {
              const isSelected = mode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectMode(m.id);
                  }}
                  className={`text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                  }`}
                >
                  <div className="text-xs font-bold font-display text-slate-200">
                    {m.name}
                  </div>
                  <div className="text-[10px] text-emerald-400/90 mt-0.5">
                    {m.tag}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Snake Skins */}
        {activeTab === 'SKINS' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.values(SKINS).map((s) => {
              const isSelected = skinId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    sound.playClick();
                    onSelectSkin(s.id);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-lg border transition-all text-left ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                  }`}
                >
                  {/* Swatch */}
                  <div className="flex -space-x-1.5 items-center">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: s.headColor }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ backgroundColor: s.bodyColor }}
                    />
                    <div
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: s.accentColor }}
                    />
                  </div>
                  <div className="text-xs font-medium text-slate-300">
                    {s.name}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Fruit & Powerups Guide */}
        {activeTab === 'POWERUPS' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <div>
                <span className="font-semibold text-slate-300 block">Ruby Apple</span>
                <span className="text-[10px] text-slate-400">+10 pts · Growth</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              <div>
                <span className="font-semibold text-slate-300 block">Golden Core</span>
                <span className="text-[10px] text-slate-400">+50 pts · Timed</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
              <div>
                <span className="font-semibold text-slate-300 block">Turbo Boost</span>
                <span className="text-[10px] text-slate-400">2x Score Multiplier</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <div>
                <span className="font-semibold text-slate-300 block">Chill Slow-Mo</span>
                <span className="text-[10px] text-slate-400">Halves game velocity</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <div>
                <span className="font-semibold text-slate-300 block">Ghost Phase</span>
                <span className="text-[10px] text-slate-400">Phase through walls</span>
              </div>
            </div>

            <div className="p-2 rounded bg-slate-900/40 border border-slate-800/80 flex items-center gap-2">
              <Magnet className="w-3.5 h-3.5 text-blue-400" />
              <div>
                <span className="font-semibold text-slate-300 block">Magnet Orb</span>
                <span className="text-[10px] text-slate-400">Draws nearby food</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
