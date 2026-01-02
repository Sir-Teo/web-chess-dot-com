export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

export type BoardState = (Piece | null)[][];

export interface NavItem {
  icon: any; // Lucide icon component type
  label: string;
  active?: boolean;
}

export interface GameStat {
  icon: string; // URL or emoji for simplicity in stats
  value: string | number;
  label: string;
  subLabel?: string;
  color?: string;
}

export interface User {
  username: string;
  avatar: string;
  flag: string; // Emoji flag
  rating: number;
  title?: string; // GM, IM, etc.
}