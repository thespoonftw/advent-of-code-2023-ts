import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';
import Viz22 from '../sims/Viz22';

export default function Render() {

  const part1 = (input: string[]): number => {
    const tower = new BrickTower(input);
    tower.fall();
    tower.findBricksToDisintegrate();
    setVizTower(tower);
    return tower.bricks.filter(b => b.danger).length;
  }

  const part2 = (input: string[]): number => {
    const tower = new BrickTower(input);
    tower.fall();
    tower.findChainReactions();
    setVizTower(tower);
    return tower.bricks.reduce((acc, b) => acc += b.danger, 0);
  }

  const [vizTower, setVizTower] = useState<BrickTower | null>(null);


  return (
    <PageLayout pageTitle={"Day 22: Sand Slabs"} >
      <Solver part1={part1} part2={part2} testFile="Test22.txt" />
      <Viz22 tower={vizTower} />
    </PageLayout>
  );
}

const zSize = 400;
const xySize = 10;

export class BrickTower {

  bricks: Brick[];
  cells: (Brick | null)[][][];  

  constructor(input: string[]) {

    this.bricks = input.map(l => new Brick(l));
    this.bricks.sort((a, b) => a.zMin - b.zMin);

    this.cells = [];
    this.cells = Array.from({ length: zSize }, () => Array.from({ length: xySize }, () => Array.from({ length: xySize }, () => null)));
  }

  fall() {

    for (const brick of this.bricks) {
      let z = brick.zMin;

      while (z > 1) {
        if (!this.checkIfClear(brick, z - 1)) { break; }
        z--;
      }
      brick.updateZ(z);

      for (let x = brick.xMin; x <= brick.xMax; x++) {
        for (let y = brick.yMin; y <= brick.yMax; y++) {
          for (let z = brick.zMin; z <= brick.zMax; z++) {
            this.cells[z][y][x] = brick;
          }
        }
      }
    }

  }

  checkIfClear(brick: Brick, z: number) : boolean {
    for (let x = brick.xMin; x <= brick.xMax; x++) {
      for (let y = brick.yMin; y <= brick.yMax; y++) {
        if (this.cells[z][y][x]) {
          return false;
        }
      }
    }
    return true;
  }

  getBricksAtZ(brick: Brick, z: number) : Set<Brick> {
    let re: Set<Brick> = new Set();
    for (let x = brick.xMin; x <= brick.xMax; x++) {
      for (let y = brick.yMin; y <= brick.yMax; y++) {
        const brickAt = this.cells[z][y][x];
        if (brickAt) {
          re.add(brickAt)
        }
      }
    }
    return re;
  }

  findBricksToDisintegrate() {
    
    for (const brick of this.bricks) {
      if (this.getUnsupportedBricks(brick, new Set([brick])).size === 0) {
        brick.danger = 1;
      }
    }
  }

  findChainReactions() {
    for (const brick of this.bricks) {
      const fallen: Set<Brick> = new Set([brick]);
      this.addFallenRecursive(brick, fallen);
      brick.danger = fallen.size - 1;
    }
  }

  getUnsupportedBricks(above: Brick, exclude: Set<Brick>) : Set<Brick> {
    let re: Set<Brick> = new Set();
    const bricksAbove = this.getBricksAtZ(above, above.zMax + 1);
    for (const above of bricksAbove) {
      const bricksBelow = this.getBricksAtZ(above, above.zMin - 1);
      exclude.forEach(b => bricksBelow.delete(b));
      if (bricksBelow.size === 0) {
        re.add(above);
      }
    }
    return re;
  }

  addFallenRecursive(input: Brick, fallen: Set<Brick>) {
    
    let unsupported = this.getUnsupportedBricks(input, fallen);
    unsupported.forEach(b => fallen.add(b));

    for (const brick of unsupported) {
      this.addFallenRecursive(brick, fallen);
    }
  }
  


}

export class Brick {

  xMin: number;
  xMax: number;
  xLen: number;
  yMin: number;
  yMax: number;
  yLen: number;
  zMin: number;
  zMax: number;
  zLen: number;
  danger: number = 0;

  constructor(line: string) {
    const values = line.split("~").join(",").split(",").map(c => parseInt(c));
    this.xMin = values[0];
    this.yMin = values[1];
    this.zMin = values[2];
    this.xMax = values[3];
    this.yMax = values[4];
    this.zMax = values[5];
    this.xLen = values[3] - values[0] + 1;
    this.yLen = values[4] - values[1] + 1;
    this.zLen = values[5] - values[2] + 1;
  }

  updateZ(z: number) {
    this.zMax = (this.zMax - this.zMin) + z;
    this.zMin = z;
  }
}