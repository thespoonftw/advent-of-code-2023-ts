import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import Sim16 from '../sims/Sim16';

export default function Render() {

  const part1 = (input: string[]): number => {
    const maze = new ReflectionMaze(input);
    setSimMaze(maze);
    return maze.simulateLaser(0, Direction.East);
  }

  const part2 = (input: string[]): number => {
    const maze = new ReflectionMaze(input);
    const bestMaze = new ReflectionMaze(input);
    const re = maze.findMostEnergizedTiles();
    bestMaze.simulateLaser(maze.bestIndex!, maze.bestDirection!);
    setSimMaze(bestMaze);
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
      this.simulateLaser(i, Direction.East)
      this.simulateLaser(i, Direction.West)
    }

    for (let i = 0; i < this.width; i++) {
      this.simulateLaser(i, Direction.North);
      this.simulateLaser(i, Direction.South);
    }

    return this.bestEnergy;
  }

  simulateLaser(index: number, dir: Direction): number {
    this.resetMaze();
    const start = this.getStartingCoord(index, dir);
    this.drawLaserRecursive(start, dir);
    const energy = this.energizedTiles.length;
    if (energy > this.bestEnergy) {
      this.bestEnergy = energy;
      this.bestIndex = index;
      this.bestDirection = dir;
    }
    return energy;
  }

  getStartingCoord(index: number, dir: Direction) {
    switch (dir) {
      case Direction.East: return new Coord(-1, index);
      case Direction.West: return new Coord(this.width, index);
      case Direction.South: return new Coord(index, -1);
      case Direction.North: return new Coord(index, this.height);
    }
  }

  resetMaze() {
    this.energizedTiles = [];
    this.tiles.flat().forEach(t => t.reset());
  }

  drawLaserRecursive(prev: Coord, dir: Direction) {

    const coord = prev.getNextInDirection(dir);
    const t = this.getTile(coord);
    if (t === null) { return; }

    const opposite = getOppositeDirection(dir);
    if (t.energizedDirections.includes(opposite)) { return; }    
    
    const newDirections = getNextDirection(dir, t.type);

    this.energizedTiles.push(t);
    t.energizedDirections.push(opposite);
    t.energizedDirections.push(...newDirections);

    for (const newDir of newDirections) {
      this.drawLaserRecursive(coord, newDir);
    }
  }

  getTile(coord: Coord) : Tile | null {
    if (coord.x >= 0 && coord.y >= 0 && coord.x < this.width && coord.y < this.height) {
      return this.tiles[coord.y][coord.x];
    } else { 
      return null;
    }
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