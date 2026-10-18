import React from 'react';
import { Direction } from '../types/game';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { sound } from '../utils/audio';

interface MobileControlsProps {
  onDirection: (dir: Direction) => void;
  onPause: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onDirection,
  onPause,
}) => {
  const handlePress = (dir: Direction) => {
    sound.playClick();
    onDirection(dir);
  };

  return (
    <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-30 select-none pointer-events-auto">
      <div className="relative w-44 h-44 bg-slate-900/60 backdrop-blur-md rounded-full border border-slate-700/60 p-2 shadow-2xl">
        {/* UP */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handlePress('UP');
          }}
          onClick={() => handlePress('UP')}
          aria-label="Up"
          className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-slate-800/80 active:bg-emerald-500/40 border border-slate-700 active:border-emerald-400 flex items-center justify-center text-slate-200 active:text-white shadow-md transition-all active:scale-95"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* DOWN */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handlePress('DOWN');
          }}
          onClick={() => handlePress('DOWN')}
          aria-label="Down"
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-12 rounded-xl bg-slate-800/80 active:bg-emerald-500/40 border border-slate-700 active:border-emerald-400 flex items-center justify-center text-slate-200 active:text-white shadow-md transition-all active:scale-95"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* LEFT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handlePress('LEFT');
          }}
          onClick={() => handlePress('LEFT')}
          aria-label="Left"
          className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-slate-800/80 active:bg-emerald-500/40 border border-slate-700 active:border-emerald-400 flex items-center justify-center text-slate-200 active:text-white shadow-md transition-all active:scale-95"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* RIGHT */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handlePress('RIGHT');
          }}
          onClick={() => handlePress('RIGHT')}
          aria-label="Right"
          className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-slate-800/80 active:bg-emerald-500/40 border border-slate-700 active:border-emerald-400 flex items-center justify-center text-slate-200 active:text-white shadow-md transition-all active:scale-95"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Center Pause Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            sound.playClick();
            onPause();
          }}
          onClick={() => {
            sound.playClick();
            onPause();
          }}
          aria-label="Pause"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 active:text-white active:bg-amber-500/30 shadow transition-all active:scale-95"
        >
          <Pause className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
