import { Worker } from 'node:worker_threads';
import { writeFileSync } from 'node:fs';

// Function to create and start a worker thread
const startWorker = (start: number, end: number): Promise<number[]> => {
	return new Promise((resolve, reject) => {
		const worker = new Worker('./worker.ts', {
			workerData: { start, end },
		});

		worker.on('message', (data: number[]) => {
			resolve(data);
		});

		worker.on('error', reject);
		worker.on('exit', (code) => {
			if (code !== 0)
				reject(new Error(`Worker stopped with exit code ${String(code)}`));
		});
	});
};

const run = async (): Promise<void> => {
	const numberOfWorkers = 100; // Adjust based on the number of cores you want to use
	const totalIterations = 1e6; // Total number of iterations
	const moves: number[] = [];
	const batchSize = totalIterations / numberOfWorkers;

	// Run all workers in parallel
	const promises: Promise<number[]>[] = [];
	for (let i = 0; i < numberOfWorkers; i++) {
		const start = i * batchSize;
		const end = (i + 1) * batchSize;
		promises.push(startWorker(start, end));
	}

	// Wait for all workers to finish and aggregate results
	const workerResults = await Promise.all(promises);
	workerResults.forEach((result) => moves.push(...result));

	// Calculate the average of all moves
	const totalMoves = moves.reduce((acc, move) => acc + move, 0);
	const averageMoves = totalMoves / moves.length;

	// Output the results to a JSON file
	const output = {
		averageMoves,
		totalIterations,
		moves,
	};

	writeFileSync('results.json', JSON.stringify(output, null, 2));
};

await run();
