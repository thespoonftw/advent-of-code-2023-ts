import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const city = new FactoryCity(input, null, 3);
    city.solve();
    setSimCity(city);
    console.log(city);
    return city.getHeatLoss();
  }

  const part2 = (input: string[]): number => {
    const city = new FactoryCity(input, 4, 10);
    city.solve();
    setSimCity(city);
    console.log(city);
    return city.getHeatLoss();
  }

  const [simCity, setSimCity] = useState<FactoryCity | null>(null);
  function getFontSize() : number { return simCity && simCity.width > 20 ? 8 : 14; }

  return (
    <PageLayout pageTitle={"Day 17: Clumsy Crucible"} >
      <Solver part1={part1} part2={part2} testFile="Test17.txt" />
      <WorkingBox>
        { simCity && 
          <div style={{fontSize: getFontSize()}}>
            { simCity.blocks.map((row, y) =>
              <div key={y}>
                { row.map((node, x) =>
                <span key={x} style={{color: node.inFinalPath ? "red" : "black"}}>{node.value}</span>
              )}</div>
            )
          }</div>
        }
      </WorkingBox>
    </PageLayout>
  );
}

class FactoryCity {

  width: number;
  height: number;
  blocks: Block[][] = [];
  nodesToCheck: Node[] = [];
  nodeMap = new Map<string, Node>;

  endNode: Node | null = null;

  minSteps: number | null;
  maxSteps: number | null;


  constructor(input: string[], minSteps: number | null, maxSteps: number | null) {
    this.width = input.length;
    this.height = input.length > 0 ? input[0].length : 0;
    this.minSteps = minSteps;
    this.maxSteps = maxSteps;

    for (let y = 0; y < this.height; y++) {
      const row: Block[] = [];
      this.blocks.push(row);
      for (let x = 0; x < this.width; x++) {
        const node = new Block(input[y][x], x, y);
        row.push(node);
      }
    }

    const n1 = this.getNode(0, 0, Direction.East, 0);
    n1.costSoFar = 0;
    n1.fScore = n1.h; 

    const n2 = this.getNode(0, 0, Direction.South, 0);
    n2.costSoFar = 0;
    n2.fScore = n2.h; 

    this.nodesToCheck = [n1, n2];
  }

  solve() {

    while (true) {

      const node = this.getNextNode();

      if (node.x === this.width - 1 && node.y === this.height - 1) { 
        this.endNode = node;
        return; 
      }

      for (const neighbour of this.getUnvisitedNeighbours(node)) {

        const value = this.blocks[neighbour.y][neighbour.x].value;
        const newCostSoFar = node.costSoFar + value;
        if (newCostSoFar < neighbour.costSoFar) {
          neighbour.update(node, newCostSoFar);
          this.nodesToCheck.push(neighbour);
        }
      }

      node.isVisited = true;
      this.nodesToCheck = this.nodesToCheck.filter(n => n != node);
    }
  }

  getNextNode(): Node {
    if (this.nodesToCheck.length === 0) { throw new Error("Out of nodes") }
    let re = this.nodesToCheck[0];
    for (const n of this.nodesToCheck) {  
      if (n.fScore < re.fScore) { re = n; }
    }
    return re;
}

  getUnvisitedNeighbours(n: Node) : Node[] {
    const re: Node[] = [];

    const opposite = getOppositeDirection(n.dir);
    const steps = n.steps + 1;      

    for (const dir of allDirections) {

      if (opposite === dir) { continue; }

      const t = this.getAdjacentTile(n.x, n.y, dir);
      if (!t) { continue; }

      if (n.dir === dir) {
        if (this.maxSteps && steps >= this.maxSteps) { continue; }
        re.push(this.getNode(t.x, t.y, dir, steps));
      }
      else {
        if (this.minSteps && steps < this.minSteps) { continue; }
        re.push(this.getNode(t.x, t.y, dir, 0))
      }
    }
    return re.filter(b => !b.isVisited);
  }

  getNode(x: number, y: number, dir: Direction, steps: number) : Node {

    const key = `${x}-${y}-${dir}-${steps}`;
    const n = this.nodeMap.get(key);
    if (n) { return n; }

    const h = this.width + this.height - x - y;
    const newNode = new Node(x, y, dir, steps, h);
    this.nodeMap.set(key, newNode);
    return newNode;
  }

  getHeatLoss() : number {
    let currentNode: Node | null = this.endNode;
    while (currentNode !== null) { 
      this.blocks[currentNode.y][currentNode.x].inFinalPath = true;
      currentNode = currentNode.prev;
    }
    return this.endNode!.costSoFar;
  }

  getAdjacentTile(x: number, y: number, d: Direction): Block | null {
    switch (d) {
      case Direction.North: return this.tryGetTile(x, y - 1);
      case Direction.East: return this.tryGetTile(x + 1, y);
      case Direction.South: return this.tryGetTile(x, y + 1);
      case Direction.West: return this.tryGetTile(x - 1, y);
      default: throw new Error();
    }
  }

  tryGetTile(x: number, y: number) : Block | null {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
      return null;
    } else {
      return this.blocks[y][x];
    }
  }
}

class Block {

  x: number;
  y: number;
  value: number;

  inFinalPath: boolean = false;  

  constructor(input: string, x: number, y: number) {
    this.value = parseInt(input);
    this.x = x;
    this.y = y;
  }

}

class Node {

  x: number;
  y: number;
  dir: Direction;
  steps: number;
  h: number;

  costSoFar: number = Number.POSITIVE_INFINITY;
  fScore: number = Number.POSITIVE_INFINITY;
  prev: Node | null = null;
  isVisited: boolean = false;
  
  constructor(x: number, y: number, dir: Direction, steps: number, h: number) {
    this.x = x;
    this.y = y;
    this.h = h;
    this.dir = dir;
    this.steps = steps;
  }
  
  update(prev: Node, costSoFar: number) {
    this.prev = prev;
    this.costSoFar = costSoFar;
    this.fScore = this.h + this.costSoFar;
  } 

}

export enum Direction {
  North = 0,
  West = 1,
  South = 2,
  East = 3
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