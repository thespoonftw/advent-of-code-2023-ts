import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, PagedWorkingBox, Row } from '../components/Solver';
import ReflectorDishSim from '../sims/Sim14';

export default function Render() {

  const part1 = (input: string[]): number => {
    setSimPlatform(new Platform(input));
    const platform = new Platform(input);
    platform.slide(Direction.North);    
    return platform.findLoad();
  }

  const part2 = (input: string[]): number => {
    setSimPlatform(new Platform(input));
    const platform = new Platform(input);
    return platform.findLoadAfterCycles(300);
  }

  const [simPlatform, setSimPlatform] = useState<Platform | null>(null);

  return (
    <PageLayout pageTitle="Parabolic Reflector Dish" >
      <Solver part1={part1} part2={part2} testFile="Test14.txt" />
      <ReflectorDishSim platform={simPlatform} />
    </PageLayout>
  );

}

export enum Direction {
  North = 0,
  West = 1,
  South = 2,
  East = 3
}

export enum TileState {
  Empty = 0,
  Round = 1,
  Square = 2
}

export class Platform {

  tiles: Tile[][] = [];
  width: number;
  height: number;

  constructor(input: string[]) {
    this.height = input.length;
    this.width = input.length > 0 ? input[0].length : 0;

    for (const row of input) {
      const tileRow: Tile[] = [];
      this.tiles.push(tileRow);
      for (const char of row) {
        tileRow.push(new Tile(char));
      }
    }
  }

  slide(dir: Direction) {
    const isVertical = dir === Direction.North || dir === Direction.South;
    let iMax = isVertical ? this.height : this.width;
    let jMax = isVertical ? this.width : this.height;

    for (let i = 1; i < iMax; i++) {
      for (let j = 0; j < jMax; j++) {

        const t1 = this.getTile(j, i, dir);

        if (t1.state !== TileState.Round) { continue; }

        let k = i;

        while (k > 0 && this.getTile(j, k - 1, dir).state === TileState.Empty) {
          k--;
        }

        const t2 = this.getTile(j, k, dir);
        t1.state = TileState.Empty;
        t2.state = TileState.Round;
      }
    }
  }

  slideStep(dir: Direction) : boolean {
    const isVertical = dir === Direction.North || dir === Direction.South;
    let iMax = isVertical ? this.height : this.width;
    let jMax = isVertical ? this.width : this.height;
    let re = false;

    for (let i = 1; i < iMax; i++) {
      for (let j = 0; j < jMax; j++) {

        const t1 = this.getTile(j, i, dir);
        if (t1.state !== TileState.Round) { continue; }
        const t2 = this.getTile(j, i - 1, dir);
        if (t2.state !== TileState.Empty) { continue; }
        t1.state = TileState.Empty;
        t2.state = TileState.Round;
        re = true;
      }
    }

    return re;
  }

  getTile(i: number, j: number, dir: Direction) : Tile {
    switch(dir) {
      case Direction.North: { return this.tiles[j][i]; }
      case Direction.East: {  return this.tiles[i][this.width - j - 1]; }
      case Direction.South: { return this.tiles[this.height - j - 1][i]; }
      case Direction.West: {  return this.tiles[i][j]; }
      default: throw Error();
    }
  }

  findLoad() : number {
    let re = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x].state === TileState.Round) {
          re += this.height - y;
        }
      }
    }
    return re;
  }

  findLoadAfterCycles(cycleCount: number) : number {

    const loads = [];

    for (let i = 0; i < 500; i++) {
      this.slide(Direction.North);
      this.slide(Direction.West);
      this.slide(Direction.South);
      this.slide(Direction.East);
      loads.push(this.findLoad());
    }

    console.log(loads);

    const findIndex = 300;
    const directionsLength = 4;
    //const findIndex = cycleCount / directionsLength;

    //const offset = 2;
    //const cycleLength = 7;

    const offset = 100;
    const cycleLength = 38;
    
    // 93102

    const index = ((findIndex - offset) % cycleLength) + offset;

    console.log(index);

    return loads[index];
  }

}

export class Tile {

  state: TileState;

  constructor(c: string) {
    this.state = c === "#" ? TileState.Square : c === "O" ? TileState.Round : TileState.Empty;
  }

}