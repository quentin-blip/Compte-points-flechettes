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
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto bg-slate-800/50 p-2 rounded-xl backdrop-blur-sm">
      {/* Multiplier Row */}
      <div className="grid grid-cols-3 gap-2 h-12">
        <button
          onClick={() => toggleMultiplier(Multiplier.Double)}
          className={`rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
            selectedMultiplier === Multiplier.Double
              ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)]'
              : 'bg-slate-700 text-rose-400 hover:bg-slate-600'
          }`}
        >
          Double
        </button>
        <button
          onClick={() => toggleMultiplier(Multiplier.Triple)}
          className={`rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
            selectedMultiplier === Multiplier.Triple
              ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]'
              : 'bg-slate-700 text-amber-400 hover:bg-slate-600'
          }`}
        >
          Triple
        </button>
        <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`rounded-lg font-bold transition-colors ${
                canUndo 
                ? 'bg-slate-600 text-slate-200 hover:bg-slate-500' 
                : 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
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
            className="bg-slate-700 hover:bg-slate-600 active:bg-emerald-600 active:scale-95 text-white font-semibold text-xl h-12 rounded shadow-sm transition-all"
          >
            {num}
          </button>
        ))}
        
        {/* Bottom Row: 25/Bull, 0/Miss */}
        <button
          onClick={() => handleNumberClick(25)}
          className="col-span-2 bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-lg h-12 rounded shadow-sm transition-colors flex items-center justify-center gap-1"
        >
            <div className="w-3 h-3 rounded-full bg-red-500 border border-black"></div>
            BULL
        </button>
        
        <button
          onClick={() => handleNumberClick(0)}
          className="col-span-3 bg-slate-800 hover:bg-red-900/30 text-slate-400 hover:text-red-400 font-bold text-lg h-12 rounded border border-slate-700 transition-colors"
        >
          MISS
        </button>
      </div>
    </div>
  );
};
