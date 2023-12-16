import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { Row } from '../components/Solver';
import PipeMazeSim from '../sims/Sim10';

export default function Render() {

  const part1 = (input: string[]): number => {
    const maze = new PipeMaze(input);
    maze.markPipe();
    SetIsPart1(true);
    SetMaze(maze);
    return Math.ceil(maze.pipeLength / 2);
  }

  const part2 = (input: string[]): number => {
    const maze = new PipeMaze(input);
    maze.markPipe();
    maze.markInside();
    SetIsPart1(false);
    SetMaze(maze);
    return maze.tiles.flat().filter(t => t.isInside && !t.isPipe).length;
  }

  const [maze, SetMaze] = useState<PipeMaze | null>(null);
  const [isPart1, SetIsPart1] = useState<boolean>(true);
  
  return (
    <PageLayout pageTitle="Day 10: Pipe Maze Conundrum" >
      <Solver part1={part1} part2={part2} testFile="Test10.txt" />
      <Row label="Working :">
      {
        maze && <PipeMazeSim maze={maze} isPart1={isPart1} />
      }
      </Row>
    </PageLayout>
  );
}

const directions = { "N": 0, "E": 1, "S": 2, "W": 3 } as const; 
type Direction = keyof typeof directions;
const allDirections: Direction[] = ["N", "E", "S", "W"];

export class PipeMaze {

  tiles: Tile[][];
  width: number;
  height: number;
  startTile: Tile = new Tile("S", 0, 0);
  pipeLength: number = 0;

  constructor(str: string[]) {
    
    this.height = str.length;
    this.width = this.height > 0 ? str[0].length : 0; 
    this.tiles = [];

    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        const c = str[y][x];
        const t = new Tile(c, x, y);
        row.push(t);
        if (c === "S") {
          this.startTile = t;
        }
      }
      this.tiles.push(row);
    }

  }

  markPipe() {
    let tile = this.startTile;
    let dir = this.getFirstDirection();
    
    while (true) {
      tile = this.getAdjacentTile(tile.x, tile.y, dir)!;
      tile.isPipe = true;
      if (tile == this.startTile) {
        break;
      }
      dir = tile.getNextDirection(dir);
      this.pipeLength++;
    }
  }

  markInside() {

    for (const row of this.tiles) {
      let toggleNorth = false;
      let toggleSouth = false;
      let isInside = false;
      for (const tile of row) {
        if (tile.isPipe) {
          if (tile.connections.includes("N")) { toggleNorth = !toggleNorth; }
          if (tile.connections.includes("S")) { toggleSouth = !toggleSouth; }
          if (toggleNorth && toggleSouth) {
            isInside = !isInside;
            toggleNorth = false;
            toggleSouth = false;
          }
        }
        tile.isInside = isInside;
      }
    }

    
  }

  getFirstDirection(): Direction {
    const x = this.startTile.x;
    const y = this.startTile.y;
    const directions: Direction[] = [];
    for (const d of allDirections) {
      if (this.getAdjacentTile(x, y, d)?.connections.includes(getOpposite(d))){
        directions.push(d);
        this.startTile.connections.push(d);
      }
    }
    return directions[0];
  }

  getAdjacentTile(x: number, y: number, d: Direction): Tile | null {
    switch (d) {
      case "N": return this.tryGetTile(x, y - 1);
      case "E": return this.tryGetTile(x + 1, y);
      case "S": return this.tryGetTile(x, y + 1);
      case "W": return this.tryGetTile(x - 1, y);
      default: throw new Error();
    }
  }

  tryGetTile(x: number, y: number) : Tile | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    } else {
      return this.tiles[y][x];
    }
  }

}

export class Tile {
  str: string;
  x: number;
  y: number;
  isPipe: boolean = false;
  isInside: boolean = false;
  connections: Direction[];

  constructor(str: string, x: number, y: number) {
    this.str = str;
    this.x = x;
    this.y = y;

    if (this.str == "S") { 
      console.log("S");
    }

    this.connections = this.charToDirections(str);
  }

  getNextDirection(inputDirection: Direction) : Direction {
    const opposite = getOpposite(inputDirection);
    return this.connections.filter(d => d !== opposite)[0];
  }

  charToDirections(str: string) : Direction[] {
    switch(str) {
      case "|": return ["N", "S"];
      case "-": return ["E", "W"];
      case "L": return ["N", "E"];
      case "J": return ["N", "W"];
      case "7": return ["S", "W"];
      case "F": return ["S", "E"];
      case "S": return [];
      default: return [];
    }
  }
}

function getOpposite(d: Direction) : Direction {
  switch(d) {
    case "N": return "S";
    case "E": return "W";
    case "S": return "N";
    case "W": return "E";
  }
}
