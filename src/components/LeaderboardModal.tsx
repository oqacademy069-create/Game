import React, { useState } from 'react';
import { GameMode, ScoreEntry } from '../types/game';
import { X, Trophy, Medal, Trash2 } from 'lucide-react';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  scores: ScoreEntry[];
  onClose: () => void;
  onClearScores: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  scores,
  onClose,
  onClearScores,
}) => {
  const [filterMode, setFilterMode] = useState<GameMode | 'ALL'>('ALL');

  const filteredScores = scores
    .filter((s) => filterMode === 'ALL' || s.mode === filterMode)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="w-full max-w-lg bg-[#0b101d] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-lg font-bold font-display text-white">
                HALL OF FAME
              </h3>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-display block">
                Top Arcade Records
              </span>
            </div>
          </div>

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

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 my-4 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80">
          {(['ALL', 'CLASSIC', 'MAZE', 'HAZARDS', 'PORTALS'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                setFilterMode(m);
              }}
              className={`flex-1 py-1 text-[11px] font-display font-medium rounded transition-colors ${
                filterMode === m
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'ALL' ? 'ALL MODES' : m}
            </button>
          ))}
        </div>

        {/* Scores List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredScores.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs font-display">
              No flight records found for this category yet.
            </div>
          ) : (
            filteredScores.map((entry, index) => {
              const rank = index + 1;
              return (
                <div
                  key={entry.id || index}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    rank === 1
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-sm'
                      : rank === 2
                      ? 'bg-slate-900/60 border-slate-700'
                      : rank === 3
                      ? 'bg-slate-900/40 border-amber-800/30'
                      : 'bg-slate-900/20 border-slate-800/60'
                  }`}
                >
                  {/* Left: Rank & Pilot */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center font-display font-bold">
                      {rank === 1 ? (
                        <Medal className="w-4 h-4 text-amber-400 mx-auto" />
                      ) : rank === 2 ? (
                        <Medal className="w-4 h-4 text-slate-300 mx-auto" />
                      ) : rank === 3 ? (
                        <Medal className="w-4 h-4 text-amber-700 mx-auto" />
                      ) : (
                        <span className="text-xs text-slate-500 font-mono-nums">#{rank}</span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold font-display text-slate-200 tracking-wider">
                        {entry.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-display flex items-center gap-1.5 mt-0.5">
                        <span>Lvl {entry.level}</span>
                        <span>·</span>
                        <span>{entry.apples} Apples</span>
                        <span>·</span>
                        <span>{entry.maxCombo}x Streak</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Score */}
                  <div className="text-right">
                    <div className="text-sm font-extrabold font-mono-nums text-emerald-400">
                      {entry.score.toLocaleString()}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono-nums">
                      {entry.date}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => {
              if (confirm('Clear all scoreboard records?')) {
                onClearScores();
              }
            }}
            className="flex items-center gap-1.5 text-slate-500 hover:text-rose-400 transition-colors font-display"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Records</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-display font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
