import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';
import Sim21 from '../sims/Sim21';

export default function Render() {

  const part1 = (input: string[]): number => {
    
    setGarden(new Garden(input, 1));

    const garden = new Garden(input, 1);
    garden.takeSteps(64);
    return garden.countOccupied();
  }

  const part2 = (input: string[]): number => {

    const totalSteps = part2Steps;
    const gardenSize = input.length;
    const i = Math.floor(totalSteps / gardenSize);
    const remainder = totalSteps - (i * gardenSize);
    const stepsToSimulate = Math.min(part2Steps, (2 * gardenSize) + remainder);

    const garden = new Garden(input, 7);
    garden.takeSteps(stepsToSimulate);

    let sum = 0;

    const phase1Count = i * i;
    const phase2Count = (i - 1) * (i - 1);
    const evenDiamond = i % 2 === 0;

    // in-phase count
    const c = evenDiamond ? phase2Count : phase1Count;
    sum += garden.countOccupiedAt(3, 3) * c;

    // out-phase count
    const p = evenDiamond ? phase1Count : phase2Count;
    sum += garden.countOccupiedAt(3, 2) * p;

    // unique diamond corners
    sum += garden.countOccupiedAt(3, 0);
    sum += garden.countOccupiedAt(3, 1);
    sum += garden.countOccupiedAt(3, 5);
    sum += garden.countOccupiedAt(3, 6);
    sum += garden.countOccupiedAt(0, 3);
    sum += garden.countOccupiedAt(1, 3);
    sum += garden.countOccupiedAt(5, 3);
    sum += garden.countOccupiedAt(6, 3);

    // outer diamond edges
    sum += garden.countOccupiedAt(2, 1) * i; // top left
    sum += garden.countOccupiedAt(4, 1) * i; // top right
    sum += garden.countOccupiedAt(2, 5) * i; // bottom left
    sum += garden.countOccupiedAt(4, 5) * i; // bottom right

    // inner diamond edges
    sum += garden.countOccupiedAt(2, 2) * (i - 1); // top left
    sum += garden.countOccupiedAt(4, 2) * (i - 1); // top right
    sum += garden.countOccupiedAt(2, 4) * (i - 1); // bottom left
    sum += garden.countOccupiedAt(4, 4) * (i - 1); // bottom right  

    setGarden(garden);
    return sum;
  }

  const [garden, setGarden] = useState<Garden | null>(null);
  const [part2Steps, setPart2Steps] = useState<number>(50);

  return (
    <PageLayout pageTitle={"Day 21: Step Counter"} >
      <InputRow label="Params:">
        <NumberInput label="Part 2 Steps" set={setPart2Steps} value={part2Steps} />
      </InputRow>
      <Solver part1={part1} part2={part2} testFile="Test21.txt" />
      <Sim21 garden={garden} />
    </PageLayout>
  );
}

export class Garden {

  cells: Cell[][] = [];
  startX: number = NaN;
  startY: number = NaN;
  size: number;
  startCell: Cell = null!;
  updatedCells: Cell[] = [];
  stepNumber: number = 0;
  multiplier: number;
  baseSize: number;

  constructor(input: string[], multiplier: number) {

    this.baseSize = input.length;
    this.size = input.length * multiplier;
    this.multiplier = multiplier;

    for (let y = 0; y < this.size; y++) {
      const yIndex = y % this.baseSize;
      const row = input[yIndex];
      const cellRow: Cell[] = [];
      this.cells.push(cellRow);
      for (let x = 0; x < this.size; x++) {
        const xIndex = x % this.baseSize;
        cellRow.push(new Cell(row[xIndex], x, y));
      }
    }

    const mid = (this.size - 1) / 2;
    this.startCell = this.cells[mid][mid];
    this.startCell.state = OccupiedState.Even;
    this.updatedCells = [this.startCell];
  }
  
  takeSteps(n: number) {
    for (let i = 0; i < n; i++){
      this.takeStep();
    }
  }

  takeStep() {

    this.stepNumber++;
    const isEven = this.stepNumber % 2 === 0;

    let newUpdated = [];

    for (const cell of this.updatedCells) {
      const neighbours = this.getCellNeighbours(cell);
      const updatedNeighbours = neighbours.filter(c => c.tryUpdate(isEven));
      newUpdated.push(...updatedNeighbours);
    }

    this.updatedCells = newUpdated;
  }

  getCellNeighbours(cell: Cell) : Cell[] {
    const re = [];
    if (cell.x > 0) { re.push(this.cells[cell.y][cell.x - 1]); }
    if (cell.y > 0) { re.push(this.cells[cell.y - 1][cell.x]); }
    if (cell.x < this.size - 1) { re.push(this.cells[cell.y][cell.x + 1]); }
    if (cell.y < this.size - 1) { re.push(this.cells[cell.y + 1][cell.x]); }
    return re;
  }

  countOccupied() : number {
    const isEven = this.stepNumber % 2 === 0;
    return this.cells.flat().filter(c => c.isOccupied(isEven)).length;
  }

  countOccupiedAt(xIndex: number, yIndex: number) : number {
    const xStart = xIndex * this.baseSize;
    const xEnd = (xIndex + 1) * this.baseSize;
    const yStart = yIndex * this.baseSize;
    const yEnd = (yIndex + 1) * this.baseSize;
    const isEven = this.stepNumber % 2 === 0;
    const subArray = this.cells.slice(yStart, yEnd).map(row => row.slice(xStart, xEnd));
    return subArray.flat().filter(c => c.isOccupied(isEven)).length;
  }

  reset() {
    this.stepNumber = 0;
    this.updatedCells = [this.startCell];
    this.cells.flat().forEach(c => c.reset());
    this.startCell.state = OccupiedState.Even;
  }

}

export class Cell {

  state: OccupiedState;
  x: number;
  y: number;

  constructor(char: string, x: number, y: number) {
    if (char === "#") {
      this.state = OccupiedState.Rock;
    } else {
      this.state = OccupiedState.Never;
    }
    this.x = x;
    this.y = y;
  }

  tryUpdate(isEven: boolean) : boolean {

    if (this.state !== OccupiedState.Never) { return false; }
    this.state = isEven ? OccupiedState.Even : OccupiedState.Odd;
    return true;
  }

  isOccupied(isEven: boolean) : boolean {
    return (this.state === OccupiedState.Even && isEven) || (this.state === OccupiedState.Odd && !isEven);
  }

  reset() {
    if (this.state === OccupiedState.Rock) { return; }
    this.state = OccupiedState.Never;
  }
}

export enum OccupiedState {
  Never = 0,
  Odd = 1,
  Even = 2,
  Rock = 3,
}