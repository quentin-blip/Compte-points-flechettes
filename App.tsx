import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameConfig, GameState, Player, Throw, Multiplier, GameMode } from './types';
import { MAX_THROWS_PER_TURN } from './constants';
import { Setup } from './components/Setup';
import { Scoreboard } from './components/Scoreboard';
import { InputPad } from './components/InputPad';
import { DartboardHeatmap } from './components/DartboardHeatmap';
import { PrecisionAnalysis } from './components/PrecisionAnalysis';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [state, setState] = useState<GameState>({
    status: GameStatus.Setup,
    currentLeg: 1,
    currentPlayerIndex: 0,
    legStarterIndex: 0,
    turnThrows: [],
    history: [],
    scoreAtStartOfTurn: 0,
    finishedPlayerIds: [],
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [showBullAnimation, setShowBullAnimation] = useState<boolean>(false);
  const [showDoubleBullAnimation, setShowDoubleBullAnimation] = useState<boolean>(false);
  const [showWinAnimation, setShowWinAnimation] = useState<boolean>(false);
  const [showBustAnimation, setShowBustAnimation] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const turnEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const triggerShake = (intensity: 'light' | 'heavy' = 'light') => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), intensity === 'light' ? 400 : 600);
  };

  const playBustSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.6);
    } catch (e) {}
  };

  const playBullSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const gain = ctx.createGain();
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const playWinSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const playNote = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.2, ctx.currentTime + start);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(ctx.currentTime + start); osc.stop(ctx.currentTime + start + duration);
      };
      playNote(523, 0, 0.4); playNote(659, 0.1, 0.4); playNote(784, 0.2, 0.5);
    } catch (e) {}
  };

  const startGame = (newConfig: GameConfig) => {
    setConfig(newConfig);
    setPlayers(newConfig.players);
    setState({
      status: GameStatus.Playing,
      currentLeg: 1,
      currentPlayerIndex: 0,
      legStarterIndex: 0,
      turnThrows: [],
      history: [],
      scoreAtStartOfTurn: newConfig.mode === GameMode.Match ? newConfig.players[0].score : 0,
      finishedPlayerIds: [],
    });
    setShowWinAnimation(false);
  };

  const startNextLeg = (winnerId: string) => {
    if (!config) return;
    const nextLegNum = state.currentLeg + 1;
    const nextLegStarterIdx = (state.legStarterIndex + 1) % players.length;
    const updatedPlayers = players.map(p => ({
        ...p,
        score: config.startingScore,
        wins: p.id === winnerId ? p.wins + 1 : p.wins
    }));
    setPlayers(updatedPlayers);
    setState(prev => ({
        ...prev,
        currentLeg: nextLegNum,
        legStarterIndex: nextLegStarterIdx,
        currentPlayerIndex: nextLegStarterIdx,
        scoreAtStartOfTurn: config.startingScore,
        turnThrows: [],
        finishedPlayerIds: [],
    }));
    setShowWinAnimation(false);
  };

  const handleTurnEnd = useCallback((playersSnapshot?: Player[]) => {
    if (!config) return;
    const currentPlayers = playersSnapshot || players;
    
    setState((prev) => {
        if (config.mode === GameMode.Training) {
          return { ...prev, turnThrows: [] };
        }
        
        let nextIdx = (prev.currentPlayerIndex + 1) % currentPlayers.length;
        // Skip players who have already finished
        while (prev.finishedPlayerIds.includes(currentPlayers[nextIdx].id)) {
            nextIdx = (nextIdx + 1) % currentPlayers.length;
        }

        return {
            ...prev,
            turnThrows: [],
            currentPlayerIndex: nextIdx,
            scoreAtStartOfTurn: currentPlayers[nextIdx].score,
        };
    });
  }, [config, players]);

  const handleThrow = (value: number, multiplier: Multiplier) => {
    if (state.status !== GameStatus.Playing || !config || showWinAnimation || isProcessing) return;

    const effectiveMultiplier = (value === 25 && multiplier === Multiplier.Triple) ? Multiplier.Single : multiplier;

    const currentPlayer = players[state.currentPlayerIndex];
    const points = value * effectiveMultiplier;
    const newScore = currentPlayer.score - points;
    const now = Date.now();

    // Score calculation
    let isWin = false;
    let isBust = false;

    if (config.mode === GameMode.Match) {
      if (newScore === 0) {
        isWin = true;
      } else if (newScore < 0) {
        isBust = true;
      }
    }

    const isTrainingFinished = config.mode === GameMode.Training && (state.history.length + 1 >= config.trainingConfig!.maxDarts);

    const newThrow: Throw = {
      playerId: currentPlayer.id,
      legId: state.currentLeg,
      scoreValue: value,
      multiplier: effectiveMultiplier,
      totalPoints: points,
      isBust,
      isWin,
      timestamp: now,
    };

    const updatedPlayers = [...players];
    const pIdx = state.currentPlayerIndex;

    // Trigger Impact Animations ONLY if NOT a bust
    if (!isBust) {
        if (value === 25) {
            playBullSound(); 
            if (effectiveMultiplier === Multiplier.Double) { 
                setShowDoubleBullAnimation(true); 
                triggerShake('heavy'); 
                setTimeout(() => setShowDoubleBullAnimation(false), 1400); 
            }
            else { 
                setShowBullAnimation(true); 
                triggerShake('light'); 
                setTimeout(() => setShowBullAnimation(false), 1000); 
            }
        }
    }

    if (config.mode === GameMode.Match) {
      if (!isBust) {
        updatedPlayers[pIdx].score = newScore;
      } else {
        playBustSound(); 
        setShowBustAnimation(true); 
        triggerShake('heavy');
        setTimeout(() => setShowBustAnimation(false), 1500);
      }
    } else {
      updatedPlayers[pIdx].score += points; 
    }
    setPlayers(updatedPlayers);

    setState((prev) => ({
        ...prev,
        turnThrows: [...prev.turnThrows, newThrow],
        history: [...prev.history, newThrow],
    }));

    if (isWin || isTrainingFinished) {
        setIsProcessing(true);
        const isTrainingEnd = isTrainingFinished && !isWin;
        
        if (!isTrainingEnd) {
            playWinSound(); 
            setShowWinAnimation(true); 
            triggerShake('heavy');
        }
        
        const finalWinnerId = currentPlayer.id;

        setTimeout(() => {
            setIsProcessing(false);
            if (config.mode === GameMode.Training) {
                setState(prev => ({ ...prev, status: GameStatus.Summary, finishedPlayerIds: [finalWinnerId] }));
            } else {
                // ... same multi-finisher logic ...
                setState(prev => {
                    const newFinishedIds = [...prev.finishedPlayerIds, finalWinnerId];
                    const remainingPlayers = updatedPlayers.filter(p => !newFinishedIds.includes(p.id));

                    setShowWinAnimation(false);

                    if (remainingPlayers.length <= 1) {
                        const lastPlayerId = remainingPlayers.length === 1 ? remainingPlayers[0].id : null;
                        const finalRanking = lastPlayerId ? [...newFinishedIds, lastPlayerId] : newFinishedIds;
                        return { 
                            ...prev, 
                            status: GameStatus.Summary, 
                            finishedPlayerIds: finalRanking 
                        };
                    } else {
                        let nextIdx = (prev.currentPlayerIndex + 1) % updatedPlayers.length;
                        while (newFinishedIds.includes(updatedPlayers[nextIdx].id)) {
                            nextIdx = (nextIdx + 1) % updatedPlayers.length;
                        }

                        return { 
                            ...prev, 
                            finishedPlayerIds: newFinishedIds,
                            turnThrows: [],
                            currentPlayerIndex: nextIdx,
                            scoreAtStartOfTurn: updatedPlayers[nextIdx].score
                        };
                    }
                });
            }
        }, isTrainingEnd ? 500 : 2200);
        return;
    }

    const turnThrowsAfterThis = [...state.turnThrows, newThrow];

    if (isBust || turnThrowsAfterThis.length >= MAX_THROWS_PER_TURN) {
      setIsProcessing(true);
      if (turnEndTimeoutRef.current) clearTimeout(turnEndTimeoutRef.current);
      turnEndTimeoutRef.current = setTimeout(() => {
        // If bust, reset score precisely now
        const finalPlayers = [...updatedPlayers];
        if (isBust) {
            finalPlayers[pIdx].score = state.scoreAtStartOfTurn;
            setPlayers(finalPlayers);
        }
        handleTurnEnd(finalPlayers);
        setIsProcessing(false);
        turnEndTimeoutRef.current = null;
      }, isBust ? 1500 : 600);
    }
  };

  const handleUndo = () => {
    if (state.history.length === 0 || !config) return;

    if (turnEndTimeoutRef.current) {
        clearTimeout(turnEndTimeoutRef.current);
        turnEndTimeoutRef.current = null;
    }

    const newHistory = [...state.history];
    newHistory.pop();

    const initialPlayers = config.players.map(p => ({
      ...p,
      score: config.mode === GameMode.Match ? config.startingScore : 0,
      wins: 0
    }));

    let tempPlayers = initialPlayers.map(p => ({ ...p }));
    let tempState: GameState = {
      status: GameStatus.Playing,
      currentLeg: 1,
      currentPlayerIndex: 0,
      legStarterIndex: 0,
      turnThrows: [],
      history: [],
      scoreAtStartOfTurn: config.mode === GameMode.Match ? config.startingScore : 0,
      finishedPlayerIds: [],
    };

    newHistory.forEach(t => {
      const pIdx = tempState.currentPlayerIndex;
      
      if (config.mode === GameMode.Match) {
        if (t.isBust) {
          tempPlayers[pIdx].score = tempState.scoreAtStartOfTurn;
        } else {
          tempPlayers[pIdx].score -= t.totalPoints;
        }
      } else {
        tempPlayers[pIdx].score += t.totalPoints;
      }

      tempState.turnThrows.push(t);
      tempState.history.push(t);

      if (t.isWin) {
        tempPlayers[pIdx].wins += 1;
        if (config.mode === GameMode.Training) {
           tempState.status = GameStatus.Summary;
           tempState.finishedPlayerIds = [tempPlayers[pIdx].id];
        } else {
           tempState.finishedPlayerIds.push(tempPlayers[pIdx].id);
           const remaining = tempPlayers.filter(p => !tempState.finishedPlayerIds.includes(p.id));
           if (remaining.length <= 1) {
               if (remaining.length === 1) tempState.finishedPlayerIds.push(remaining[0].id);
               tempState.status = GameStatus.Summary;
           } else {
               // Move to next player who hasn't finished
               let nextIdx = (tempState.currentPlayerIndex + 1) % tempPlayers.length;
               while (tempState.finishedPlayerIds.includes(tempPlayers[nextIdx].id)) {
                   nextIdx = (nextIdx + 1) % tempPlayers.length;
               }
               tempState.currentPlayerIndex = nextIdx;
               tempState.turnThrows = [];
               tempState.scoreAtStartOfTurn = tempPlayers[tempState.currentPlayerIndex].score;
           }
        }
      } else if (t.isBust || tempState.turnThrows.length >= MAX_THROWS_PER_TURN) {
        if (config.mode === GameMode.Match) {
            let nextIdx = (tempState.currentPlayerIndex + 1) % tempPlayers.length;
            while (tempState.finishedPlayerIds.includes(tempPlayers[nextIdx].id)) {
                nextIdx = (nextIdx + 1) % tempPlayers.length;
            }
            tempState.currentPlayerIndex = nextIdx;
            tempState.turnThrows = [];
            tempState.scoreAtStartOfTurn = tempPlayers[tempState.currentPlayerIndex].score;
        } else {
            tempState.turnThrows = [];
        }
      }
    });

    setPlayers(tempPlayers);
    setState(tempState);
    setShowWinAnimation(false);
    setShowBullAnimation(false);
    setShowDoubleBullAnimation(false);
    setShowBustAnimation(false);
    setIsProcessing(false);
  };

  const restartMatch = () => startGame({ ...config!, players: config!.players.map(p => ({ ...p, score: config!.mode === GameMode.Match ? config!.startingScore : 0, wins: 0 })) });
  const newGame = () => setState(prev => ({ ...prev, status: GameStatus.Setup }));

  const ThemeToggle = () => (
    <button onClick={toggleTheme} className="p-2.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 active:scale-95 transition-all text-lg">
        {isDarkMode ? '🌙' : '☀️'}
    </button>
  );

  if (state.status === GameStatus.Setup) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 view-enter">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
        <Setup onStartGame={startGame} />
    </div>
  );

  if (state.status === GameStatus.Summary) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 view-enter">
        <div className="absolute top-6 right-6"><ThemeToggle /></div>
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-black text-center text-emerald-500 mb-8 uppercase tracking-tight">BILAN {config?.mode === GameMode.Training ? 'SÉANCE' : 'MATCH'}</h1>
            <div className="grid gap-6 mb-10">
                {players.map((p) => {
                    const playerThrows = state.history.filter(t => t.playerId === p.id);
                    const totalDarts = playerThrows.length;
                    const avg = totalDarts > 0 ? Math.round((playerThrows.reduce((sum, t) => sum + t.totalPoints, 0) / totalDarts) * 3) : 0;
                    const isWinner = state.finishedPlayerIds.includes(p.id);
                    
                    return (
                        <div key={p.id} className={`flex flex-col gap-4 p-6 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-xl border-l-[10px] ${isWinner ? (config?.mode === GameMode.Training ? 'border-blue-500' : 'border-emerald-500') : 'border-slate-300 dark:border-slate-600 opacity-90'}`}>
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="text-xl font-black">
                                      {p.name} 
                                      {config?.mode === GameMode.Match && <span className="text-emerald-500 ml-2">{p.wins} Leg(s)</span>}
                                      {isWinner && <span className="ml-2 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 px-2 py-0.5 rounded-lg uppercase font-black">Vainqueur</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                      {totalDarts} fléchettes • Moyenne: {avg} 
                                      {config?.mode === GameMode.Match && !isWinner && p.score > 0 && <span className="ml-2">• Restant: {p.score}</span>}
                                    </div>
                                </div>
                                <div className={`text-3xl ${isWinner ? 'animate-bounce' : ''}`}>🎯</div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-8 items-center">
                                <div className="w-full h-auto"><DartboardHeatmap history={state.history} playerId={p.id} isDarkMode={isDarkMode} /></div>
                                <PrecisionAnalysis history={state.history} playerId={p.id} forcedTargetZones={config?.trainingConfig?.targetZones} />
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pb-12">
                <button onClick={handleUndo} className="w-full sm:w-auto bg-white dark:bg-slate-700 text-slate-700 dark:text-white px-8 py-4 rounded-3xl font-black border border-slate-200 dark:border-slate-600 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-base flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    Undo (Erreur)
                </button>
                <button onClick={restartMatch} className={`w-full sm:w-auto text-white px-8 py-4 rounded-3xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-base ${config?.mode === GameMode.Training ? 'bg-blue-500 shadow-blue-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>Recommencer</button>
                <button onClick={newGame} className="w-full sm:w-auto bg-white dark:bg-slate-700 text-slate-700 dark:text-white px-8 py-4 rounded-3xl font-black border border-slate-200 dark:border-slate-600 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-base">Menu Principal</button>
            </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[state.currentPlayerIndex];
  const isTraining = config?.mode === GameMode.Training;

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 p-4 flex flex-col transition-colors duration-700 relative overflow-hidden view-enter ${isShaking ? 'animate-shake' : ''}`}>
      {/* --- OVERLAYS D'ANIMATION --- */}
      {showBustAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-bust-screen">
           <div className="text-8xl sm:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] uppercase italic tracking-tighter animate-bust-text">BUST !</div>
        </div>
      )}
      {showBullAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="animate-bull-blast text-7xl sm:text-[8rem] font-black text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,1)] uppercase italic">BULL !</div>
          <div className="shockwave border-red-500"></div>
        </div>
      )}
      {showDoubleBullAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <div className="animate-dbull-blast text-7xl sm:text-[9rem] font-black text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,1)] uppercase italic text-center leading-tight">DOUBLE<br/>BULL</div>
          <div className="shockwave border-yellow-400" style={{ animationDuration: '1.2s' }}></div>
        </div>
      )}
      {showWinAnimation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-xl animate-pop-in">
           <div className="animate-winner-pop flex flex-col items-center max-w-lg w-full px-6">
              <div className="text-9xl sm:text-[12rem] animate-bounce mb-4">🏆</div>
              <div className="w-full text-center space-y-2">
                <h2 className="text-3xl sm:text-4xl font-black text-emerald-500 uppercase tracking-widest italic drop-shadow-sm">VICTOIRE !</h2>
                <div className="text-6xl sm:text-8xl font-black text-white uppercase italic tracking-tighter leading-none victory-text py-2">
                  {currentPlayer.name}
                </div>
                <div className="h-1 w-24 bg-emerald-500 mx-auto rounded-full mt-4 animate-gold-pulse"></div>
              </div>
           </div>
        </div>
      )}

      <header className="flex justify-between items-center mb-6 max-w-lg mx-auto w-full px-2">
        {isTraining ? (
          <div className="flex-1 mr-4">
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
                <span>Progression</span>
                <span>{state.history.length} / {config.trainingConfig?.maxDarts}</span>
             </div>
             <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-300 shadow-[0_0_8px_rgba(59,130,246,0.5)]" style={{ width: `${(state.history.length / config.trainingConfig!.maxDarts) * 100}%` }}></div>
             </div>
          </div>
        ) : (
          <h1 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.3em]">Leg {state.currentLeg} / {config?.totalLegs}</h1>
        )}
        <div className="flex items-center gap-4">
            <ThemeToggle />
            <button onClick={newGame} className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-red-500 transition-colors">Quitter</button>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full">
        <Scoreboard 
          players={players} 
          currentPlayerId={currentPlayer.id} 
          currentTurnThrows={state.turnThrows} 
          scoreAtStartOfTurn={state.scoreAtStartOfTurn} 
          history={state.history}
          finishedPlayerIds={state.finishedPlayerIds}
          totalLegs={config?.totalLegs || 1}
          currentLeg={state.currentLeg}
          config={config}
        />
        <InputPad onSubmitThrow={handleThrow} onUndo={handleUndo} canUndo={state.history.length > 0} />
      </main>
    </div>
  );
};

export default App;