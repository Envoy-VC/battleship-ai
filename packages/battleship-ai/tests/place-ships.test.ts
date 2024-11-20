import { BattleShipAI } from '../src';
import { drawBoard } from './utils';

const ai = new BattleShipAI(10, [5, 4, 3, 3, 2]);

const ships = ai.getRandomShipPlacements();

drawBoard(10, 3, 1, [], ships);
