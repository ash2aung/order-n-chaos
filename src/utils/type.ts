export type PlayerRole = 'Order' | 'Chaos';
export type CellValue = 'X' | 'O' | null;
export type GameStatus = 'PLAYING' | 'ORDER_WINS' | 'CHAOS_WINS';

export interface GameState {
  board: CellValue[][];
  boardSize: number;
  turn: 'HUMAN' | 'AI';
  humanRole: PlayerRole;
  aiRole: PlayerRole;
  gameStatus: GameStatus;
  statusMessage: string;
}