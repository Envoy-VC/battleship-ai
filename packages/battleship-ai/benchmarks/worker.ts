import { parentPort, workerData } from 'node:worker_threads';
import { playGameAI } from '../tests/play-game';

const { start, end } = workerData as {
	start: number;
	end: number;
};

const moves = [];
for (let i = start; i < end; i++) {
	const move = playGameAI();
	moves.push(move);
}

parentPort?.postMessage(moves);
