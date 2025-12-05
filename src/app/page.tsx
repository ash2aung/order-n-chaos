"use client";
import { useState, useEffect, useCallback } from "react";
import { CellValue, PlayerRole, GameStatus } from "../utils/type";
import { checkWinLine, getAIMove } from "../utils/gameLogic";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function Home() {
  const [boardSize, setBoardSize] = useState(6);
  const [board, setBoard] = useState<CellValue[][]>([]);
  const [humanRole, setHumanRole] = useState<PlayerRole>("Order");
  const [aiRole, setAiRole] = useState<PlayerRole>("Chaos");
  const [turn, setTurn] = useState<"HUMAN" | "AI">("HUMAN");
  const [gameStatus, setGameStatus] = useState<GameStatus>("PLAYING");
  const [selectedSymbol, setSelectedSymbol] = useState<"X" | "O">("X");
  const [winningLine, setWinningLine] = useState<{r: number, c: number}[] | null>(null);

  // Wrap in useCallback to avoid dependency warnings
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
        
        // Check for wins immediately after state update logic
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

  // AI Turn Effect
  useEffect(() => {
    if (turn === "AI" && gameStatus === "PLAYING") {
      const timer = setTimeout(() => {
        const move = getAIMove(board, aiRole);
        if (move) {
          executeMove(move.r, move.c, move.symbol);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [turn, gameStatus, board, aiRole, executeMove]);

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== "PLAYING" || turn !== "HUMAN" || board[r][c] !== null)
      return;
    executeMove(r, c, selectedSymbol);
  };

  const isGameOver = gameStatus !== "PLAYING";
  const didHumanWin =
    (gameStatus === "ORDER_WINS" && humanRole === "Order") ||
    (gameStatus === "CHAOS_WINS" && humanRole === "Chaos");

  // Helper to check if a cell is part of the winning line
  const isWinningCell = (r: number, c: number) => {
    return winningLine?.some((cell) => cell.r === r && cell.c === c);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Order & Chaos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {humanRole === "Order" 
            ? "Connect 5 of any symbol to win." 
            : "Block the AI from connecting 5."}
        </p>
      </div>

      {/* Role Badges */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant={humanRole === "Order" ? "default" : "secondary"} className="text-sm px-3 py-1">
          You: {humanRole}
        </Badge>
        <Separator orientation="vertical" className="h-4" />
        <Badge variant={aiRole === "Order" ? "default" : "secondary"} className="text-sm px-3 py-1">
          AI: {aiRole}
        </Badge>
      </div>

      {/* Game Status / Turn Indicator */}
      <div className="mb-6 h-8 flex items-center justify-center">
        {isGameOver ? (
          <div className={cn(
            "px-4 py-1.5 rounded-full font-bold text-sm animate-in zoom-in duration-300",
            didHumanWin 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {didHumanWin ? "Victory! You Win." : "Defeat. AI Wins."}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {turn === "HUMAN" ? (
              <span className="flex items-center gap-2 text-primary font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                </span>
                Your Turn
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"/>
                AI Thinking...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Symbol Selector */}
      <div className={cn(
        "flex gap-2 mb-6 transition-all duration-300",
        (turn !== "HUMAN" || isGameOver) ? "opacity-50 pointer-events-none grayscale" : "opacity-100"
      )}>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground self-center mr-2">Place:</span>
        <Button
          variant={selectedSymbol === "X" ? "default" : "outline"}
          onClick={() => setSelectedSymbol("X")}
          className={cn("w-12 h-10 font-bold text-lg", selectedSymbol === "X" && "ring-2 ring-offset-2 ring-primary")}
        >
          X
        </Button>
        <Button
          variant={selectedSymbol === "O" ? "default" : "outline"}
          onClick={() => setSelectedSymbol("O")}
          className={cn("w-12 h-10 font-bold text-lg", selectedSymbol === "O" && "ring-2 ring-offset-2 ring-primary")}
        >
          O
        </Button>
      </div>

      {/* Game Board */}
      <Card className="p-1 shadow-lg border-muted">
        <CardContent className="p-2">
          <div
            className="grid gap-1 bg-muted/50 p-1 rounded-md"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, rIndex) =>
              row.map((cell, cIndex) => {
                const isWin = isWinningCell(rIndex, cIndex);
                return (
                  <button
                    key={`${rIndex}-${cIndex}`}
                    onClick={() => handleCellClick(rIndex, cIndex)}
                    disabled={isGameOver || (turn !== "HUMAN" && cell === null) || cell !== null}
                    className={cn(
                      "w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-bold rounded transition-all duration-200",
                      // Empty state
                      cell === null ? "bg-card hover:bg-accent" : "shadow-sm",
                      // Winning state
                      isWin && "bg-green-500 text-white scale-105 z-10",
                      // Standard filled state (if not winning)
                      !isWin && cell === "X" && "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
                      !isWin && cell === "O" && "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
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

      {/* Footer Controls */}
      <div className="mt-8 flex items-center gap-4 w-full max-w-xs justify-center">
        <Button 
            variant={isGameOver ? "default" : "outline"} 
            size="sm" 
            onClick={resetGame}
            className="w-full"
        >
          {isGameOver ? "Play Again" : "Reset Board"}
        </Button>

        <Select
          value={boardSize.toString()}
          onValueChange={(val) => setBoardSize(Number(val))}
          disabled={!isGameOver && board.some(r => r.some(c => c !== null))}
        >
          <SelectTrigger className="w-28 h-9">
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
    </main>
  );
}