import { AttackOutcome, BattleShipAI, Ship } from '../src';
import { describe, it, beforeAll, expect } from 'vitest';

describe('Next Move', () => {
	let ai: BattleShipAI;
	let ships: Ship[];

	beforeAll(() => {
		ai = new BattleShipAI(10, [5, 4, 3, 3, 2]);
		ships = ai.getRandomShipPlacements();
	});

	it('should get next move for no previous moves', () => {
		const move = ai.getHighestProbabilityTarget([]);
		expect(move).toBeTruthy();
	});

	it('should get next move for low previous hits', () => {
		const noOfMoves = Math.floor(Math.random() * 10) + 5;
		const previousMoves: AttackOutcome[] = [];
		const map = new Map<string, boolean>();
		while (previousMoves.length !== noOfMoves) {
			const x = Math.floor(Math.random() * 10);
			const y = Math.floor(Math.random() * 10);
			if (!map.has(`${x},${y}`)) {
				const outcome = ships.some((ship) => {
					return ship.positions.some((p) => p.x === x && p.y === y);
				});
				previousMoves.push({ x, y, outcome: outcome ? 'hit' : 'miss' });
				map.set(`${x},${y}`, true);
			}
		}
		const move = ai.getHighestProbabilityTarget(previousMoves);
		expect(move).toBeTruthy();
	});

	it('should get next move for high previous hits', () => {
		const noOfMoves = Math.floor(Math.random() * 10) + 20;
		const previousMoves: AttackOutcome[] = [];
		const map = new Map<string, boolean>();
		while (previousMoves.length !== noOfMoves) {
			const x = Math.floor(Math.random() * 10);
			const y = Math.floor(Math.random() * 10);
			if (!map.has(`${x},${y}`)) {
				const outcome = ships.some((ship) => {
					return ship.positions.some((p) => p.x === x && p.y === y);
				});
				previousMoves.push({ x, y, outcome: outcome ? 'hit' : 'miss' });
				map.set(`${x},${y}`, true);
			}
		}
		const move = ai.getHighestProbabilityTarget(previousMoves);
		expect(move).toBeTruthy();
	});

	it('should not get next move for all hits', () => {
		const previousMoves: AttackOutcome[] = [];

		for (const ship of ships) {
			for (const pos of ship.positions) {
				previousMoves.push({
					x: pos.x,
					y: pos.y,
					outcome: 'hit',
				});
			}
		}

		const move = ai.getHighestProbabilityTarget(previousMoves);
		expect(move.x).to.be.eq(-1);
		expect(move.y).to.be.eq(-1);
	});
});
