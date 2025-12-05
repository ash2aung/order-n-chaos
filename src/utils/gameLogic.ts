import { CellValue, PlayerRole } from './type';

type WinResult = {
  winner: boolean;
  line: { r: number; c: number }[] | null;
};

// Check if a specific symbol has won and return the winning coordinates
export const checkWinLine = (board: CellValue[][], piece: CellValue): WinResult => {
  if (!piece) return { winner: false, line: null };
  const size = board.length;

  // 1. Check Rows
  for (let r = 0; r < size; r++) {
    for (let c = 0; c <= size - 5; c++) {
      if (board[r].slice(c, c + 5).every(cell => cell === piece)) {
        return { winner: true, line: Array.from({ length: 5 }, (_, k) => ({ r, c: c + k })) };
      }
    }
  }

  // 2. Check Columns
  for (let c = 0; c < size; c++) {
    for (let r = 0; r <= size - 5; r++) {
      let match = true;
      const line = [];
      for (let k = 0; k < 5; k++) {
        if (board[r + k][c] !== piece) {
          match = false;
          break;
        }
        line.push({ r: r + k, c });
      }
      if (match) return { winner: true, line };
    }
  }

  // 3. Check Diagonal (Top-Left to Bottom-Right)
  for (let r = 0; r <= size - 5; r++) {
    for (let c = 0; c <= size - 5; c++) {
      let match = true;
      const line = [];
      for (let k = 0; k < 5; k++) {
        if (board[r + k][c + k] !== piece) {
          match = false;
          break;
        }
        line.push({ r: r + k, c: c + k });
      }
      if (match) return { winner: true, line };
    }
  }

  // 4. Check Diagonal (Bottom-Left to Top-Right)
  for (let r = 4; r < size; r++) {
    for (let c = 0; c <= size - 5; c++) {
      let match = true;
      const line = [];
      for (let k = 0; k < 5; k++) {
        if (board[r - k][c + k] !== piece) {
          match = false;
          break;
        }
        line.push({ r: r - k, c: c + k });
      }
      if (match) return { winner: true, line };
    }
  }

  return { winner: false, line: null };
};

// --- HELPER: Compatible wrapper for simple boolean checks ---
export const checkFiveInARow = (board: CellValue[][], piece: CellValue): boolean => {
  return checkWinLine(board, piece).winner;
};

// Smarter AI Strategy
export const getAIMove = (board: CellValue[][], aiRole: PlayerRole): { r: number, c: number, symbol: 'X' | 'O' } | null => {
  const size = board.length;
  const emptySpots: { r: number, c: number }[] = [];

  // Find all empty spots
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (board[r][c] === null) emptySpots.push({ r, c });
    }
  }

  if (emptySpots.length === 0) return null;

  // Helper to simulate a move
  const simulateMove = (r: number, c: number, symbol: 'X' | 'O') => {
    board[r][c] = symbol;
    const winX = checkWinLine(board, 'X').winner;
    const winO = checkWinLine(board, 'O').winner;
    board[r][c] = null; // Backtrack
    return winX || winO;
  };

  // --- PRIORITY 1: IMMEDIATE WIN (If AI is Order) ---
  if (aiRole === 'Order') {
    for (const { r, c } of emptySpots) {
      if (simulateMove(r, c, 'X')) return { r, c, symbol: 'X' };
      if (simulateMove(r, c, 'O')) return { r, c, symbol: 'O' };
    }
  }

  // --- PRIORITY 2: BLOCK OPPONENT WIN (If AI is Chaos) ---
  // If placing 'X' here creates a win, Chaos MUST place 'O' to block (and vice versa).
  for (const { r, c } of emptySpots) {
    const xCreatesWin = simulateMove(r, c, 'X');
    const oCreatesWin = simulateMove(r, c, 'O');

    if (xCreatesWin && !oCreatesWin) return { r, c, symbol: 'O' }; // Block X by playing O
    if (oCreatesWin && !xCreatesWin) return { r, c, symbol: 'X' }; // Block O by playing X
    // Note: If BOTH create a win, Chaos is doomed anyway, so it falls through to random.
  }

  // --- PRIORITY 3: PREVENT SETUPS (If AI is Chaos) ---
  // (Optional: Look for 4-in-a-rows and block them before they become open-ended threats)
  
  // --- PRIORITY 4: STRATEGIC / RANDOM ---
  // Pick center-ish tiles if available
  const center = size / 2;
  emptySpots.sort((a, b) => {
    const distA = Math.abs(a.r - center) + Math.abs(a.c - center);
    const distB = Math.abs(b.r - center) + Math.abs(b.c - center);
    return distA - distB;
  });

  // Add some randomness to not be perfectly predictable
  const candidate = emptySpots[Math.floor(Math.random() * Math.min(3, emptySpots.length))];
  const randomSymbol = Math.random() > 0.5 ? 'X' : 'O';
  
  return { r: candidate.r, c: candidate.c, symbol: randomSymbol };
};