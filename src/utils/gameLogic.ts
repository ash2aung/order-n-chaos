import { CellValue, PlayerRole } from './types';

// --- HELPER: Check for 5 in a row (Ported from is_5_in_a_row) ---
export const checkFiveInARow = (board: CellValue[][], piece: CellValue): boolean => {
  if (!piece) return false;
  const size = board.length;

  // 1. Check Rows
  for (let r = 0; r < size; r++) {
    let count = 0;
    for (let c = 0; c < size; c++) {
      board[r][c] === piece ? count++ : count = 0;
      if (count === 5) return true;
    }
  }

  // 2. Check Columns
  for (let c = 0; c < size; c++) {
    let count = 0;
    for (let r = 0; r < size; r++) {
      board[r][c] === piece ? count++ : count = 0;
      if (count === 5) return true;
    }
  }

  // 3. Check Diagonal (Top-Left to Bottom-Right)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = 0; c <= size - 5; c++) {
      let match = true;
      for (let k = 0; k < 5; k++) {
        if (board[r + k][c + k] !== piece) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  // 4. Check Diagonal (Top-Right to Bottom-Left)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = size - 1; c >= 4; c--) {
      let match = true;
      for (let k = 0; k < 5; k++) {
        if (board[r + k][c - k] !== piece) {
          match = false;
          break;
        }
      }
      if (match) return true;
    }
  }

  return false;
};

// --- HELPER: AI Strategy (Ported from AIPlayer class) ---
export const getAIMove = (board: CellValue[][], aiRole: PlayerRole): { r: number, c: number, symbol: 'X' | 'O' } | null => {
  const size = board.length;
  const emptySpots: { r: number, c: number }[] = [];

  // Identify all empty spots
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) {
        emptySpots.push({ r, c });
      }
    }
  }

  if (emptySpots.length === 0) return null;

  // STRATEGY 1: Check for winning moves (for either X or O)
  // If Order: Look for a move that completes 5.
  // If Chaos: Look for a move that blocks the opponent from completing 5.
  
  // We simulate placing X and O in every empty spot
  for (let spot of emptySpots) {
    for (let symbol of ['X', 'O'] as const) {
      // Temporarily make move
      board[spot.r][spot.c] = symbol;
      const isWin = checkFiveInARow(board, symbol);
      // Undo move
      board[spot.r][spot.c] = null;

      if (isWin) {
        // If AI is Order, take the win.
        if (aiRole === 'Order') return { r: spot.r, c: spot.c, symbol };
        
        // If AI is Chaos, we found a spot where Order could win. BLOCK IT!
        // Chaos blocks by placing the *opposite* symbol, or the same symbol if that breaks the pattern.
        // Simple blocking strategy: Place the opposite of what would win.
        if (aiRole === 'Chaos') {
            const blockSymbol = symbol === 'X' ? 'O' : 'X';
            return { r: spot.r, c: spot.c, symbol: blockSymbol };
        }
      }
    }
  }

  // STRATEGY 2: Random Move (Fallback)
  const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
  const randomSymbol = Math.random() > 0.5 ? 'X' : 'O';
  return { r: randomSpot.r, c: randomSpot.c, symbol: randomSymbol };
};