import React, { useState } from 'react';
import { GameConfig, Player } from '../types';

interface SetupProps {
  onStartGame: (config: GameConfig) => void;
}

export const Setup: React.FC<SetupProps> = ({ onStartGame }) => {
  const [score, setScore] = useState<number>(501);
  const [legs, setLegs] = useState<number>(1);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
    }
  };

  const updateName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStart = () => {
    const players: Player[] = playerNames.map((name, index) => ({
      id: `p${index}-${Date.now()}`,
      name: name.trim() || `Player ${index + 1}`,
      score: score,
      wins: 0,
    }));

    onStartGame({
      startingScore: score,
      totalLegs: legs,
      players,
    });
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h1 className="text-3xl font-bold text-center text-emerald-500 mb-8 tracking-tight">New Game</h1>
      
      {/* Score Selection */}
      <div className="mb-6">
        <label className="block text-slate-500 mb-2 text-xs uppercase font-bold tracking-wider">Starting Score</label>
        <div className="flex gap-3">
          {[301, 501].map((val) => (
            <button
              key={val}
              onClick={() => setScore(val)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-sm ${
                score === val 
                  ? 'bg-emerald-500 text-white shadow-emerald-200 ring-2 ring-emerald-500 ring-offset-1' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {val}
            </button>
          ))}
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            className="w-24 bg-slate-50 border border-slate-200 rounded-xl px-3 text-center text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Legs */}
      <div className="mb-6">
        <label className="block text-slate-500 mb-2 text-xs uppercase font-bold tracking-wider">Number of Legs</label>
        <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-200 shadow-inner">
          <button 
            onClick={() => setLegs(Math.max(1, legs - 1))}
            className="w-12 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all font-bold"
          >
            -
          </button>
          <div className="flex-1 text-center font-bold text-xl text-slate-700">{legs}</div>
          <button 
            onClick={() => setLegs(legs + 1)}
            className="w-12 h-10 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="mb-8">
        <label className="block text-slate-500 mb-2 text-xs uppercase font-bold tracking-wider">Players</label>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {playerNames.map((name, index) => (
            <div key={index} className="flex gap-2 group">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-sm"
                placeholder={`Player ${index + 1}`}
              />
              {playerNames.length > 1 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="w-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        {playerNames.length < 8 && (
          <button
            onClick={addPlayer}
            className="mt-3 w-full py-3 border-2 border-dashed border-slate-200 text-slate-400 rounded-xl hover:border-emerald-300 hover:text-emerald-500 hover:bg-emerald-50 transition-all text-sm font-bold tracking-wide"
          >
            + Add Player
          </button>
        )}
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transform transition hover:-translate-y-1 active:translate-y-0"
      >
        GAME ON!
      </button>
    </div>
  );
};