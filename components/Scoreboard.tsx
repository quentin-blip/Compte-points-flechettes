import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Player, Throw, GameMode, GameConfig } from '../types';
import { getMultiplierLabel, MAX_THROWS_PER_TURN } from '../constants';
import { getCheckout } from '../services/checkoutService';

interface ScoreboardProps {
  players: Player[];
  currentPlayerId: string;
  currentTurnThrows: Throw[];
  scoreAtStartOfTurn: number;
  history: Throw[];
  finishedPlayerIds: string[];
  totalLegs: number;
  currentLeg: number;
  config: GameConfig | null;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  currentPlayerId,
  currentTurnThrows,
  history,
  currentLeg,
  config
}) => {
    const currentTurnTotal = currentTurnThrows.reduce((acc, t) => acc + t.totalPoints, 0);
    const isTraining = config?.mode === GameMode.Training;

    const getPlayerDartCount = (playerId: string) => {
      return history.filter(t => t.playerId === playerId && t.legId === currentLeg).length;
    };

    const currentPlayer = players.find(p => p.id === currentPlayerId);
    const dartsRemaining = MAX_THROWS_PER_TURN - currentTurnThrows.length;
    const checkout = !isTraining && currentPlayer ? getCheckout(currentPlayer.score, dartsRemaining) : null;
    const targetZones = isTraining ? config?.trainingConfig?.targetZones : null;

  return (
    <div className="w-full max-w-lg mx-auto mb-6">
      {/* Carte du joueur actif */}
      {players.map((player) => {
        const isActive = player.id === currentPlayerId;
        if (!isActive) return null;

        return (
            <div key={player.id} className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 sm:p-8 shadow-xl border border-slate-100 dark:border-slate-700 mb-6 relative overflow-hidden transition-all">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 bg-[length:200%_auto] animate-[gradient_3s_linear_infinite]"></div>
                
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{player.name}</h2>
                            <div className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                                {player.wins}W
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs font-black bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 mt-2">
                            <span className="tabular-nums leading-none">{getPlayerDartCount(player.id)} 🎯</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <motion.div 
                          key={`${player.id}-${player.score}`} 
                          initial={false}
                          animate={{ scale: [1, 1.2, 1], y: [0, -10, 0] }}
                          transition={{ duration: 0.3 }}
                          className="text-7xl sm:text-8xl font-black text-slate-800 dark:text-white tracking-tighter leading-none"
                        >
                            {player.score}
                        </motion.div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                     <div className="flex gap-2">
                        {[0, 1, 2].map((i) => {
                            const t = currentTurnThrows[i];
                            return (
                                <div key={i} className={`w-12 h-16 sm:w-14 sm:h-20 rounded-xl flex items-center justify-center font-black text-xl border transition-all duration-300 ${
                                    t ? 'animate-pop-in border-emerald-400 bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-800 text-slate-300'
                                }`}>
                                    {t ? (t.scoreValue === 0 ? 'X' : `${getMultiplierLabel(t.multiplier)}${t.scoreValue}`) : ''}
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-right">
                        <span className="text-slate-400 text-[9px] uppercase tracking-widest font-black block mb-0.5">Tour</span>
                        <div className="text-4xl sm:text-5xl font-black text-emerald-500 leading-none">{currentTurnTotal}</div>
                    </div>
                </div>

                {/* Suggestions / Cibles */}
                {(checkout || targetZones) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 animate-pop-in">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mr-1">
                      {isTraining ? 'Cibles :' : 'Finition :'}
                    </span>
                    {isTraining ? (
                      targetZones?.map(num => (
                        <span key={num} className="px-3 py-1 bg-blue-500/10 text-blue-500 text-[10px] font-black rounded-lg border border-blue-500/20">
                          #{num === 25 ? 'BULL' : num}
                        </span>
                      ))
                    ) : (
                      checkout?.map((step, idx) => (
                        <span key={idx} className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                          {step}
                        </span>
                      ))
                    )}
                  </div>
                )}
            </div>
        );
      })}

      {/* Mini cartes des autres joueurs */}
      <div className="grid grid-cols-2 gap-3">
        {players.map((player) => {
            if (player.id === currentPlayerId) return null;

            return (
                <div key={player.id} className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-[1.5rem] border border-slate-200 dark:border-slate-700 shadow-lg group">
                    <div className="flex justify-between items-center">
                        <div className="flex flex-col min-w-0">
                          <span className="font-black text-slate-700 dark:text-slate-300 truncate text-sm mb-0.5">{player.name}</span>
                          <div className="flex items-center gap-2 text-[10px] font-black tracking-tight mt-0.5">
                            <span className="text-emerald-500">{player.wins}W</span>
                            <span className="text-slate-400 tabular-nums ml-1">
                                {getPlayerDartCount(player.id)} 🎯
                            </span>
                          </div>
                        </div>
                        <motion.span 
                          key={`${player.id}-${player.score}`}
                          animate={{ color: ['#64748b', '#10b981', '#64748b'] }}
                          transition={{ duration: 0.5 }}
                          className="font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-200 tabular-nums"
                        >
                            {player.score}
                        </motion.span>
                    </div>
                </div>
            );
        })}
      </div>
    </div>
  );
};