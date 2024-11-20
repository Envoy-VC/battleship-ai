/* eslint-disable @typescript-eslint/no-non-null-assertion -- safe  */
import { CellType } from './types';

export class Grid {
	size: number;
	cells: CellType[][];

	constructor(size: number) {
		this.size = size;
		this.cells = [];
		this.init();
	}

	private init(): void {
		for (let x = 0; x < this.size; x++) {
			const row: CellType[] = [];
			this.cells[x] = row;
			for (let y = 0; y < this.size; y++) {
				row.push(CellType.Empty);
			}
		}
	}

	updateCell(x: number, y: number, type: CellType): void {
		this.cells[x]![y] = type;
	}

	isMiss(x: number, y: number): boolean {
		return this.cells[x]![y] === CellType.Miss;
	}

	isDamagedShip(x: number, y: number): boolean {
		return this.cells[x]![y] === CellType.Hit;
	}
}
