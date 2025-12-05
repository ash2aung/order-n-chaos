"use client";
import { useState, useEffect } from "react";
import { CellValue, PlayerRole, GameStatus } from "../utils/types";
import { checkFiveInARow, getAIMove } from "../utils/gameLogic";

export default function Home() {
  // --- STATE ---
  const [boardSize, setBoardSize] = useState(6);
  const [board, setBoard] = useState<CellValue[][]>([]);
  const [humanRole, setHumanRole] = useState<PlayerRole>('Order');
  const [aiRole, setAiRole] = useState<PlayerRole>('Chaos');
  const [turn, setTurn] = useState<'HUMAN' | 'AI'>('HUMAN');
  const [gameStatus, setGameStatus] = useState<GameStatus>('PLAYING');
  const [selectedSymbol, setSelectedSymbol] = useState<'X' | 'O'>('X');

  // --- INITIALIZATION ---
  // Runs once on load, or when boardSize changes
  useEffect(() => {
    resetGame();
  }, [boardSize]);

  const resetGame = () => {
    // Create empty grid
    const newBoard = Array(boardSize).fill(null).map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    
    // Randomize Roles (like your C++ decide_roles_and_order)
    const isHumanOrder = Math.random() > 0.5;
    setHumanRole(isHumanOrder ? 'Order' : 'Chaos');
    setAiRole(isHumanOrder ? 'Chaos' : 'Order');
    
    // Randomize who goes first
    setTurn(Math.random() > 0.5 ? 'HUMAN' : 'AI');
    setGameStatus('PLAYING');
  };

  // --- AI TURN HANDLER ---
  useEffect(() => {
    if (turn === 'AI' && gameStatus === 'PLAYING') {
      // Add a small delay so it feels like the computer is thinking
      const timer = setTimeout(() => {
        const move = getAIMove(board, aiRole);
        if (move) {
          executeMove(move.r, move.c, move.symbol);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, gameStatus, board]);

  // --- MOVE LOGIC ---
  const executeMove = (r: number, c: number, symbol: 'X' | 'O') => {
    const newBoard = board.map(row => [...row]); // Copy board
    newBoard[r][c] = symbol;
    setBoard(newBoard);

    // Check Win Conditions
    const xWins = checkFiveInARow(newBoard, 'X');
    const oWins = checkFiveInARow(newBoard, 'O');
    
    // 1. Check Order Win (5 in a row of anything)
    if (xWins || oWins) {
      setGameStatus('ORDER_WINS');
      return;
    }

    // 2. Check Chaos Win (Board full, no 5 in a row)
    const isFull = newBoard.every(row => row.every(cell => cell !== null));
    if (isFull) {
      setGameStatus('CHAOS_WINS');
      return;
    }

    // Toggle Turn
    setTurn(prev => prev === 'HUMAN' ? 'AI' : 'HUMAN');
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== 'PLAYING' || turn !== 'HUMAN' || board[r][c] !== null) return;
    executeMove(r, c, selectedSymbol);
  };

  // --- RENDER ---
  return (
    <main className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Order & Chaos
      </h1>

      {/* STATUS BAR */}
      <div className="mb-6 text-center space-y-2">
        <div className="text-lg">
          You are <span className="font-bold text-yellow-400">{humanRole}</span> vs AI <span className="font-bold text-red-400">{aiRole}</span>
        </div>
        <div className="text-xl font-semibold">
          {gameStatus === 'PLAYING' 
            ? `Turn: ${turn === 'HUMAN' ? 'Your Move' : 'AI Thinking...'}`
            : <span className={gameStatus === 'ORDER_WINS' ? 'text-green-400' : 'text-orange-400'}>
                GAME OVER: {gameStatus.replace('_', ' ')}!
              </span>
          }
        </div>
      </div>

      {/* CONTROLS (Only visible when playing) */}
      <div className="mb-4 flex gap-4">
        {gameStatus === 'PLAYING' && turn === 'HUMAN' && (
          <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
            <span className="mr-3 text-sm text-slate-400">Place:</span>
            <button 
              onClick={() => setSelectedSymbol('X')}
              className={`px-4 py-1 rounded mr-2 ${selectedSymbol === 'X' ? 'bg-blue-600' : 'bg-slate-700'}`}
            >X</button>
            <button 
              onClick={() => setSelectedSymbol('O')}
              className={`px-4 py-1 rounded ${selectedSymbol === 'O' ? 'bg-red-600' : 'bg-slate-700'}`}
            >O</button>
          </div>
        )}
        
        <button onClick={resetGame} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded border border-slate-500">
          New Game
        </button>
      </div>

      {/* BOARD */}
      <div 
        className="grid gap-1 bg-slate-700 p-2 rounded-lg shadow-2xl"
        style={{ gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))` }}
      >
        {board.map((row, rIndex) => (
          row.map((cell, cIndex) => (
            <div
              key={`${rIndex}-${cIndex}`}
              onClick={() => handleCellClick(rIndex, cIndex)}
              className={`
                w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center 
                text-2xl sm:text-3xl font-bold cursor-pointer select-none transition-colors
                ${cell === null ? 'bg-slate-800 hover:bg-slate-750' : 'bg-slate-800'}
                ${cell === 'X' ? 'text-blue-500' : 'text-red-500'}
              `}
            >
              {cell}
            </div>
          ))
        ))}
      </div>

      {/* SETTINGS */}
      <div className="mt-8 flex items-center gap-2 text-sm text-slate-400">
        <label>Board Size:</label>
        <select 
          value={boardSize} 
          onChange={(e) => setBoardSize(Number(e.target.value))}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1"
        >
          {[6, 7, 8, 9].map(s => <option key={s} value={s}>{s}x{s}</option>)}
        </select>
      </div>
    </main>
  );
}