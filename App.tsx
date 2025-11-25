import React, { useState, useEffect, useCallback } from 'react';
import { GameStatus, GameConfig, GameState, Player, Throw, Multiplier } from './types';
import { MAX_THROWS_PER_TURN, HEATMAP_COLORS } from './constants';
import { Setup } from './components/Setup';
import { Scoreboard } from './components/Scoreboard';
import { InputPad } from './components/InputPad';
import { DartboardHeatmap } from './components/DartboardHeatmap';

const App: React.FC = () => {
  const [config, setConfig] = useState<GameConfig | null>(null);
  const [state, setState] = useState<GameState>({
    status: GameStatus.Setup,
    currentLeg: 1,
    currentPlayerIndex: 0,
    turnThrows: [],
    history: [],
    scoreAtStartOfTurn: 0,
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [winningThrow, setWinningThrow] = useState<Throw | null>(null);

  const startGame = (newConfig: GameConfig) => {
    setConfig(newConfig);
    setPlayers(newConfig.players);
    setState({
      status: GameStatus.Playing,
      currentLeg: 1,
      currentPlayerIndex: 0,
      turnThrows: [],
      history: [],
      scoreAtStartOfTurn: newConfig.players[0].score,
    });
    setWinningThrow(null);
  };

  const handleTurnEnd = useCallback(() => {
    if (!config) return;

    setState((prev) => {
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % players.length;
        
        // IMPORTANT: Update players state logic is handled in handleThrow usually, 
        // but we need to prepare the *next* turn's score snapshot.
        const nextPlayer = players[nextPlayerIndex];
        
        return {
            ...prev,
            turnThrows: [],
            currentPlayerIndex: nextPlayerIndex,
            scoreAtStartOfTurn: nextPlayer.score, // Snapshot for next player
        };
    });
  }, [config, players]);

  const handleThrow = (value: number, multiplier: Multiplier) => {
    if (state.status !== GameStatus.Playing || !config) return;

    const currentPlayer = players[state.currentPlayerIndex];
    const points = value * multiplier;
    const newScore = currentPlayer.score - points;
    const now = Date.now();

    let isBust = false;
    let isWin = false;

    // Win/Bust Logic
    if (newScore < 0) {
      isBust = true;
    } else if (newScore === 0) {
      isWin = true;
    } else {
      // Valid throw, game continues
    }

    const newThrow: Throw = {
      playerId: currentPlayer.id,
      legId: state.currentLeg,
      scoreValue: value,
      multiplier,
      totalPoints: points,
      isBust,
      isWin,
      timestamp: now,
    };

    // Update Players State
    const updatedPlayers = [...players];
    if (isBust) {
      // Reset to start of turn
      updatedPlayers[state.currentPlayerIndex].score = state.scoreAtStartOfTurn;
    } else {
      updatedPlayers[state.currentPlayerIndex].score = newScore;
    }
    setPlayers(updatedPlayers);

    // Update Game State
    setState((prev) => {
      const newTurnThrows = [...prev.turnThrows, newThrow];
      const newHistory = [...prev.history, newThrow];

      return {
        ...prev,
        turnThrows: newTurnThrows,
        history: newHistory,
      };
    });

    // Check immediate transitions
    if (isWin) {
      setWinningThrow(newThrow);
      setState((prev) => ({ ...prev, status: GameStatus.Summary }));
      // Increment win count
      const winnerUpdate = [...updatedPlayers];
      winnerUpdate[state.currentPlayerIndex].wins += 1;
      setPlayers(winnerUpdate);
      return;
    }

    if (isBust) {
      // Bust ends turn immediately
      // Small delay to show the "BUST" UI if we had one, but for now immediate switch
      setTimeout(handleTurnEnd, 800); // Small delay for UX
      return;
    }

    // Standard turn progression
    // If we just threw the 3rd dart
    if (state.turnThrows.length + 1 >= MAX_THROWS_PER_TURN) {
      setTimeout(handleTurnEnd, 500);
    }
  };

  const handleUndo = () => {
    if (state.turnThrows.length === 0) return; // Cannot undo past turn boundaries for simplicity

    const lastThrow = state.turnThrows[state.turnThrows.length - 1];
    
    // Revert Player Score
    const updatedPlayers = [...players];
    const player = updatedPlayers[state.currentPlayerIndex];
    
    if (lastThrow.isBust) {
        // Score was already reset to start of turn, so current score IS start score.
        // We technically don't need to change score math, just remove the bust status.
        // Wait, if they busted, the score is effectively startOfTurn.
        // We want to go back to the state *before* the bust throw.
        // Which is startOfTurn - (previous throws in this turn).
        const pointsFromPrevThrows = state.turnThrows
            .slice(0, -1)
            .reduce((acc, t) => acc + t.totalPoints, 0);
        player.score = state.scoreAtStartOfTurn - pointsFromPrevThrows;
    } else {
        player.score += lastThrow.totalPoints;
    }
    setPlayers(updatedPlayers);

    // Revert State
    setState((prev) => ({
        ...prev,
        turnThrows: prev.turnThrows.slice(0, -1),
        history: prev.history.slice(0, -1),
    }));
  };

  const restartGame = () => {
    if (config) startGame(config);
  };

  const newGame = () => {
    setState((prev) => ({ ...prev, status: GameStatus.Setup }));
  };

  // --- RENDER ---

  if (state.status === GameStatus.Setup) {
    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 p-4 flex items-center justify-center">
            <Setup onStartGame={startGame} />
        </div>
    );
  }

  if (state.status === GameStatus.Summary) {
    const winner = players[state.currentPlayerIndex];
    return (
      <div className="min-h-screen bg-slate-900 text-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-5xl font-black text-emerald-400 mb-2">GAME SHOT!</h1>
                <p className="text-2xl text-white">{winner.name} wins the leg.</p>
                <div className="mt-4 flex justify-center gap-4">
                    <button onClick={restartGame} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-bold transition-colors">Rematch</button>
                    <button onClick={newGame} className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-bold transition-colors">New Setup</button>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {players.map(p => (
                    <div key={p.id} className="bg-slate-800 p-6 rounded-xl shadow-lg">
                        <h3 className="text-xl font-bold text-center mb-4 text-emerald-200">{p.name}'s Heatmap</h3>
                        <div className="flex justify-center mb-4">
                             <DartboardHeatmap history={state.history} playerId={p.id} />
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 text-xs">
                             {Object.entries(HEATMAP_COLORS).map(([count, color]) => {
                                if (count === '0') return null;
                                return (
                                    <div key={count} className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
                                        <span>{parseInt(count) >= 6 ? '6+' : count} Hits</span>
                                    </div>
                                );
                             })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    );
  }

  const currentPlayer = players[state.currentPlayerIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-4 flex flex-col">
      <header className="flex justify-between items-center mb-4 max-w-md mx-auto w-full">
        <h1 className="font-bold text-slate-500 tracking-wider uppercase text-sm">Leg {state.currentLeg}</h1>
        <button onClick={newGame} className="text-xs text-slate-600 hover:text-slate-400">Quit</button>
      </header>

      <main className="flex-1 flex flex-col justify-center">
        <Scoreboard 
            players={players} 
            currentPlayerId={currentPlayer.id}
            currentTurnThrows={state.turnThrows}
            scoreAtStartOfTurn={state.scoreAtStartOfTurn}
        />
        
        <InputPad 
            onSubmitThrow={handleThrow} 
            onUndo={handleUndo}
            canUndo={state.turnThrows.length > 0}
        />
      </main>
    </div>
  );
};

export default App;
