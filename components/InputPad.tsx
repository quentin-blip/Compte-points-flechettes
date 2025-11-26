import React, { useState } from 'react';
import { Multiplier } from '../types';

interface InputPadProps {
  onSubmitThrow: (value: number, multiplier: Multiplier) => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const InputPad: React.FC<InputPadProps> = ({ onSubmitThrow, onUndo, canUndo }) => {
  const [selectedMultiplier, setSelectedMultiplier] = useState<Multiplier>(Multiplier.Single);

  const handleNumberClick = (val: number) => {
    onSubmitThrow(val, selectedMultiplier);
    // Reset multiplier after throw for better UX
    setSelectedMultiplier(Multiplier.Single);
  };

  const toggleMultiplier = (m: Multiplier) => {
    setSelectedMultiplier(selectedMultiplier === m ? Multiplier.Single : m);
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  return (
    <div className="flex flex-col gap-3 w-full max-w-md mx-auto p-1">
      {/* Multiplier Row */}
      <div className="grid grid-cols-3 gap-3 h-14">
        <button
          onClick={() => toggleMultiplier(Multiplier.Double)}
          className={`rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-sm border ${
            selectedMultiplier === Multiplier.Double
              ? 'bg-rose-500 border-rose-600 text-white shadow-rose-200 dark:shadow-rose-900/40'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20'
          }`}
        >
          Double
        </button>
        <button
          onClick={() => toggleMultiplier(Multiplier.Triple)}
          className={`rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-sm border ${
            selectedMultiplier === Multiplier.Triple
              ? 'bg-amber-400 border-amber-500 text-white shadow-amber-100 dark:shadow-amber-900/40'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-amber-500 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20'
          }`}
        >
          Triple
        </button>
        <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`rounded-xl font-bold transition-all border ${
                canUndo 
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
            }`}
            >
            Undo
        </button>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 gap-2">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:bg-emerald-500 dark:active:bg-emerald-600 active:text-white dark:active:text-white text-slate-700 dark:text-slate-200 font-bold text-xl h-14 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        
        {/* Bottom Row: 25/Bull, 0/Miss */}
        <button
          onClick={() => handleNumberClick(25)}
          className="col-span-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-lg h-14 rounded-xl shadow-md shadow-emerald-200 dark:shadow-emerald-900/50 transition-colors flex items-center justify-center gap-2"
        >
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white/50"></div>
            BULL
        </button>
        
        <button
          onClick={() => handleNumberClick(0)}
          className="col-span-3 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800 font-bold text-lg h-14 rounded-xl transition-colors"
        >
          MISS
        </button>
      </div>
    </div>
  );
};