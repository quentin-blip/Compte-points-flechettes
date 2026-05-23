import { motion } from 'motion/react';
import React from 'react';
import { Throw } from '../types';
import { DARTBOARD_NUMBERS } from '../constants';

interface PrecisionAnalysisProps {
  history: Throw[];
  playerId: string;
  forcedTargetZones?: number[];
}

export const PrecisionAnalysis: React.FC<PrecisionAnalysisProps> = ({ history, playerId, forcedTargetZones }) => {
  const playerThrows = history.filter(t => t.playerId === playerId);
  if (playerThrows.length === 0) return null;

  // 1. Target Selection: Forced (Training) or Auto-Detected (Match)
  let targetNumbers: number[] = [];
  
  if (forcedTargetZones && forcedTargetZones.length > 0) {
    targetNumbers = forcedTargetZones;
  } else {
    const numberCounts: Record<number, number> = {};
    playerThrows.forEach(t => {
      if (t.scoreValue > 0) {
        numberCounts[t.scoreValue] = (numberCounts[t.scoreValue] || 0) + 1;
      }
    });

    const sortedNumbers = Object.entries(numberCounts)
      .map(([val, count]) => ({ val: parseInt(val), count }))
      .sort((a, b) => b.count - a.count);

    if (sortedNumbers.length > 0) {
      const primaryNum = sortedNumbers[0].val;
      const primaryCount = sortedNumbers[0].count;
      targetNumbers.push(primaryNum);
      if (sortedNumbers.length > 1 && sortedNumbers[1].count >= primaryCount * 0.25) {
        targetNumbers.push(sortedNumbers[1].val);
      }
    }
  }

  if (targetNumbers.length === 0) return null;

  // 2. Neighbor Logic
  const getNeighbors = (val: number) => {
    if (val === 0 || val === 25) return []; 
    const idx = DARTBOARD_NUMBERS.indexOf(val);
    const prev = DARTBOARD_NUMBERS[(idx - 1 + 20) % 20];
    const next = DARTBOARD_NUMBERS[(idx + 1) % 20];
    return [prev, next];
  };

  const allTargetNeighbors = new Set<number>();
  targetNumbers.forEach(num => {
    getNeighbors(num).forEach(n => allTargetNeighbors.add(n));
  });

  // 3. Score Calculation (100/40/0 rule)
  let totalScore = 0;
  playerThrows.forEach(t => {
    if (targetNumbers.includes(t.scoreValue)) {
      totalScore += 100;
    } else if (allTargetNeighbors.has(t.scoreValue)) {
      totalScore += 40;
    }
  });

  const finalPrecision = Math.round(totalScore / playerThrows.length);
  const cappedPrecision = Math.min(100, finalPrecision);

  // 4. Advanced Stats
  const ppd = playerThrows.length > 0 
    ? (playerThrows.reduce((sum, t) => sum + t.totalPoints, 0) / playerThrows.length).toFixed(1) 
    : '0';

  const hitRate = playerThrows.length > 0 
    ? Math.round((playerThrows.filter(t => targetNumbers.includes(t.scoreValue)).length / playerThrows.length) * 100) 
    : 0;

  // Calculate best turn (3 consecutive darts)
  let bestTurn = 0;
  for (let i = 0; i <= playerThrows.length - 3; i += 3) {
    const turnSum = playerThrows[i].totalPoints + playerThrows[i+1].totalPoints + playerThrows[i+2].totalPoints;
    if (turnSum > bestTurn) bestTurn = turnSum;
  }

  const multiplierCounts = {
    single: playerThrows.filter(t => t.multiplier === 1).length,
    double: playerThrows.filter(t => t.multiplier === 2).length,
    triple: playerThrows.filter(t => t.multiplier === 3).length,
  };

  const getColors = (score: number) => {
    if (score >= 70) return { text: 'text-emerald-500', stroke: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 40) return { text: 'text-amber-500', stroke: 'text-amber-500', bg: 'bg-amber-500' };
    return { text: 'text-rose-500', stroke: 'text-rose-500', bg: 'bg-rose-500' };
  };

  const theme = getColors(finalPrecision);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="mt-4 p-6 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-visible">
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1 pr-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block mb-4">Indice de Précision</span>
          <div className="flex flex-wrap gap-2">
            {targetNumbers.map(num => (
              <div key={num} className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black shadow-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${theme.bg} animate-pulse`}></div>
                Case <span className="text-emerald-500">#{num === 25 ? 'BULL' : num}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-shrink-0 w-24 h-24">
            <svg 
              className="w-full h-full transform -rotate-90 drop-shadow-xl overflow-visible"
              viewBox="0 0 100 100"
            >
                <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-200 dark:text-slate-800" />
                <motion.circle 
                  cx="50" cy="50" r={radius} 
                  stroke="currentColor" strokeWidth="12" fill="transparent" 
                  strokeDasharray={circumference} 
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: circumference * (1 - cappedPrecision / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${theme.stroke}`} 
                  strokeLinecap="round" 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                   key={cappedPrecision}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`text-2xl font-black ${theme.text} leading-none tracking-tighter`}
                >
                    {cappedPrecision}
                </motion.span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">%</span>
            </div>
        </div>
      </div>

      {/* Grid de Stats Primaires */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-8 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center">
              <div className="text-lg font-black text-emerald-500 leading-tight">{ppd}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">PPD</div>
          </div>
          <div className="text-center border-x border-slate-200/50 dark:border-slate-800/50">
              <div className="text-lg font-black text-blue-500 leading-tight">{bestTurn}</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Max Turn</div>
          </div>
          <div className="text-center border-r border-slate-200/50 dark:border-slate-800/50">
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">{hitRate}%</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Hit Rate</div>
          </div>
          <div className="text-center sm:border-r border-slate-200/50 dark:border-slate-800/50">
              <div className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                  {playerThrows.filter(t => targetNumbers.includes(t.scoreValue)).length}
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]">Cible</div>
          </div>
          <div className="text-center col-span-3 sm:col-span-1 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50 dark:border-slate-800/50">
              <div className="text-lg font-black text-amber-500 leading-tight">
                  {playerThrows.filter(t => allTargetNeighbors.has(t.scoreValue)).length}
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em]" title="Déviation : Fléchettes ayant touché les secteurs voisins directs de la cible">Dév.</div>
          </div>
      </div>

      {/* Breakdown Multiplicateurs */}
      <div className="space-y-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 block">Répartition Multiplicateurs</span>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <div className="bg-emerald-400 transition-all duration-500" style={{ width: `${(multiplierCounts.single / playerThrows.length) * 100}%` }}></div>
              <div className="bg-blue-400 transition-all duration-500" style={{ width: `${(multiplierCounts.double / playerThrows.length) * 100}%` }}></div>
              <div className="bg-purple-400 transition-all duration-500" style={{ width: `${(multiplierCounts.triple / playerThrows.length) * 100}%` }}></div>
          </div>
          <div className="flex justify-between text-[8px] font-black uppercase text-slate-500">
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> S ({multiplierCounts.single})</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> D ({multiplierCounts.double})</div>
              <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> T ({multiplierCounts.triple})</div>
          </div>
      </div>
    </div>
  );
};