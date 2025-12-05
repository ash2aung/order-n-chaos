"use client";
import { useState, useEffect } from "react";
import { CellValue, PlayerRole, GameStatus } from "../utils/type";
import { checkFiveInARow, getAIMove } from "../utils/gameLogic";
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

export default function Home() {
  const [boardSize, setBoardSize] = useState(6);
  const [board, setBoard] = useState<CellValue[][]>([]);
  const [humanRole, setHumanRole] = useState<PlayerRole>("Order");
  const [aiRole, setAiRole] = useState<PlayerRole>("Chaos");
  const [turn, setTurn] = useState<"HUMAN" | "AI">("HUMAN");
  const [gameStatus, setGameStatus] = useState<GameStatus>("PLAYING");
  const [selectedSymbol, setSelectedSymbol] = useState<"X" | "O">("X");

  useEffect(() => {
    resetGame();
  }, [boardSize]);

  const resetGame = () => {
    const newBoard = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(null));
    setBoard(newBoard);

    const isHumanOrder = Math.random() > 0.5;
    setHumanRole(isHumanOrder ? "Order" : "Chaos");
    setAiRole(isHumanOrder ? "Chaos" : "Order");

    setTurn(Math.random() > 0.5 ? "HUMAN" : "AI");
    setGameStatus("PLAYING");
  };

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
  }, [turn, gameStatus, board, aiRole]);

  const executeMove = (r: number, c: number, symbol: "X" | "O") => {
    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = symbol;
    setBoard(newBoard);

    const xWins = checkFiveInARow(newBoard, "X");
    const oWins = checkFiveInARow(newBoard, "O");

    if (xWins || oWins) {
      setGameStatus("ORDER_WINS");
      return;
    }

    const isFull = newBoard.every((row) => row.every((cell) => cell !== null));
    if (isFull) {
      setGameStatus("CHAOS_WINS");
      return;
    }

    setTurn((prev) => (prev === "HUMAN" ? "AI" : "HUMAN"));
  };

  const handleCellClick = (r: number, c: number) => {
    if (gameStatus !== "PLAYING" || turn !== "HUMAN" || board[r][c] !== null)
      return;
    executeMove(r, c, selectedSymbol);
  };

  const isGameOver = gameStatus !== "PLAYING";
  const didHumanWin =
    (gameStatus === "ORDER_WINS" && humanRole === "Order") ||
    (gameStatus === "CHAOS_WINS" && humanRole === "Chaos");

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Order & Chaos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          A game of pattern and entropy
        </p>
      </div>

      {/* Role Badges */}
      <div className="flex items-center gap-3 mb-6">
        <Badge variant="outline" className="font-normal">
          You: {humanRole}
        </Badge>
        <Separator orientation="vertical" className="h-4" />
        <Badge variant="secondary" className="font-normal">
          AI: {aiRole}
        </Badge>
      </div>

      {/* Status */}
      <div className="mb-6 h-6">
        {isGameOver ? (
          <p
            className={`text-sm font-medium ${didHumanWin ? "text-foreground" : "text-muted-foreground"}`}
          >
            {didHumanWin ? "You win." : "AI wins."}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {turn === "HUMAN" ? "Your turn" : "Thinking..."}
          </p>
        )}
      </div>

      {/* Symbol Selector */}
      {gameStatus === "PLAYING" && turn === "HUMAN" && (
        <div className="flex gap-2 mb-6">
          <Button
            variant={selectedSymbol === "X" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedSymbol("X")}
            className="w-12 font-mono"
          >
            X
          </Button>
          <Button
            variant={selectedSymbol === "O" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSelectedSymbol("O")}
            className="w-12 font-mono"
          >
            O
          </Button>
        </div>
      )}

      {/* Game Board */}
      <Card className="p-1">
        <CardContent className="p-2">
          <div
            className="grid gap-px bg-border"
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, rIndex) =>
              row.map((cell, cIndex) => (
                <button
                  key={`${rIndex}-${cIndex}`}
                  onClick={() => handleCellClick(rIndex, cIndex)}
                  disabled={
                    gameStatus !== "PLAYING" ||
                    turn !== "HUMAN" ||
                    cell !== null
                  }
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 
                    flex items-center justify-center 
                    text-lg font-mono font-medium
                    bg-card
                    transition-colors duration-150
                    ${cell === null && gameStatus === "PLAYING" && turn === "HUMAN" ? "hover:bg-accent cursor-pointer" : "cursor-default"}
                    ${cell === "X" ? "text-foreground" : "text-muted-foreground"}
                    disabled:cursor-default
                  `}
                >
                  {cell}
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={resetGame}>
          New Game
        </Button>

        <Select
          value={boardSize.toString()}
          onValueChange={(val) => setBoardSize(Number(val))}
        >
          <SelectTrigger className="w-24 h-9">
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

      {/* Footer */}
      <footer className="mt-12 text-xs text-muted-foreground">
        <p>Order seeks five in a row. Chaos seeks to prevent it.</p>
      </footer>
    </main>
  );
}