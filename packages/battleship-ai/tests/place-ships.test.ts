import { beforeAll, describe, expect, it } from "vitest";
import { BattleShipAI } from "../src";

describe("Place Ships", () => {
	let ai: BattleShipAI;

	beforeAll(() => {
		ai = new BattleShipAI(10, [5, 4, 3, 3, 2]);
	});

	it("should randomly place ships", () => {
		const ships = ai.getRandomShipPlacements();
		expect(ships.length).toBe(5);
		expect(ships.some((ship) => ship.positions.length === 5)).toBeTruthy();
		expect(ships.some((ship) => ship.positions.length === 4)).toBeTruthy();
		expect(ships.some((ship) => ship.positions.length === 3)).toBeTruthy();
		expect(ships.some((ship) => ship.positions.length === 3)).toBeTruthy();
		expect(ships.some((ship) => ship.positions.length === 2)).toBeTruthy();
	});
});
