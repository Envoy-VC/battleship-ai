/* eslint-disable @typescript-eslint/no-non-null-assertion -- safe */
import { Grid } from './grid';
import {
	type AttackOutcome,
	CellType,
	type Ship,
	type Coordinate,
} from './types';

export class BattleShipAI {
	private probGrid: number[][];
	private virtualGrid: Grid;
	private ships: number[];

	constructor(gameSize: number, ships: number[]) {
		this.virtualGrid = new Grid(gameSize);
		this.ships = ships;

		this.probGrid = [];
		this.initProbs(gameSize);
	}

	private static readonly PROB_WEIGHT = 5000; // Arbitrarily big number
	private static readonly OPEN_LOW_MIN = 10;
	private static readonly OPEN_LOW_MAX = 20;
	private static readonly OPEN_MED_MIN = 15;
	private static readonly OPEN_MED_MAX = 25;
	private static readonly OPEN_HIGH_MIN = 20;
	private static readonly OPEN_HIGH_MAX = 30;

	private static readonly OPENINGS = [
		{ x: 7, y: 3, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 6, y: 2, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 3, y: 7, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 2, y: 6, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 6, y: 6, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 3, y: 3, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 5, y: 5, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 4, y: 4, weight: getRandom(this.OPEN_LOW_MIN, this.OPEN_LOW_MAX) },
		{ x: 0, y: 8, weight: getRandom(this.OPEN_MED_MIN, this.OPEN_MED_MAX) },
		{ x: 1, y: 9, weight: getRandom(this.OPEN_HIGH_MIN, this.OPEN_HIGH_MAX) },
		{ x: 8, y: 0, weight: getRandom(this.OPEN_MED_MIN, this.OPEN_MED_MAX) },
		{ x: 9, y: 1, weight: getRandom(this.OPEN_HIGH_MIN, this.OPEN_HIGH_MAX) },
		{ x: 9, y: 9, weight: getRandom(this.OPEN_HIGH_MIN, this.OPEN_HIGH_MAX) },
		{ x: 0, y: 0, weight: getRandom(this.OPEN_HIGH_MIN, this.OPEN_HIGH_MAX) },
	];

	// Initializes the probability grid
	private initProbs(size: number): void {
		for (let x = 0; x < size; x++) {
			const row: number[] = [];
			for (let y = 0; y < size; y++) {
				row.push(0);
			}
			this.probGrid.push(row);
		}
	}

	private updateGrid(moves: AttackOutcome[]): void {
		this.resetGrid();
		moves.forEach((move) => {
			if (move.outcome === 'hit') {
				this.virtualGrid.updateCell(move.x, move.y, CellType.Hit);
			} else {
				this.virtualGrid.updateCell(move.x, move.y, CellType.Miss);
			}
		});
	}

	private resetGrid(): void {
		for (let x = 0; x < this.virtualGrid.size; x++) {
			for (let y = 0; y < this.virtualGrid.size; y++) {
				this.virtualGrid.updateCell(x, y, CellType.Empty);
			}
		}
	}

	// Resets the probability grid
	private resetProbs(): void {
		for (const row of this.probGrid) {
			row.fill(0);
		}
	}

	private isValidCell(x: number, y: number): boolean {
		return (
			x >= 0 && y >= 0 && x < this.virtualGrid.size && y < this.virtualGrid.size
		);
	}

	private canPlaceShip(
		x: number,
		y: number,
		length: number,
		direction: 'vertical' | 'horizontal'
	): boolean {
		for (let i = 0; i < length; i++) {
			const nx = x + (direction === 'horizontal' ? i : 0);
			const ny = y + (direction === 'vertical' ? i : 0);

			if (
				!this.isValidCell(nx, ny) ||
				this.virtualGrid.cells[nx]![ny] === CellType.Miss
			) {
				return false; // Can't place a ship here if out of bounds or overlapping a miss.
			}
		}
		return true;
	}

	// Updates the probability grid based on ship positions and previous outcomes
	updateProbs(previousAttacks: AttackOutcome[]): void {
		this.updateGrid(previousAttacks);
		this.resetProbs();

		// Apply the AI opening patterns
		for (const cell of BattleShipAI.OPENINGS) {
			if (this.probGrid[cell.x]![cell.y]! !== 0) {
				this.probGrid[cell.x]![cell.y]! += cell.weight;
			}
		}

		for (let x = 0; x < this.virtualGrid.size; x++) {
			for (let y = 0; y < this.virtualGrid.size; y++) {
				if (this.virtualGrid.cells[x]![y] === CellType.Hit) {
					// For a hit, consider adjacent tiles for continuation of a ship.
					this.evaluateAdjacentTiles(x, y);
				} else if (this.virtualGrid.cells[x]![y] === CellType.Empty) {
					// For empty tiles, consider all possible ships fitting through this cell.
					this.evaluateCellForShips(x, y);
				}
			}
		}

		// Adjust probabilities to avoid already attacked cells
		for (const attack of previousAttacks) {
			this.probGrid[attack.x]![attack.y] = 0; // Prevent re-targeting
		}
	}

	private evaluateAdjacentTiles(hitX: number, hitY: number): void {
		const directions = [
			{ dx: 1, dy: 0 }, // Horizontal right
			{ dx: -1, dy: 0 }, // Horizontal left
			{ dx: 0, dy: 1 }, // Vertical down
			{ dx: 0, dy: -1 }, // Vertical up
		];

		for (const { dx, dy } of directions) {
			let nx = hitX + dx;
			let ny = hitY + dy;

			// Check if the adjacent cell is valid and empty
			while (
				this.isValidCell(nx, ny) &&
				this.virtualGrid.cells[nx]![ny] === CellType.Empty
			) {
				this.probGrid[nx]![ny]! += BattleShipAI.PROB_WEIGHT; // Assign higher probability to tiles adjacent to hits
				nx += dx;
				ny += dy;
			}
		}
	}

