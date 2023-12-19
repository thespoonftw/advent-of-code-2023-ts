import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';
import Sim18 from '../sims/Sim18';

export default function Render() {

  const part1 = (input: string[]): number => {
    const digsite = new DigSite(input, false);
    setSimDig(digsite);
    console.log(digsite);
    return digsite.countInterior();
  }

  const part2 = (input: string[]): number => {
    const digsite = new DigSite(input, true);
    setSimDig(digsite);
    console.log(digsite);
    return digsite.countInterior();
  }

  const [simDig, setSimDig] = useState<DigSite | null>(null);

  return (
    <PageLayout pageTitle={"Day 18: Lavaduct Lagoon"} >
      <Solver part1={part1} part2={part2} testFile="Test18.txt" />
      <Sim18 digSite={simDig} />
    </PageLayout>
  );
}

export class Digsite2 {


}



export class DigSite {

  cells: Cell[][];
  vertices: Vertex[];
  width: number;
  height: number;
  xMin: number = Number.POSITIVE_INFINITY;
  xMax: number = Number.NEGATIVE_INFINITY;
  yMin: number = Number.POSITIVE_INFINITY;
  yMax: number = Number.NEGATIVE_INFINITY;
  xValues: number[] = [];
  yValues: number[] = [];
  isPart2: boolean;

  constructor(input: string[], isPart2: boolean) {

    this.isPart2 = isPart2;
    this.vertices = input.map(l => new Vertex(l));

    let x = 0;
    let y = 0;
    for (const vertex of this.vertices) {
      const x1 = x;
      const y1 = y; 
      const dir = isPart2 ? vertex.hexDir : vertex.dir;
      const dist = isPart2 ? vertex.hexDistance : vertex.distance;
      x = getXInDirection(x, dir, dist);
      y = getYInDirection(y, dir, dist);
      const x2 = x;
      const y2 = y;
      vertex.setEnds(x1, x2, y1, y2);

      if (vertex.xMin < this.xMin) { this.xMin = vertex.xMin; }
      if (vertex.xMax > this.xMax) { this.xMax = vertex.xMax; }
      if (vertex.yMin < this.yMin) { this.yMin = vertex.yMin; }
      if (vertex.yMax > this.yMax) { this.yMax = vertex.yMax; }
    }

    if (isPart2) {
      this.xValues = [...new Set([...this.vertices.flatMap(v => [v.xMin, v.xMax])])].sort((a, b) => a - b);
      this.yValues = [...new Set([...this.vertices.flatMap(v => [v.yMin, v.yMax])])].sort((a, b) => a - b);
      this.width = this.xValues.length * 2 - 1;
      this.height = this.yValues.length * 2 - 1;

      for (const v of this.vertices) {
        let xStart = this.xValues.indexOf(v.xMin) * 2;
        let xEnd = this.xValues.indexOf(v.xMax) * 2;
        let yStart = this.yValues.indexOf(v.yMin) * 2;        
        let yEnd = this.yValues.indexOf(v.yMax) * 2;
        let length = v.isVertical ? yEnd - yStart : xEnd - xStart;
        v.setDrawing(xStart, yStart, length);
      }
      
    } else {
      this.width = this.xMax - this.xMin + 1;
      this.height = this.yMax - this.yMin + 1;
      this.vertices.forEach(v => v.setDrawing(v.xMin - this.xMin, v.yMin - this.yMin, v.distance));
    }

    this.cells = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => new Cell()));

    for (const vertex of this.vertices) {
      for (let i = 0; i <= vertex.length; i++) {
        let x = (vertex.isVertical ? vertex.xStart : vertex.xStart + i);
        let y = (vertex.isVertical ? vertex.yStart + i : vertex.yStart);
        this.cells[y][x].isWall = true;
      }
    }

    for (let y = 0; y < this.height; y++) {
      let isInside = false;
      let toggleNorth = false;
      let toggleSouth = false;
      
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y][x];
        
        if (cell.isWall) {
          const upCell = this.tryGetCell(x, y+1);
          const downCell = this.tryGetCell(x, y-1);
          if (upCell && upCell.isWall) { toggleNorth = !toggleNorth; }
          if (downCell && downCell.isWall) { toggleSouth = !toggleSouth; }
          if (toggleNorth && toggleSouth) {
            isInside = !isInside;
            toggleNorth = false;
            toggleSouth = false;
          }
        }

        if (isInside) { cell.isInside = true; }
      }
    }
  }

  countInterior() : number {
    let re = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.cells[y][x];
        if (cell.isInside || cell.isWall) { 
          re += this.getCellWidth(x) * this.getCellHeight(y); 
        }
      }
    }
    return re;
  }

  tryGetCell(x: number, y: number) : Cell | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) { return null; }
    return this.cells[y][x]
  }

  getCellWidth(x: number) : number {
    if (!this.isPart2 || x % 2 === 0) { return 1; }
    const half = (x - 1) / 2;
    return this.xValues[half + 1] - this.xValues[half] - 1;
  }

  getCellHeight(y: number) : number {
    if (!this.isPart2 || y % 2 === 0) { return 1; }
    const half = (y - 1) / 2;
    return this.yValues[half + 1] - this.yValues[half] - 1;
  }
  
}

class Cell {

  isWall: boolean = false;
  isInside: boolean = false;
  colour: string | null = null;
}

class Vertex {

  dir: Direction;
  distance: number;
  colour: string;

  hexDir: Direction;
  hexDistance: number;

  xMin: number = 0;
  xMax: number = 0;
  yMin: number = 0;
  yMax: number = 0;
  isVertical: boolean = false;

  xStart: number = 0;
  yStart: number = 0;
  length: number = 0;

  constructor(line: string) {
    const split = line.split(" ");
    this.dir = charToDir(split[0]);
    this.distance = parseInt(split[1]);
    this.colour = split[2].slice(1, 8);
    this.hexDir = charToDir(this.colour[6]);
    this.hexDistance = parseInt(this.colour.slice(1, 6), 16);
  }

  setEnds(x1: number, x2: number, y1: number, y2: number) {
    this.xMin = Math.min(x1, x2);
    this.xMax = Math.max(x1, x2);
    this.yMin = Math.min(y1, y2);
    this.yMax = Math.max(y1, y2);
    this.isVertical = x1 === x2;
  }

  setDrawing(x: number, y: number, l: number) {
    this.xStart = x;
    this.yStart = y;
    this.length = l;
  }

}

function charToDir(c: string) : Direction {
  switch (c) {
    case "R": case "0": return Direction.East;
    case "D": case "1": return Direction.South;
    case "L": case "2": return Direction.West; 
    case "U": case "3": return Direction.North;
    default: throw new Error("unknown direction character " + c);
  }
}

export enum Direction {
  East = 0,
  South = 1,
  West = 2,
  North = 3,
}

const allDirections = [ Direction.East, Direction.South, Direction.West, Direction.North ]

function getOppositeDirection(dir: Direction) : Direction {
  switch (dir) {
    case Direction.North: return Direction.South;
    case Direction.East: return Direction.West;
    case Direction.West: return Direction.East;
    case Direction.South: return Direction.North;
  }
}

function getXInDirection(x: number, dir: Direction, distance: number) : number {
  switch (dir) {
    case Direction.East: return x + distance;
    case Direction.West: return x - distance;
    default: return x;
  }
}

function getYInDirection(y: number, dir: Direction, distance: number) : number {
  switch (dir) {
    case Direction.North: return y - distance;
    case Direction.South: return y + distance;
    default: return y;
  }
}