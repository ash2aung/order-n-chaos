"use client";
import { useState, useEffect, useCallback } from "react";
import { CellValue, PlayerRole, GameStatus } from "../utils/type";
import { checkWinLine, getAIMove } from "../utils/gameLogic";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Info, X as XIcon } from "lucide-react";

export default function Home() {
  const [boardSize, setBoardSize] = useState(6);
  const [board, setBoard] = useState<CellValue[][]>([]);
  const [humanRole, setHumanRole] = useState<PlayerRole>("Order");
  const [aiRole, setAiRole] = useState<PlayerRole>("Chaos");
  const [turn, setTurn] = useState<"HUMAN" | "AI">("HUMAN");
  const [gameStatus, setGameStatus] = useState<GameStatus>("PLAYING");
  const [selectedSymbol, setSelectedSymbol] = useState<"X" | "O">("X");
  const [winningLine, setWinningLine] = useState<{r: number, c: number}[] | null>(null);
  
  // UI State for Rules Modal
  const [showRules, setShowRules] = useState(false);

  // Initialize Game
  const resetGame = useCallback(() => {
    const newBoard = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null));
    setBoard(newBoard);
    setWinningLine(null);

    const isHumanOrder = Math.random() > 0.5;
    setHumanRole(isHumanOrder ? "Order" : "Chaos");
    setAiRole(isHumanOrder ? "Chaos" : "Order");

    setTurn(Math.random() > 0.5 ? "HUMAN" : "AI");
    setGameStatus("PLAYING");
  }, [boardSize]);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const executeMove = useCallback((r: number, c: number, symbol: "X" | "O") => {
    setBoard(prevBoard => {
        const newBoard = prevBoard.map((row) => [...row]);
        newBoard[r][c] = symbol;
        
        const xResult = checkWinLine(newBoard, "X");
        const oResult = checkWinLine(newBoard, "O");

        if (xResult.winner || oResult.winner) {
            setGameStatus("ORDER_WINS");
            setWinningLine(xResult.line || oResult.line);
        } else {
            const isFull = newBoard.every((row) => row.every((cell) => cell !== null));
            if (isFull) {
                setGameStatus("CHAOS_WINS");
            } else {
                setTurn((prev) => (prev === "HUMAN" ? "AI" : "HUMAN"));
            }
        }
        return newBoard;
    });
  }, []);

  useEffect(() => {
    if (turn === "AI" && gameStatus === "PLAYING") {
      const timer = setTimeout(() => {
        const move = getAIMove(board, aiRole);
        if (move) {
          executeMove(move.r, move.c, move.symbol);
        } else {
          setGameStatus("CHAOS_WINS");
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [turn, gameStatus, board, aiRole, executeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== "PLAYING" || turn !== "HUMAN" || board[r][c] !== null) return;
    executeMove(r, c, selectedSymbol);
  };

  const isGameOver = gameStatus !== "PLAYING";
  const didHumanWin =
    (gameStatus === "ORDER_WINS" && humanRole === "Order") ||
    (gameStatus === "CHAOS_WINS" && humanRole === "Chaos");

  const isWinningCell = (r: number, c: number) => {
    return winningLine?.some((cell) => cell.r === r && cell.c === c);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative">
      
      {/* HEADER */}
      <div className="mb-8 text-center space-y-2 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight">Order & Chaos</h1>
        
        <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Badge variant="outline" className={humanRole === 'Order' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"}>
                    You: {humanRole}
                </Badge>
                <span className="text-xs font-medium">vs</span>
                <Badge variant="outline" className={aiRole === 'Order' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"}>
                    AI: {aiRole}
                </Badge>
            </div>
            
            {/* Rules Toggle Button */}
            <button 
                onClick={() => setShowRules(true)}
                className="ml-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                title="How to Play"
            >
                <Info size={18} />
            </button>
        </div>
      </div>

      {/* GAME STATUS INDICATOR */}
      <div className="mb-6 h-8 flex items-center justify-center z-10">
        {isGameOver ? (
          <div className={cn(
            "px-4 py-1.5 rounded-full font-bold text-sm shadow-sm animate-in zoom-in duration-300 flex items-center gap-2",
            didHumanWin ? "bg-green-100 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800" : "bg-red-100 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800"
          )}>
            {didHumanWin ? "🎉 Victory! You Won." : "💀 Defeat. AI Won."}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
            {turn === "HUMAN" ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </span>
                Your Turn
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin"></span>
                AI is thinking...
              </>
            )}
          </div>
        )}
      </div>

      {/* CONTROLS: SYMBOL SELECTOR */}
      <div className={cn(
        "flex gap-3 mb-6 transition-all duration-300 z-10",
        (turn !== 'HUMAN' || isGameOver) ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
      )}>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 self-center mr-1">Select:</span>
        <Button
          variant={selectedSymbol === "X" ? "default" : "outline"}
          onClick={() => setSelectedSymbol("X")}
          className={cn(
            "w-14 h-12 text-xl font-bold transition-all shadow-sm",
            selectedSymbol === 'X' ? "bg-blue-600 hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-600 dark:ring-offset-slate-950" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
          )}
        >
          X
        </Button>
        <Button
          variant={selectedSymbol === "O" ? "default" : "outline"}
          onClick={() => setSelectedSymbol("O")}
          className={cn(
            "w-14 h-12 text-xl font-bold transition-all shadow-sm",
            selectedSymbol === 'O' ? "bg-red-600 hover:bg-red-700 ring-2 ring-offset-2 ring-red-600 dark:ring-offset-slate-950" : "text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          )}
        >
          O
        </Button>
      </div>

      {/* GAME BOARD */}
      <Card className="shadow-2xl border-slate-200 dark:border-slate-800 z-10 bg-white dark:bg-slate-900">
        <CardContent className="p-3">
          <div
            className="grid gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, rIndex) =>
              row.map((cell, cIndex) => {
                const isWinning = isWinningCell(rIndex, cIndex);
                return (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                    disabled={isGameOver || (turn !== "HUMAN" && cell === null) || cell !== null}
                    className={cn(
                      "w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-md transition-all duration-200 border-2",
                      // Empty State
                      cell === null 
                        ? "bg-white dark:bg-slate-900 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-transparent" 
                        : "border-slate-100 dark:border-slate-700 shadow-sm",
                      // Colors
                      cell === "X" && !isWinning && "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950",
                      cell === "O" && !isWinning && "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950",
                      // Winning Line
                      isWinning && "bg-green-500 text-white border-green-600 scale-105 z-20 shadow-lg ring-4 ring-green-100 dark:ring-green-900",
                      // Cursor
                      cell === null && !isGameOver && turn === "HUMAN" ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    {cell}
                  </button>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs z-10">
        <Button 
          className="w-full font-semibold shadow-sm" 
          onClick={resetGame}
          variant={isGameOver ? "default" : "secondary"}
        >
          {isGameOver ? "Play Again" : "Restart Game"}
        </Button>

        <div className="flex items-center gap-2 w-full bg-white dark:bg-slate-900 p-1 rounded-md border border-input shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 pl-2 whitespace-nowrap">Size:</span>
          <Select
            value={boardSize.toString()}
            onValueChange={(val) => setBoardSize(Number(val))}
            disabled={!isGameOver && board.some(r => r.some(c => c !== null))}
          >
            <SelectTrigger className="w-full border-0 shadow-none h-8 focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[6, 7, 8, 9].map((s) => (
                <SelectItem key={s} value={s.toString()}>
                  {s} × {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* RULES MODAL (Overlay) */}
      {showRules && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xl">How to Play</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowRules(false)} className="h-8 w-8 rounded-full">
                        <XIcon className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                    <div className="space-y-2">
                        <p><strong className="text-slate-900 dark:text-slate-100">1. Goal:</strong> Five in a row.</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li><strong className="text-blue-600 dark:text-blue-400">Order Wins:</strong> If 5 consecutive X's or O's appear (row, column, or diagonal).</li>
                            <li><strong className="text-red-600 dark:text-red-400">Chaos Wins:</strong> If the board fills up without any line of 5.</li>
                        </ul>
                    </div>
                    <div className="space-y-2">
                        <p><strong className="text-slate-900 dark:text-slate-100">2. The Twist:</strong></p>
                        <p>Unlike Tic-Tac-Toe, <strong>you control both X and O.</strong> On your turn, you can choose to place either symbol to help your strategy.</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Winning Example (Order):</p>
                        <div className="flex gap-1">
                            {['X','X','X','X','X'].map((x,i) => (
                                <span key={i} className="w-5 h-5 flex items-center justify-center bg-green-500 text-white font-bold rounded">{x}</span>
                            ))}
                        </div>
                    </div>
                    <Button className="w-full mt-2" onClick={() => setShowRules(false)}>Got it!</Button>
                </CardContent>
            </Card>
        </div>
      )}

    </main>
  );
}