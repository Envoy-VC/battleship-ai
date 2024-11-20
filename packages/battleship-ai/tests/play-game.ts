import inquirer from 'inquirer';
import { BattleShipAI } from '../src';
import type { AttackOutcome } from '../src/types';
import { drawBoard, drawHeatMap } from './utils';

export const playGame = async (): Promise<void> => {
	const playerMoves: AttackOutcome[] = [];
	const aiMoves: AttackOutcome[] = [];

	const ships = [5, 4, 3, 3, 2];
	const ai = new BattleShipAI(10, ships);

	const totalHitLocations = ships.reduce((acc, ship) => acc + ship, 0);

	const playerShips = ai.getRandomShipPlacements();
	const aiShips = ai.getRandomShipPlacements();

	let totalAiHits = 0;
	let totalPlayerHits = 0;
	let isGameOver = false;

	const aiPlayMove = (): boolean => {
		const nextAttack = ai.getHighestProbabilityTarget(aiMoves);
		const aiOutcome = ai.calculateOutcome(
			nextAttack.x,
			nextAttack.y,
			playerShips
		);

		console.log(
			`\n\nAI Attacked at ${String(nextAttack.x)}, ${String(
				nextAttack.y
			)}. Outcome: ${aiOutcome}\n`
		);

		aiMoves.push({ x: nextAttack.x, y: nextAttack.y, outcome: aiOutcome });

		if (aiOutcome === 'hit') {
			totalAiHits++;
		}

		return totalHitLocations === totalAiHits;
	};

	while (!isGameOver) {
		// First Player Plays Move
		console.log('Player Board\n');
		drawBoard(10, 3, 1, aiMoves, playerShips);
		console.log('\n\nOpponent Board\n');
		drawBoard(10, 3, 1, playerMoves, aiShips);
		console.log('\nHeat Map\n');
		drawHeatMap(10, 3, 1, ai.getHeatmap());

		const pms: string[] = [];
		playerMoves.forEach((m) => {
			pms.push(`${String(m.x)}-${String(m.y)}`);
		});

		const res: { x: number; y: number } = await inquirer.prompt([
			{ type: 'number', name: 'x', message: 'X Coordinate' },
			{ type: 'number', name: 'y', message: 'Y Coordinate' },
		]);

		const { x, y } = res;

		const attackOutcome = ai.calculateOutcome(x, y, aiShips);
		if (attackOutcome === 'hit') {
			totalPlayerHits++;
		}

		if (totalHitLocations === totalPlayerHits) {
			isGameOver = true;
			continue;
		}
		console.log(
			`Player Attacked at ${String(x)}, ${String(
				y
			)}. Outcome: ${attackOutcome}\n\n`
		);
		playerMoves.push({
			x,
			y,
			outcome: attackOutcome,
		});

		// AI plays Move
		console.clear();
		const aiWon = aiPlayMove();
		if (aiWon) {
			isGameOver = true;
		}
	}

	console.clear();

	console.log('Game Over\n');
	console.log('Player Board\n');
	drawBoard(10, 3, 1, aiMoves, playerShips);
	console.log('\n\nOpponent Board\n');
	drawBoard(10, 3, 1, playerMoves, aiShips);

	const heatmap = ai.getHeatmap();

	console.log('Heat Map Board\n');
	drawHeatMap(10, 3, 1, heatmap);

	console.log('Total Player Moves: ', playerMoves.length);
	console.log('Total AI Moves: ', aiMoves.length);

	if (totalPlayerHits === totalHitLocations) {
		console.log('Player Wins');
	}

	if (totalAiHits === totalHitLocations) {
		console.log('AI Wins');
	}
};

export const playGameAI = (): number => {
	const playerMoves: AttackOutcome[] = [];
	const aiMoves: AttackOutcome[] = [];

	const ships = [5, 4, 3, 3, 2];
	const ai = new BattleShipAI(10, ships);

	const totalHitLocations = ships.reduce((acc, ship) => acc + ship, 0);

	const playerShips = ai.getRandomShipPlacements();
	const aiShips = ai.getRandomShipPlacements();

	let totalAiHits = 0;
	let totalPlayerHits = 0;
	let isGameOver = false;

	const aiPlayMove = (): boolean => {
		const nextAttack = ai.getHighestProbabilityTarget(aiMoves);
		const aiOutcome = ai.calculateOutcome(
			nextAttack.x,
			nextAttack.y,
			playerShips
		);

		aiMoves.push({ x: nextAttack.x, y: nextAttack.y, outcome: aiOutcome });

		if (aiOutcome === 'hit') {
			totalAiHits++;
		}

		return totalHitLocations === totalAiHits;
	};

	while (!isGameOver) {
		const pms: string[] = [];
		playerMoves.forEach((m) => {
			pms.push(`${String(m.x)}-${String(m.y)}`);
		});

		const res: { x: number; y: number } =
			ai.getHighestProbabilityTarget(playerMoves);

		const { x, y } = res;

		const attackOutcome = ai.calculateOutcome(x, y, aiShips);
		if (attackOutcome === 'hit') {
			totalPlayerHits++;
		}

		if (totalHitLocations === totalPlayerHits) {
			isGameOver = true;
			continue;
		}

		playerMoves.push({
			x,
			y,
			outcome: attackOutcome,
		});

		// AI plays Move
		const aiWon = aiPlayMove();
		if (aiWon) {
			isGameOver = true;
		}
	}

	return Math.max(playerMoves.length, aiMoves.length);
};
