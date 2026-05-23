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
    let m = selectedMultiplier;
    if (val === 25 && m === Multiplier.Triple) {
        m = Multiplier.Single;
    }
    onSubmitThrow(val, m);
    setSelectedMultiplier(Multiplier.Single);
  };

  const toggleMultiplier = (m: Multiplier) => {
    setSelectedMultiplier(selectedMultiplier === m ? Multiplier.Single : m);
  };

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

  const buttonBaseClass = "rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all duration-150 active:scale-95 shadow-sm border select-none touch-manipulation";

  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full p-2 max-w-lg mx-auto">
      {/* Multiplier Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 h-14 sm:h-16">
        <button
          onClick={() => toggleMultiplier(Multiplier.Double)}
          className={`${buttonBaseClass} ${
            selectedMultiplier === Multiplier.Double
              ? 'bg-rose-500 border-rose-600 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-50'
          }`}
        >
          Double
        </button>
        <button
          onClick={() => toggleMultiplier(Multiplier.Triple)}
          className={`${buttonBaseClass} ${
            selectedMultiplier === Multiplier.Triple
              ? 'bg-amber-400 border-amber-500 text-white shadow-lg'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-amber-500 dark:text-amber-400 hover:bg-amber-50'
          }`}
        >
          Triple
        </button>
        <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`${buttonBaseClass} ${
                canUndo 
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
            }`}
            >
            Undo
        </button>
      </div>

      {/* Number Grid */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {numbers.map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 active:bg-emerald-500 active:text-white text-slate-800 dark:text-slate-100 font-black text-lg sm:text-2xl h-14 sm:h-20 rounded-xl sm:rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center touch-manipulation"
          >
            {num}
          </button>
        ))}
        
        {/* Bottom Row: 25/Bull, 0/Miss */}
        <button
          onClick={() => selectedMultiplier !== Multiplier.Triple && handleNumberClick(25)}
          className={`col-span-2 ${
            selectedMultiplier === Multiplier.Triple 
              ? 'bg-emerald-500/40 grayscale cursor-not-allowed' 
              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-xl'
          } text-white font-black text-base sm:text-xl h-14 sm:h-20 rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 sm:gap-3 touch-manipulation group`}
        >
            <div className={`w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-red-500 border-2 sm:border-4 border-white/30 transition-transform`}></div>
            BULL
        </button>
        
        <button
          onClick={() => handleNumberClick(0)}
          className="col-span-3 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-500 dark:text-slate-300 font-black text-sm sm:text-lg h-14 sm:h-20 rounded-xl sm:rounded-2xl transition-all border border-transparent touch-manipulation uppercase tracking-widest"
        >
          MANQUÉ (0)
        </button>
      </div>
    </div>
  );
};