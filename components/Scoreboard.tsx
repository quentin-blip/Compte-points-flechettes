import React from 'react';
import { Player, Throw } from '../types';
import { MAX_THROWS_PER_TURN, getMultiplierLabel } from '../constants';

interface ScoreboardProps {
  players: Player[];
  currentPlayerId: string;
  currentTurnThrows: Throw[];
  scoreAtStartOfTurn: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPlayerId,
  currentTurnThrows,
  scoreAtStartOfTurn
}) => {
    // Calculate current turn total
    const currentTurnTotal = currentTurnThrows.reduce((acc, t) => acc + t.totalPoints, 0);

  return (
    <div className="w-full max-w-md mx-auto mb-6">
      {/* Active Player Large Display */}
      {players.map((player) => {
        const isActive = player.id === currentPlayerId;
        if (!isActive) return null;

        const liveScore = player.score; 

        return (
            <div key={player.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-700 mb-6 relative overflow-hidden transition-colors">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-500"></div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">{player.name}</h2>
                        <p className="text-slate-400 dark:text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">{player.wins} wins</p>
                    </div>
                    <div className="text-right">
                        <div className="text-7xl font-black text-slate-800 dark:text-white tracking-tighter leading-none">
                            {liveScore}
                        </div>
                    </div>
                </div>

                {/* Turn Indicators */}
                <div className="flex justify-between items-end mt-6 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-100/80 dark:border-slate-800">
                     <div className="flex gap-2">
                        {[0, 1, 2].map((i) => {
                            const t = currentTurnThrows[i];
                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-12 h-14 rounded-xl flex items-center justify-center font-bold text-xl border transition-all ${
                                        t 
                                        ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                    }`}>
                                        {t ? (t.scoreValue === 0 ? 'X' : `${getMultiplierLabel(t.multiplier)}${t.scoreValue}`) : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-widest font-bold">Current Turn</span>
                        <div className="text-4xl font-bold text-emerald-500 dark:text-emerald-400 leading-none mt-1">
                            {currentTurnTotal}
                        </div>
                    </div>
                </div>
            </div>
        );
      })}

      {/* Other Players List (Compact) */}
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => {
            const isActive = player.id === currentPlayerId;
            if (isActive) return null; // Already shown
            return (
                <div key={player.id} className="bg-white dark:bg-slate-800 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm opacity-80">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-500 dark:text-slate-400 truncate mr-2 text-sm">{player.name}</span>
                        <span className="font-bold text-xl text-slate-700 dark:text-slate-200">{player.score}</span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};