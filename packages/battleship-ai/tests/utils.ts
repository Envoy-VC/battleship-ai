/* eslint-disable @typescript-eslint/no-non-null-assertion -- safe */
import chalk from 'chalk';
import { type Ship, type AttackOutcome } from '../src/types';

export const drawBoard = (
	size: number,
	cellWidth: number,
	cellHeight: number,
	moves: AttackOutcome[],
	ships: Ship[]
): void => {
	const horizontalLine = `+${`${'-'.repeat(cellWidth)}+`.repeat(size)}`;

	const board = moves;

	const shipLocations: string[] = [];

	for (const ship of ships) {
		ship.positions.forEach((p) => {
			shipLocations.push(`${String(p.x)}-${String(p.y)}`);
		});
	}

	const hitMoves = board
		.filter((move) => move.outcome === 'hit')
		.map((m) => `${String(m.x)}-${String(m.y)}`);
	const missMoves = board
		.filter((move) => move.outcome === 'miss')
		.map((m) => `${String(m.x)}-${String(m.y)}`);

	for (let row = 0; row < size; row++) {
		console.log(horizontalLine);

		for (let col = 0; col < cellHeight; col++) {
			let coloredRow = '|';
			for (let h = 0; h < size; h++) {
				if (missMoves.includes(`${String(h)}-${String(row)}`)) {
					coloredRow += chalk.bgHex('#0000FF').bold(' '.repeat(cellWidth));
				} else if (hitMoves.includes(`${String(h)}-${String(row)}`)) {
					coloredRow += chalk.bgHex('#FF0000').bold(' '.repeat(cellWidth));
				} else if (shipLocations.includes(`${String(h)}-${String(row)}`)) {
					coloredRow += chalk.bgHex('#808080').bold(' '.repeat(cellWidth));
				} else {
					coloredRow += chalk.bgHex('#000000').bold(' '.repeat(cellWidth));
				}
				coloredRow += '|';
			}
			console.log(coloredRow);
		}
	}
	console.log(horizontalLine);
};

export function generateColors(n: number): string[] {
	const startColor = { r: 255, g: 255, b: 0 }; // Yellow
	const endColor = { r: 255, g: 0, b: 0 }; // Red

	const gradient: string[] = [];

	for (let i = 0; i < n; i++) {
		const ratio = i / (n - 1); // Scale between 0 and 1
		const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
		const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
		const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

		const hex = [
			r.toString(16).padStart(2, '0'),
			g.toString(16).padStart(2, '0'),
			b.toString(16).padStart(2, '0'),
		]
			.join('')
			.toLowerCase(); // Ensure lowercase for regex

		if (/[a-f\d]{6}|[a-f\d]{3}/i.test(hex)) {
			gradient.push(`#${hex}`);
		} else {
			throw new Error(`Generated hex color "${hex}" does not match the regex`);
		}
	}

	return gradient;
}

export const drawHeatMap = (
	size: number,
	cellWidth: number,
	cellHeight: number,
	heatmap: number[][]
): void => {
	const normalizedHeatMap = heatmap.map((row) => {
		return row.map((v) => Math.floor(v));
	});
	// check if heatmap all are 0
	if (normalizedHeatMap.every((row) => row.every((v) => v === 0))) {
		return;
	}
	const max = normalizedHeatMap.flat().sort((a, b) => b - a)[0] ?? 0;
	const colors = generateColors(max + 1);

	for (let row = 0; row < size; row++) {
		for (let col = 0; col < cellHeight; col++) {
			let coloredRow = '';
			for (let h = 0; h < size; h++) {
				const value = heatmap[h]![row]!;
				const color = colors[value]!;
				coloredRow += chalk.bgHex(color).bold(' '.repeat(cellWidth));
			}
			console.log(coloredRow);
		}
	}
};
