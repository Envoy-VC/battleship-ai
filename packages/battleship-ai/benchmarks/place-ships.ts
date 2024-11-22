import { add, complete, cycle, save, suite } from 'benny';
import { BattleShipAI } from '../src';

export default suite(
	'Random Ship Placements',

	add('Fixed Board Length, Fixed Ships', () => {
		const ai = new BattleShipAI(10, [5, 4, 3, 3, 2]);
		ai.getRandomShipPlacements();
	}),

	add('Variable Board Length, Fixed No of Ships', () => {
		const length = Math.floor(Math.random() * 25) + 6;
		const ai = new BattleShipAI(length, [5, 4, 3, 3, 2]);
		ai.getRandomShipPlacements();
	}),

	add('Fixed Board, Variable Number of Ships', () => {
		const noOfShips = Math.floor(Math.random() * 5) + 1;
		const ships = Array.from({ length: noOfShips }, () => {
			return Math.floor(Math.random() * 3) + 2;
		});
		const ai = new BattleShipAI(10, ships);
		ai.getRandomShipPlacements();
	}),

	add('Variable Board Length, Variable Number of Ships', () => {
		const noOfShips = Math.floor(Math.random() * 20) + 1; // 1 - 20

		const ships = Array.from({ length: noOfShips }, () => {
			return Math.floor(Math.random() * 10) + 1; // 1 - 10
		});

		const minTiles = ships.sort((a, b) => b - a)[0];
		const boardSize = Math.floor(Math.random() * 10) + minTiles * 2; // 2 - 30

		const ai = new BattleShipAI(boardSize, ships);
		ai.getRandomShipPlacements();
	}),

	cycle(),
	complete(),
	save({ file: 'place-ships', folder: './output', details: true }),
	save({
		file: 'place-ships',
		folder: './output',
		format: 'chart.html',
		details: true,
	})
);
