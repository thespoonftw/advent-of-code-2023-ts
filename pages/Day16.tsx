import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import Sim16 from '../sims/Sim16';

export default function Render() {

  const part1 = (input: string[]): number => {
    const maze = new ReflectionMaze(input);
    const mazeSim = new ReflectionMaze(input);
    mazeSim.initialize(0, Direction.East);
    setSimMaze(mazeSim);
    return maze.simulate(0, Direction.East);
  }

  const part2 = (input: string[]): number => {
    const maze = new ReflectionMaze(input);
    const re = maze.findMostEnergizedTiles();
    const mazeSim = new ReflectionMaze(input);
    mazeSim.initialize(maze.bestIndex!, maze.bestDirection!);
    setSimMaze(mazeSim);
    return re;
  }

  const [simMaze, setSimMaze] = useState<ReflectionMaze | null>(null);
  
  return (
    <PageLayout pageTitle={"Day 16: The Floor Will Be Lava"} >
      <Solver part1={part1} part2={part2} testFile="Test16.txt" />
      <Sim16 maze={simMaze} />
    </PageLayout>
  );
}

export class ReflectionMaze {

  tiles: Tile[][] = [];
  width: number;
  height: number;
  energizedTiles: Tile[] = []

  bestEnergy: number = 0;
  bestIndex: number | null = 0;
  bestDirection: Direction | null = null;

  activeLasers: Laser[] = [];

  constructor(input: string[]) {

    this.height = input.length;
    this.width = input.length > 0 ? input[0].length : 0;

    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      this.tiles.push(row);

      for (let x = 0; x < this.width; x++) {
        const t = new Tile(input[y][x]);
        row.push(t);

      }
    }
  }

  findMostEnergizedTiles() : number {

    for (let i = 0; i < this.height; i++) {
      this.simulateAndRecord(i, Direction.East)
      this.simulateAndRecord(i, Direction.West)
    }

    for (let i = 0; i < this.width; i++) {
      this.simulateAndRecord(i, Direction.North);
      this.simulateAndRecord(i, Direction.South);
    }

    return this.bestEnergy;
  }

  simulateAndRecord(index: number, dir: Direction) {
    this.resetMaze();
    const energy = this.simulate(index, dir);
    if (energy > this.bestEnergy) {
      this.bestEnergy = energy;
      this.bestIndex = index;
      this.bestDirection = dir;
    }
    return energy;
  }

  simulate(index: number, dir: Direction) : number {
    this.initialize(index, dir);
    while (this.simulateStep()) { }
    return this.energizedTiles.length;
  }

  initialize(index: number, dir: Direction) {
    const start = this.getStartingCoord(index, dir);
    const firstLaser = new Laser(start, dir);
    this.activeLasers = [firstLaser];
  }

  simulateStep() : boolean {
    const upcomingLasers = [];
    for (const laser of this.activeLasers) {
      const newDirs = this.getNextDirections(laser);
      const newLasers = newDirs.map(d => new Laser(laser.coord.getNextInDirection(d), d))
      upcomingLasers.push(...newLasers);
    }
    this.activeLasers = upcomingLasers;
    return this.activeLasers.length > 0;
  }

  getNextDirections(laser: Laser) : Direction[] {

    const t = this.getTile(laser.coord);
    if (t === null) { return []; }

    const opposite = getOppositeDirection(laser.dir);
    if (t.energizedDirections.includes(opposite)) { return []; }    
    
    const newDirections = getNextDirection(laser.dir, t.type);

    this.energizedTiles.push(t);
    t.energizedDirections.push(opposite);
    t.energizedDirections.push(...newDirections);

    return newDirections;
  }

  getStartingCoord(index: number, dir: Direction) {
    switch (dir) {
      case Direction.East: return new Coord(0, index);
      case Direction.West: return new Coord(this.width - 1, index);
      case Direction.South: return new Coord(index, 0);
      case Direction.North: return new Coord(index, this.height - 1);
    }
  }

  getTile(coord: Coord) : Tile | null {
    if (coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height) {
      return this.tiles[coord.y][coord.x];
    } else { 
      return null;
    }
  }

  resetMaze() {
    this.energizedTiles = [];
    this.tiles.flat().forEach(t => t.reset());
  }


}

class Tile {

  type: TileType;
  energizedDirections: Direction[] = [];

  constructor(c: string) {
    this.type = this.getTileType(c);
  }

  getTileType(c: string) : TileType {
    switch (c) {
      case ".": return TileType.Empty;
      case "/": return TileType.ForwardMirror;
      case "\\": return TileType.BackMirror;
      case "-": return TileType.HSplit;
      case "|": return TileType.VSplit;
      default: throw Error();
    }
  }

  reset() {
    this.energizedDirections = [];
  }

}

class Laser {

  coord: Coord;
  dir: Direction;

  constructor(coord: Coord, dir: Direction) {
    this.coord = coord;
    this.dir = dir;
  }

}

class Coord {

  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getNextInDirection(dir: Direction): Coord {
    switch (dir) {
      case Direction.North: return new Coord(this.x, this.y - 1);
      case Direction.West:  return new Coord(this.x - 1, this.y);
      case Direction.South: return new Coord(this.x, this.y + 1);
      case Direction.East:  return new Coord(this.x + 1, this.y);
      default: throw new Error();
    }
  }
}

function getNextDirection(dir: Direction, type: TileType) : Direction[] {

  switch (type) {

    case TileType.Empty:
      return [dir];

    case TileType.ForwardMirror:
      switch (dir) {
        case Direction.North: return [Direction.East];
        case Direction.East:  return [Direction.North];
        case Direction.South: return [Direction.West];
        case Direction.West:  return [Direction.South];
      }

    case TileType.BackMirror:
      switch (dir) {
        case Direction.North: return [Direction.West];
        case Direction.East:  return [Direction.South];
        case Direction.South: return [Direction.East];
        case Direction.West:  return [Direction.North];
      }

    case TileType.HSplit:
      switch (dir) {
        case Direction.North: 
        case Direction.South: return [Direction.West, Direction.East];
        case Direction.East: return [Direction.East];
        case Direction.West: return [Direction.West];
      }

    case TileType.VSplit:
      switch (dir) {
        case Direction.East: 
        case Direction.West: return [Direction.North, Direction.South];
        case Direction.North: return [Direction.North];
        case Direction.South: return [Direction.South];
      }
  }
}

function getOppositeDirection(dir: Direction) : Direction {
  switch (dir) {
    case Direction.North: return Direction.South;
    case Direction.East: return Direction.West;
    case Direction.South: return Direction.North;
    case Direction.West: return Direction.East;
  }
}


export enum Direction {
  North = 0,
  West = 1,
  South = 2,
  East = 3
}

export enum TileType {
  Empty = 0,
  BackMirror = 1,
  ForwardMirror = 2,
  HSplit = 3,
  VSplit = 4
}