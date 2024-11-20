export enum CellType {
	Empty = 0, // Water (empty)
	Miss = 2, // Missed shot
	Hit = 3, // Hit ship
}

export interface Ship {
	size: number;
	positions: { x: number; y: number }[]; // List of occupied positions
}

export interface Coordinate {
	x: number;
	y: number;
}

export interface AttackOutcome extends Coordinate {
	outcome: 'hit' | 'miss';
}
