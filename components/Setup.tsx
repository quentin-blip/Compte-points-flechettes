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
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
      <h1 className="text-3xl font-bold text-center text-emerald-400 mb-8 tracking-tight">New Game</h1>
      
      {/* Score Selection */}
      <div className="mb-6">
        <label className="block text-slate-400 mb-2 text-sm uppercase font-semibold tracking-wider">Starting Score</label>
        <div className="flex gap-3">
          {[301, 501].map((val) => (
            <button
              key={val}
              onClick={() => setScore(val)}
              className={`flex-1 py-3 rounded-lg font-bold transition-all ${
                score === val 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {val}
            </button>
          ))}
          <input
            type="number"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value) || 0)}
            className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 text-center text-white focus:outline-none focus:border-emerald-500"
            placeholder="Custom"
          />
        </div>
      </div>

      {/* Legs */}
      <div className="mb-6">
        <label className="block text-slate-400 mb-2 text-sm uppercase font-semibold tracking-wider">Number of Legs</label>
        <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
          <button 
            onClick={() => setLegs(Math.max(1, legs - 1))}
            className="w-12 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            -
          </button>
          <div className="flex-1 text-center font-bold text-xl">{legs}</div>
          <button 
            onClick={() => setLegs(legs + 1)}
            className="w-12 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 rounded"
          >
            +
          </button>
        </div>
      </div>

      {/* Players */}
      <div className="mb-8">
        <label className="block text-slate-400 mb-2 text-sm uppercase font-semibold tracking-wider">Players</label>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          {playerNames.map((name, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => updateName(index, e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder={`Player ${index + 1}`}
              />
              {playerNames.length > 1 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="w-10 flex items-center justify-center text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
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
            className="mt-3 w-full py-2 border-2 border-dashed border-slate-600 text-slate-400 rounded-lg hover:border-slate-500 hover:text-slate-300 transition-all text-sm font-medium"
          >
            + Add Player
          </button>
        )}
      </div>

      <button
        onClick={handleStart}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/50 transform transition hover:-translate-y-1 active:translate-y-0"
      >
        GAME ON!
      </button>
    </div>
  );
};