	private numHitCellsCovered(coords: Coordinate[]): number {
		return coords.reduce((count, coord) => {
			return this.virtualGrid.cells[coord.x]![coord.y] === CellType.Hit
				? count + 1
				: count;
		}, 0);
	}

	private getShipCoordinates(
		x: number,
		y: number,
		length: number,
		direction: 'horizontal' | 'vertical'
	): Coordinate[] {
		const coords: Coordinate[] = [];

		for (let i = 0; i < length; i++) {
			if (direction === 'horizontal') {
				coords.push({ x: x + i, y });
			} else {
				coords.push({ x, y: y + i });
			}
		}

		return coords;
	}

	private evaluateCellForShips(x: number, y: number): void {
		for (const ship of this.ships) {
			const directions = ['horizontal', 'vertical'] as const;

			for (const direction of directions) {
				if (this.canPlaceShip(x, y, ship, direction)) {
					const coords = this.getShipCoordinates(x, y, ship, direction);

					// Check if the ship passes through hit cells
					const hitCount = this.numHitCellsCovered(coords);
					const baseProbability = 1;

					if (hitCount > 0) {
						// Add weight based on the number of hits covered
						for (const coord of coords) {
							this.probGrid[coord.x]![coord.y]! +=
								baseProbability + hitCount * BattleShipAI.PROB_WEIGHT;
						}
					} else {
						// Increment probability for empty cells
						for (const coord of coords) {
							this.probGrid[coord.x]![coord.y]! += baseProbability;
						}
					}
				}
			}
		}
	}

	// Get the coordinates of the highest probability cell
	getHighestProbabilityTarget(previousMoves: AttackOutcome[]): {
		x: number;
		y: number;
	} {
		this.updateProbs(previousMoves);

		let maxProb = -1;
		const maxProbs: Coordinate[] = [];

		for (let x = 0; x < this.probGrid.length; x++) {
			for (let y = 0; y < this.probGrid[x]!.length; y++) {
				if (this.probGrid[x]![y]! > maxProb) {
					maxProb = this.probGrid[x]![y]!;
					maxProbs.length = 0; // Clear previous maxProb cells
					maxProbs.push({ x, y });
				} else if (this.probGrid[x]![y] === maxProb) {
					maxProbs.push({ x, y });
				}
			}
		}

		// Return a random choice among cells with the highest probability
		return maxProbs[Math.floor(Math.random() * maxProbs.length)]!;
	}

	public getHeatmap(): number[][] {
		return this.probGrid;
	}

	public getRandomShipPlacements(): Ship[] {
		const ships: Ship[] = [];
		const inner = Array<string>(this.virtualGrid.size).fill('empty');
		const board: string[][] = Array.from(
			{ length: this.virtualGrid.size },
			() => [...inner]
		);

		// Function to check if the ship can be placed at the specified position
		const isValidPlacement = (
			x: number,
			y: number,
			size: number,
			isHorizontal: boolean
		): boolean => {
			if (isHorizontal) {
				if (x + size > this.virtualGrid.size) return false; // Ship exceeds board width
				for (let i = 0; i < size; i++) {
					if (board[y]![x + i]! !== 'empty') return false; // Cell is already occupied
				}
			} else {
				if (y + size > this.virtualGrid.size) return false; // Ship exceeds board height
				for (let i = 0; i < size; i++) {
					if (board[y + i]![x]! !== 'empty') return false; // Cell is already occupied
				}
			}
			return true;
		};

		// Function to find all valid positions for a ship of given size and orientation
		const findValidPositions = (
			size: number
		): { x: number; y: number; isHorizontal: boolean }[] => {
			const validPositions: { x: number; y: number; isHorizontal: boolean }[] = [];
			for (let x = 0; x < this.virtualGrid.size; x++) {
				for (let y = 0; y < this.virtualGrid.size; y++) {
					if (isValidPlacement(x, y, size, true)) {
						// Horizontal placement
						validPositions.push({ x, y, isHorizontal: true });
					}
					if (isValidPlacement(x, y, size, false)) {
						// Vertical placement
						validPositions.push({ x, y, isHorizontal: false });
					}
				}
			}
			return validPositions;
		};

		// Function to place a ship at a valid position
		const placeShip = (size: number): Ship => {
			const ship: Ship = { size, positions: [] };
			const validPositions = findValidPositions(size);
			if (validPositions.length === 0) {
				throw new Error(`No valid placements for ship of size ${String(size)}`);
			}

			// Randomly select one valid placement
			const randomPosition =
				validPositions[Math.floor(Math.random() * validPositions.length)];
			const { x, y, isHorizontal } = randomPosition!;

			// Place the ship on the board
			for (let i = 0; i < size; i++) {
				if (isHorizontal) {
					board[y]![x + i] = 'ship';
					ship.positions.push({ x: x + i, y });
				} else {
					board[y + i]![x] = 'ship';
					ship.positions.push({ x, y: y + i });
				}
			}

			return ship;
		};

		// Place each ship
		for (const ship of this.ships) {
			ships.push(placeShip(ship));
		}

		return ships;
	}

	public calculateOutcome(x: number, y: number, ships: Ship[]): 'hit' | 'miss' {
		for (const ship of ships) {
			for (const position of ship.positions) {
				if (position.x === x && position.y === y) {
					return 'hit';
				}
			}
		}
		return 'miss';
	}
}

// Utility function to get a random number between min and max
function getRandom(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export { Grid };
export * from './types';
