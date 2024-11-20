# Battleship AI

This repository contains a Battleship AI implementation built in TypeScript. The AI focuses on grid-based probability calculations, strategic ship placement, and targeted attack mechanisms to effectively play the game. This README explains the AI’s logic, approach, and benchmarks.

![Benchmark Results](https://raw.githubusercontent.com/Envoy-VC/battleship-ai/refs/heads/main/benchmark.svg)

![battleship-ai](https://github.com/user-attachments/assets/d9a58418-9eac-4565-a632-22b233e415fd)



## Table of Contents

1. [Battleship AI](#battleship-ai)
   1. [Table of Contents](#table-of-contents)
   2. [Overview](#overview)
   3. [Usage](#usage)
   4. [Steps Involved in the AI's Functionality](#steps-involved-in-the-ais-functionality)
      1. [1. **Initialization**](#1-initialization)
      2. [2. **Probabilistic Targeting**](#2-probabilistic-targeting)
      3. [3. **Ship Placement Validation**](#3-ship-placement-validation)
      4. [4. **Dynamic Probability Updates**](#4-dynamic-probability-updates)
      5. [5. **Target Selection**](#5-target-selection)
      6. [6. **Random Ship Placement**](#6-random-ship-placement)
      7. [7. **Outcome Calculation**](#7-outcome-calculation)
   5. [Benchmarks](#benchmarks)

## Overview

The Battleship AI operates in a grid-based environment, using probability-based targeting and strategic ship placement to maximize efficiency. The core components include:

- Grid Representation: Maintains the state of the board, including hits, misses, and empty cells.
- Ship Placement: Dynamically determines valid positions for ships of varying sizes.
- Attack Strategy: Uses probability calculations to determine the most likely coordinates for successful hits.
- Probability Heatmap: Continuously updates based on previous attack outcomes to guide targeting decisions.

---

## Usage

To run the Battleship AI, follow these steps:

Install the dependencies:

```bash
npm install battleship-ai
# or
yarn add battleship-ai
# or
pnpm add battleship-ai
```

Create a new instance of the AI:

```typescript
import { BattleShipAI } from 'battleship-ai';

const boardSize = 10;
const ships = [5, 4, 3, 3, 2];

const ai = new BattleShipAI(boardSize, ships); // 10x10 grid with ship sizes
```

Generate Random Ships

```ts
const ships = ai.getRandomShipPlacements();

// { size: number , positions: { x: number, y: number }[] }
```

Predict the next move

```ts
const previousMoves: {
	x: number;
	y: number;
	outcome: 'hit' | 'miss';
}[] = [];

const { x, y } = ai.getHighestProbabilityTarget(previousMoves);
```

Get The Latest Heatmap

```ts
const heatmap = ai.getHeatmap(); // number[][] 10*10
```

---

## Steps Involved in the AI's Functionality

### 1. **Initialization**

The AI initializes a virtual grid and a probability grid, representing the game board. These grids track the state of each cell and the likelihood of each cell containing an enemy ship, respectively. Additionally, the AI takes a list of ship sizes as input to define the game's ship configurations.

1. **Virtual Grid:** Tracks the state of each cell, categorized as empty, missed, or hit. This grid is updated dynamically during the game.
2. **Probability Grid:** Assigns probabilities to cells based on potential ship placements and historical attack outcomes. The grid is initialized with zeros.

### 2. **Probabilistic Targeting**

The AI evaluates each cell in the probability grid based on several factors:

- **Initial Opening Patterns:** The AI assigns weights to specific cells on the grid as opening targets. These weights are predefined and randomized within specified ranges for variability in targeting strategies.
- **Adjacent Tiles:** When a cell is hit, adjacent tiles are prioritized to locate the continuation of a ship. Probabilities are increased significantly for empty cells neighboring a hit cell.
- **Empty Cell Evaluation:** The AI assesses whether each empty cell can accommodate any ship. Probabilities for such cells are incremented based on their feasibility for ship placement and proximity to hit cells.

### 3. **Ship Placement Validation**

The AI determines valid positions for placing ships during the game's setup phase. It validates positions by ensuring that:

- The ship does not exceed the grid boundaries.
- The ship does not overlap with cells marked as occupied or invalid.

For each potential ship placement:

1. The AI checks all cells along the ship's length in the given orientation (horizontal or vertical).
2. If the placement is valid, it stores the coordinates for the ship.

### 4. **Dynamic Probability Updates**

As the game progresses, the AI dynamically updates the probability grid based on historical attack outcomes:

- **Hit Outcomes:** Increase the probability of adjacent cells to prioritize continuation of the ship.
- **Miss Outcomes:** Mark the cell's probability as zero to prevent redundant targeting.
- **Ship Alignment Evaluation:** For each ship size, the AI calculates the likelihood of a cell being part of a valid placement, factoring in hits and empty cells.

### 5. **Target Selection**

The AI selects the next cell to attack by identifying the cell with the highest probability in the probability grid. If multiple cells share the highest probability, one is chosen at random to add variability to the decision-making process.

### 6. **Random Ship Placement**

For placing its own ships on the board, the AI uses a random yet validated approach:

- It generates a list of valid positions for each ship based on its size and orientation.
- It randomly selects one position from the list of valid placements.
- The ship is placed at the selected position, and the corresponding cells are marked as occupied.

### 7. **Outcome Calculation**

When the AI's chosen target is attacked, it checks the coordinates against the known ship positions:

- If the coordinates match any ship position, the outcome is recorded as a hit.
- Otherwise, the outcome is recorded as a miss.

---

## Benchmarks

- **Average Moves to Complete a Game**: 54.2

  ![Benchmark Results](https://raw.githubusercontent.com/Envoy-VC/battleship-ai/refs/heads/main/benchmark.svg)

These benchmarks can be tested by running simulations against another instance of Battleship AI with random ship placements, and running for `1000000` Games.
