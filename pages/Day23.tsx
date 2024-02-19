import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import Viz23 from '../sims/Viz23';

export default function Render() {

  const part1 = (input: string[]): number => {
    const trail = new HikingTrail(input);
    trail.createConnections(false);
    const l = trail.findLongestPath();
    setVizTrail(trail);
    return l;
  }

  const part2 = (input: string[]): number => {
    const trail = new HikingTrail(input);
    trail.createConnections(true);
    const l = trail.findLongestPath();
    setVizTrail(trail);
    return l;
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
  paths: Path[] = [];
  nodes: Map<Tile, Node> = new Map<Tile, Node>();

  startNode: Node = new Node(null);
  endNode: Node = new Node(null);
  
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
    this.createPath(this.tiles[0][x], this.startNode);
  }

  createConnections(reversible: boolean) {
    for (const p of this.paths) {
      const connection = new Connection(p.endNode, p);
      p.startNode.connections.push(connection);

      if (reversible) {
        const connection2 = new Connection(p.startNode, p);
        p.endNode.connections.push(connection2);
      }
    }
  }

  findLongestPath() : number {
    const longestPath = this.findLongestPathRecursive([this.startNode], [], -1)!
    longestPath.pathsVisited.forEach(p => p.visit());
    longestPath.nodesVisited.forEach(n => n.visit());
    return longestPath.distanceSoFar;
  }

  findLongestPathRecursive(nodesSoFar: Node[], pathsSoFar: Path[], distance: number) : LongestPath | null {

    const currentNode = nodesSoFar[nodesSoFar.length - 1];

    // we reached the end
    const finalPath = currentNode.connections.find(c => c.endNode == this.endNode);
    if (finalPath) {
      const d = distance + finalPath.path.length;
      const paths = [...pathsSoFar, finalPath.path];
      return new LongestPath(d, nodesSoFar, paths);
    }

    const possibleConnections = currentNode.connections.filter(c => !nodesSoFar.includes(c.endNode));

    // no more possible connections
    if (possibleConnections.length === 0) { return null; }

    const re: LongestPath[] = [];

    for (const connection of possibleConnections) {
      const newNodesSoFar = [...nodesSoFar, connection.endNode];
      const newPathsSoFar = [...pathsSoFar, connection.path];
      const newDist = distance + connection.path.length + 1; // add 1 for the node
      const result = this.findLongestPathRecursive(newNodesSoFar, newPathsSoFar, newDist);
      if (result !== null) { re.push(result); }
    }

    if (re.length === 0) { return null; }

    let highest = re[0];

    for (const result of re) {
      if (result.distanceSoFar > highest.distanceSoFar) {
        highest = result;
      }
    }

    return highest;
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

  getJunction(tile: Tile) : Node {
    if (!this.nodes.has(tile)) {
      const junction = this.createNode(tile);
      this.nodes.set(tile, junction)
    }
    return this.nodes.get(tile)!;
  }

  createPath(startTile: Tile, startNode: Node) {

    let prevTile: Tile | null = null;
    const tiles: Tile[] = [startTile];
    let tile = startTile;

    while (tile) {
      
      const nextTiles = allDirections.map(d => this.getTileInDirection(tile, d))
        .filter(t => t !== null && t !== prevTile && t.type !== TileType.Forest);

      prevTile = tile;

      if (nextTiles.length === 0) { // end of entire trail
        this.paths.push(new Path(tiles, startNode, this.endNode));
        return;
      }

      tile = nextTiles[0]!;
      tiles.push(tile);

      // end of path
      if (tile.type === TileType.SlopeEast || tile.type === TileType.SlopeSouth) {
        break;
      }      
    }

    const junctionCenter = this.getTileAfterSlope(tile);
    const nextJunction = this.getJunction(junctionCenter);
    this.paths.push(new Path(tiles, startNode, nextJunction));
  }

  createNode(centerTile: Tile) : Node {

    if (this.nodes.has(centerTile)) {
      return this.nodes.get(centerTile)!;
    }

    const node = new Node(centerTile);

    let eastTile = this.getTileInDirection(centerTile, Direction.East)!;
    if (eastTile.type === TileType.SlopeEast) {
      this.createPath(eastTile, node);
    }

    let southTile = this.getTileInDirection(centerTile, Direction.South)!;
    if (southTile.type === TileType.SlopeSouth) {
      this.createPath(southTile, node);
    }

    this.nodes.set(centerTile, node);
    return node;
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
  startNode: Node;
  endNode: Node;
  length: number;

  constructor(tiles: Tile[], startNode: Node, endNode: Node) {
    this.tiles = tiles;
    this.startNode = startNode;
    this.endNode = endNode;
    this.length = tiles.length;
  }

  visit() {
    this.tiles.forEach(t => t.isVisited = true);
  }
  
}

class Node {

  centerTile: Tile | null;
  connections: Connection[] = [];

  constructor(centerTile: Tile | null) {
    this.centerTile = centerTile;
  }

  visit() {
    if (this.centerTile) { this.centerTile.isVisited = true; }
  }

}

class Connection {

  endNode: Node;
  path: Path;

  constructor(endNode: Node, path: Path) {
    this.endNode = endNode;
    this.path = path;
  }

}

class LongestPath {

  distanceSoFar: number;
  nodesVisited: Node[];
  pathsVisited: Path[];

  constructor(distanceSoFar: number, nodesVisited: Node[], pathsVisited: Path[]) {
    this.distanceSoFar = distanceSoFar;
    this.nodesVisited = nodesVisited;
    this.pathsVisited = pathsVisited;
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
