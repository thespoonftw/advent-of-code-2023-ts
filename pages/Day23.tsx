import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';
import Viz23 from '../sims/Viz23';

export default function Render() {

  const part1 = (input: string[]): number => {
    const trail = new HikingTrail(input);
    const l = trail.findLongestPath();
    trail.markLongestPart();
    setVizTrail(trail);
    console.log(trail);
    return l;
  }

  const part2 = (input: string[]): number => {
    return 0;
  }

  const [vizTrail, setVizTrail] = useState<HikingTrail | null>(null);

  return (
    <PageLayout pageTitle={"Day 23: A Long Walk"} >
      <Solver part1={part1} part2={part2} testFile="Test23.txt" />
      <Viz23 trail={vizTrail} />
    </PageLayout>
  );
}

export class HikingTrail {

  tiles: Tile[][];
  width: number;
  height: number;
  paths: Map<Tile, Path> = new Map<Tile, Path>();
  junctions: Map<Tile, Junction> = new Map<Tile, Junction>();
  startPath: Path;
  endPath: Path = null!;
  endJunction: Junction = null!;
  
  constructor(input: string[]) {

    this.height = input.length;
    this.width = input[0].length;

    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      const row : Tile[] = [];
      this.tiles.push(row);

      for (let x = 0; x < this.width; x++) {
        const c = input[y][x];
        const tile = new Tile(c, x, y);
        row.push(tile);
      }
    }

    const x = this.tiles[0].filter(t => t.type === TileType.Empty)[0].x;
    this.startPath = this.createPath(this.tiles[0][x], null);
    

  }

  findLongestPath() : number {

    const startJunction = this.startPath.endJunction!;
    startJunction.prevPath = this.startPath;
    startJunction.distanceSoFar = this.startPath.length - 1;
    let nodesToCheck = [startJunction];

    while (nodesToCheck.length > 0) {

      let node = nodesToCheck[0];
      for (const n of nodesToCheck) {  
        if (n.centerTile.x + n.centerTile.y < node.centerTile.x + node.centerTile.y) { node = n; }
      }

      for (const path of node.exitPaths) {

        const distSoFar = node.distanceSoFar + path.length + 1;
        const junction = path.endJunction;

        if (junction === null) {
          return distSoFar;
        }

        if (distSoFar > junction.distanceSoFar) {
          junction.distanceSoFar = distSoFar;
          junction.prevPath = path;

          if (!nodesToCheck.includes(junction)) {
            nodesToCheck.push(junction);
          }
        }
      }

      nodesToCheck = nodesToCheck.filter(n => n !== node);
    }
    return 0;
  }

  markLongestPart() {

    let currentPath: Path | null = this.endPath;
    while (currentPath) {
      currentPath.visit();
      const junction : Junction | null = currentPath.startJunction;
      if (!junction) { break; }
      junction.centerTile.isVisited = true;
      currentPath = junction.prevPath;
    }

  }

  getTileInDirection(tile: Tile, dir: Direction) : Tile | null {
    switch (dir) {
      case Direction.East: return this.tryGetTile(tile.x + 1, tile.y);
      case Direction.South: return this.tryGetTile(tile.x, tile.y + 1);
      case Direction.West: return this.tryGetTile(tile.x - 1, tile.y);
      case Direction.North: return this.tryGetTile(tile.x, tile.y - 1);
    }
  }

  tryGetTile(x: number, y: number) : Tile | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) { return null; }
    return this.tiles[y][x];
  }

  getTileAfterSlope(tile: Tile) : Tile {
    let x = tile.type === TileType.SlopeEast ? tile.x + 1 : tile.x;
    let y = tile.type === TileType.SlopeSouth ? tile.y + 1 : tile.y;
    return this.tiles[y][x];
  }

  getJunction(tile: Tile) : Junction {
    if (!this.junctions.has(tile)) {
      const junction = this.createJunction(tile);
      this.junctions.set(tile, junction)
    }
    return this.junctions.get(tile)!;
  }

  createPath(startTile: Tile, prevJunction: Junction | null) : Path {

    let prevTile: Tile | null = null;
    const tiles: Tile[] = [startTile];
    let tile = startTile;

    while (tile) {
      
      const nextTiles = allDirections.map(d => this.getTileInDirection(tile, d))
        .filter(t => t !== null && t !== prevTile && t.type !== TileType.Forest);

      prevTile = tile;

      if (nextTiles.length === 0) {
        this.endPath = new Path(tiles, prevJunction, null);
        return this.endPath;
      }

      tile = nextTiles[0]!;
      tiles.push(tile);

      if (tile.type === TileType.SlopeEast || tile.type === TileType.SlopeSouth) {
        break;
      }      
    }

    const junctionCenter = this.getTileAfterSlope(tile);
    const nextJunction = this.getJunction(junctionCenter);
    const re = new Path(tiles, prevJunction, nextJunction);
    this.paths.set(startTile, re);
    return re;
  }

  createJunction(centerTile: Tile) : Junction {

    if (this.junctions.has(centerTile)) {
      return this.junctions.get(centerTile)!;
    }

    let southTile = this.getTileInDirection(centerTile, Direction.South)!;
    let eastTile = this.getTileInDirection(centerTile, Direction.East)!;

    const paths: Path[] = [];
    const junction = new Junction(centerTile, paths);

    if (eastTile.type === TileType.SlopeEast) {
      paths.push(this.createPath(eastTile, junction));
    }
    if (southTile.type === TileType.SlopeSouth) {
      paths.push(this.createPath(southTile, junction));
    }

    this.junctions.set(centerTile, junction);
    return junction;
  }

}

export class Tile {

  type: TileType;
  x: number;
  y: number;
  isVisited: boolean = false;

  constructor(c: string, x: number, y: number) {
    this.type = charToTileType(c);
    this.x = x;
    this.y = y;
  }
}

class Path {

  tiles: Tile[];
  startJunction: Junction | null;
  endJunction: Junction | null;
  length: number;

  constructor(tiles: Tile[], startJunction: Junction | null, endJunction: Junction | null) {
    this.tiles = tiles;
    this.startJunction = startJunction;
    this.endJunction = endJunction;
    this.length = tiles.length;
  }

  visit() {
    this.tiles.forEach(t => t.isVisited = true);
  }
  
}

class Junction {

  centerTile: Tile;
  exitPaths: Path[];
  distanceSoFar: number = 0;
  prevPath: Path | null = null;

  constructor(centerTile: Tile, exitPaths: Path[]) {
    this.centerTile = centerTile;
    this.exitPaths = exitPaths;
  }

}

function charToTileType(c: string) : TileType {
  switch (c) {
    case ".": return TileType.Empty;
    case "#": return TileType.Forest;
    case ">": return TileType.SlopeEast;
    case "v": return TileType.SlopeSouth;
    default: throw new Error("Unknown char: " + c);
  }
}

export enum TileType {
  Empty = 0,
  Forest = 1,
  SlopeEast = 2,
  SlopeSouth =3
}

export enum Direction {
  East = 0,
  South = 1,
  West = 2,
  North = 3,
}

const allDirections = [ Direction.East, Direction.South, Direction.West, Direction.North ];
