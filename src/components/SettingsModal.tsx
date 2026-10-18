import React from 'react';
import { GameSettings } from '../types/game';
import { X, Volume2, Grid, Smartphone, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-md bg-[#0b101d] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h3 className="text-lg font-bold font-display text-white">
            GAME SETTINGS
          </h3>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-4 space-y-5 text-xs">
          {/* Sound Audio */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-slate-200 block font-display">Audio Synthesizer</span>
                <span className="text-[10px] text-slate-400">Procedural retro sound effects</span>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !settings.soundEnabled;
                sound.setMuted(!next);
                onUpdateSettings({ soundEnabled: next });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Arena Grid Size */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Grid className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-semibold text-slate-200 block font-display">Grid Dimensions</span>
                <span className="text-[10px] text-slate-400">Number of tiles in the playing arena</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {([20, 25, 30] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    sound.playClick();
                    onUpdateSettings({ gridSize: sz });
                  }}
                  className={`py-2 rounded-lg border font-display text-xs transition-colors ${
                    settings.gridSize === sz
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-400'
                      : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white'
                  }`}
                >
                  {sz}x{sz} {sz === 25 ? '(Default)' : sz === 20 ? '(Fast)' : '(Spacious)'}
                </button>
              ))}
            </div>
          </div>

          {/* Border Behavior */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-semibold text-slate-200 block font-display">Wrap-Around Borders</span>
                <span className="text-[10px] text-slate-400">Passing edges teleports to opposite side</span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ wrapBorders: !settings.wrapBorders });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.wrapBorders ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.wrapBorders ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Mobile On-Screen Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-semibold text-slate-200 block font-display">On-Screen D-Pad</span>
                <span className="text-[10px] text-slate-400">Show tactile virtual directional pad</span>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateSettings({ touchControls: !settings.touchControls });
              }}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.touchControls ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.touchControls ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-display font-semibold transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
