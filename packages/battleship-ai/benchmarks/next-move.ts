import { add, complete, cycle, save, suite } from 'benny';
import { AttackOutcome, BattleShipAI } from '../src';

const nextMoveWrapper = (moves: 'low' | 'high') => {
	const ai = new BattleShipAI(10, [5, 4, 3, 3, 2]);
	const noOfMoves = Math.floor(Math.random() * 10) + (moves === 'low' ? 5 : 20);
	const ships = ai.getRandomShipPlacements();

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
	ai.getHighestProbabilityTarget(previousMoves);
};

export default suite(
	'Next Attack Location',

	add('Classic, Low Previous Moves', () => {
		nextMoveWrapper('low');
	}),

	add('Classic, High Previous Moves', () => {
		nextMoveWrapper('high');
	}),

	cycle(),
	complete(),
	save({ file: 'next-target', folder: './output', details: true }),
	save({
		file: 'next-target',
		folder: './output',
		format: 'chart.html',
		details: true,
	})
);
