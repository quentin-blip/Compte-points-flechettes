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
    <div className="w-full max-w-md mx-auto mb-4">
      {/* Active Player Large Display */}
      {players.map((player) => {
        const isActive = player.id === currentPlayerId;
        if (!isActive) return null;

        const liveScore = player.score; 

        return (
            <div key={player.id} className="bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-700 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-white">{player.name}</h2>
                        <p className="text-slate-400 text-sm">Avg: {player.wins} wins</p>
                    </div>
                    <div className="text-right">
                        <div className="text-6xl font-black text-white tracking-tighter leading-none">
                            {liveScore}
                        </div>
                    </div>
                </div>

                {/* Turn Indicators */}
                <div className="flex justify-between items-end mt-4 bg-slate-900/50 p-3 rounded-xl">
                     <div className="flex gap-2">
                        {[0, 1, 2].map((i) => {
                            const t = currentTurnThrows[i];
                            return (
                                <div key={i} className="flex flex-col items-center gap-1">
                                    <div className={`w-10 h-12 rounded flex items-center justify-center font-bold text-lg border-2 ${
                                        t ? 'border-emerald-500/50 bg-emerald-900/20 text-emerald-400' : 'border-slate-700 bg-slate-800 text-slate-600'
                                    }`}>
                                        {t ? (t.scoreValue === 0 ? 'X' : `${getMultiplierLabel(t.multiplier)}${t.scoreValue}`) : '-'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-right">
                        <span className="text-slate-500 text-xs uppercase tracking-widest font-semibold">This Turn</span>
                        <div className="text-3xl font-bold text-emerald-400">
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
                <div key={player.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 opacity-70">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-300 truncate mr-2">{player.name}</span>
                        <span className="font-bold text-xl text-white">{player.score}</span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};
