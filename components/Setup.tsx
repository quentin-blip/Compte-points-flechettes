import React, { useState } from 'react';
import { GameConfig, Player, GameMode } from '../types';
import { DARTBOARD_NUMBERS } from '../constants';

interface SetupProps {
  onStartGame: (config: GameConfig) => void;
}

export const Setup: React.FC<SetupProps> = ({ onStartGame }) => {
  const [mode, setMode] = useState<GameMode>(GameMode.Match);
  const [score, setScore] = useState<number>(301);
  const [legs, setLegs] = useState<number>(1); 
  const [playerNames, setPlayerNames] = useState<string[]>(['Joueur 1', 'Joueur 2']);
  const [trainingDarts, setTrainingDarts] = useState<number>(30);
  const [selectedTargets, setSelectedTargets] = useState<number[]>([20]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addPlayer = () => {
    if (playerNames.length < 8) {
      setPlayerNames([...playerNames, `Joueur ${playerNames.length + 1}`]);
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

  const shufflePlayers = () => {
    const newNames = [...playerNames];
    for (let i = newNames.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newNames[i], newNames[j]] = [newNames[j], newNames[i]];
    }
    setPlayerNames(newNames);
  };

  const toggleTarget = (num: number) => {
    if (selectedTargets.includes(num)) {
      if (selectedTargets.length > 1) setSelectedTargets(selectedTargets.filter(t => t !== num));
    } else {
      setSelectedTargets([...selectedTargets, num]);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnter = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newNames = [...playerNames];
    const itemToMove = newNames[draggedIndex];
    newNames.splice(draggedIndex, 1);
    newNames.splice(index, 0, itemToMove);
    setDraggedIndex(index);
    setPlayerNames(newNames);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const handleStart = () => {
    const isTraining = mode === GameMode.Training;
    const startingScoreForPlayers = isTraining ? 0 : score;

    const players: Player[] = (mode === GameMode.Match ? playerNames : [playerNames[0]]).map((name, index) => ({
      id: `p${index}-${Date.now()}`,
      name: name.trim() || `Joueur ${index + 1}`,
      score: startingScoreForPlayers,
      wins: 0,
    }));

    onStartGame({
      mode,
      startingScore: score,
      totalLegs: legs,
      players,
      trainingConfig: isTraining ? {
        targetZones: selectedTargets,
        maxDarts: trainingDarts
      } : undefined
    });
  };

  return (
    <div className="max-w-lg w-full mx-auto p-6 sm:p-8 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-700 transition-all view-enter flex flex-col gap-6">
      <h1 className="text-3xl sm:text-4xl font-black text-center text-emerald-500 tracking-tight italic uppercase">DARTSMASTER</h1>
      
      {/* Sélecteur de Mode */}
      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-[1.5rem] shadow-inner shrink-0">
        <button 
          onClick={() => setMode(GameMode.Match)}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === GameMode.Match ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-md' : 'text-slate-400'}`}
        >
          Match
        </button>
        <button 
          onClick={() => setMode(GameMode.Training)}
          className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === GameMode.Training ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-md' : 'text-slate-400'}`}
        >
          Entraînement
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 no-scrollbar">
        <div key={mode} className="space-y-6 view-enter">
          {mode === GameMode.Match ? (
            <>
              <div>
                <label className="block text-slate-400 dark:text-slate-500 mb-3 text-[9px] uppercase font-black tracking-widest">Score de départ</label>
                <div className="flex gap-4">
                  {[301, 501].map((val) => (
                    <button
                      key={val}
                      onClick={() => setScore(val)}
                      className={`flex-1 py-4 rounded-2xl font-black text-xl transition-all ${
                        score === val 
                          ? 'bg-emerald-500 text-white shadow-lg' 
                          : 'bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 dark:text-slate-500 mb-3 text-[9px] uppercase font-black tracking-widest">Nombre de legs</label>
                <div className="flex items-center bg-slate-100 dark:bg-slate-900/60 rounded-[1.25rem] p-1.5">
                  <button onClick={() => setLegs(Math.max(1, legs - 1))} className="w-12 h-10 text-slate-400 text-2xl font-light hover:text-emerald-500 transition-colors">-</button>
                  <div className="flex-1 text-center font-black text-lg text-slate-800 dark:text-slate-100 tabular-nums">
                    {legs} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1 tracking-widest">{legs > 1 ? 'Legs' : 'Leg'}</span>
                  </div>
                  <button onClick={() => setLegs(legs + 1)} className="w-12 h-10 text-slate-400 text-2xl font-light hover:text-emerald-500 transition-colors">+</button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-widest block">Joueurs</label>
                  <button 
                    onClick={shufflePlayers}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 hover:text-emerald-500 transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 3 21 3 21 8"></polyline>
                      <line x1="4" y1="20" x2="21" y2="3"></line>
                    </svg>
                    <span className="text-[9px] font-black uppercase">Mélanger</span>
                  </button>
                </div>
                
                <div className="space-y-2 max-h-[30vh] overflow-y-auto pr-1 no-scrollbar">
                  {playerNames.map((name, index) => (
                    <div 
                      key={index} 
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragEnter={() => handleDragEnter(index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`flex items-center gap-3 p-1 rounded-2xl border transition-all duration-200 cursor-move ${
                        draggedIndex === index 
                          ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 opacity-50 scale-[0.98]' 
                          : 'bg-slate-50 dark:bg-slate-700/40 border-slate-100 dark:border-slate-700 group focus-within:border-emerald-500'
                      }`}
                    >
                      <div className="w-8 h-10 flex-shrink-0 flex items-center justify-center text-slate-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
                          <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={name}
                        onPointerDown={(e) => e.stopPropagation()} 
                        onChange={(e) => updateName(index, e.target.value)}
                        className="flex-1 bg-transparent py-2 text-slate-800 dark:text-slate-100 font-bold text-sm focus:outline-none placeholder:text-slate-300"
                        placeholder={`Nom...`}
                      />
                      {playerNames.length > 1 && (
                        <button onClick={() => removePlayer(index)} className="w-10 h-10 text-slate-300 hover:text-rose-500 text-xl font-light">×</button>
                      )}
                    </div>
                  ))}
                </div>
                {playerNames.length < 8 && (
                  <button onClick={addPlayer} className="mt-4 w-full py-3 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-[9px] font-black uppercase tracking-widest">+ Ajouter un joueur</button>
                )}
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-slate-400 dark:text-slate-500 mb-3 text-[9px] uppercase font-black tracking-widest">Votre nom</label>
                <input
                  type="text"
                  value={playerNames[0]}
                  onChange={(e) => updateName(0, e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/50 border-2 border-transparent rounded-2xl py-4 px-5 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-blue-500 transition-all text-lg"
                  placeholder="Nom..."
                />
              </div>

              <div>
                <label className="block text-slate-400 dark:text-slate-500 mb-3 text-[9px] uppercase font-black tracking-widest">Cibles</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {[...DARTBOARD_NUMBERS].sort((a,b) => a-b).map(num => (
                    <button
                      key={num}
                      onClick={() => toggleTarget(num)}
                      className={`h-10 rounded-xl text-[10px] font-black flex items-center justify-center transition-all ${
                        selectedTargets.includes(num) ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => toggleTarget(25)}
                    className={`col-span-2 h-10 rounded-xl text-[10px] font-black flex items-center justify-center transition-all ${
                      selectedTargets.includes(25) ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    BULL
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 dark:text-slate-500 mb-3 text-[9px] uppercase font-black tracking-widest">Fléchettes</label>
                <div className="flex gap-3 mb-4">
                  {[30, 60, 90].map(val => (
                    <button
                      key={val}
                      onClick={() => setTrainingDarts(val)}
                      className={`flex-1 py-3 rounded-xl font-black transition-all text-xs ${
                        trainingDarts === val ? 'bg-blue-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={trainingDarts}
                    onChange={(e) => setTrainingDarts(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full bg-slate-50 dark:bg-slate-900/60 border-2 border-slate-100 dark:border-slate-700 rounded-2xl py-6 px-6 text-slate-800 dark:text-white font-black text-center focus:outline-none focus:border-blue-500 transition-all text-4xl tabular-nums shadow-inner"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <button
        onClick={handleStart}
        className={`w-full py-5 rounded-3xl font-black text-white shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-base shrink-0 ${
          mode === GameMode.Match ? 'bg-emerald-500' : 'bg-blue-500'
        }`}
      >
        Lancer la {mode === GameMode.Training ? 'Séance' : 'Partie'}
      </button>
    </div>
  );
};
