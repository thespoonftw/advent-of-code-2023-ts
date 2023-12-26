import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';
export default function Render() {

  const part1 = (input: string[]): number => {
    const hailstones = input.map(l => new Hailstone(l));
    //const testArea = new TestArea(7, 27);
    const testArea = new TestArea(200000000000000, 400000000000000);
    let sum = 0;

    for (let i = 0; i < hailstones.length; i++) {
      for (let j = i + 1; j < hailstones.length; j++) {
        if (testArea.checkCollide(hailstones[i], hailstones[j])) {
          sum++;
        }
      }
    }

    return sum;
  }

  const part2 = (input: string[]): number => {
    return 0;
  }

  return (
    <PageLayout pageTitle={"Day 24: Never Tell Me The Odds"} >
      <Solver part1={part1} part2={part2} testFile="Test24.txt" />
    </PageLayout>
  );

}

class Hailstone {

  px: number;
  py: number;
  pz: number;
  vx: number;
  vy: number;
  vz: number;

  constructor(line: string) {
    const split1 = line.split(" @ ");
    const split2 = split1[0].split(", ");
    const split3 = split1[1].split(", ");

    this.px = Number.parseInt(split2[0]);
    this.py = Number.parseInt(split2[1]);
    this.pz = Number.parseInt(split2[2]);

    this.vx = Number.parseInt(split3[0]);
    this.vy = Number.parseInt(split3[1]);
    this.vz = Number.parseInt(split3[2]);
  }
}

class TestArea {

  xMin: number;
  xMax: number;

  yMin: number;
  yMax: number;

  constructor(min: number, max: number) {
    this.xMin = min;
    this.xMax = max;
    this.yMin = min;
    this.yMax = max;
  }

  checkCollide(A: Hailstone, B: Hailstone) : boolean {

    const t1 = B.vx * (A.py - B.py);
    const t2 = B.vy * (A.px - B.px);
    const t3 = (B.vy * A.vx) - (B.vx * A.vy);
    const A_t = (t1 - t2) / t3;

    if (A_t < 0) { return false; }

    const x = A.px + (A_t * A.vx);

    if (x < this.xMin) { return false; }
    if (x > this.xMax) { return false; }

    const y = A.py + (A_t * A.vy);

    if (y < this.yMin) { return false; }
    if (y > this.yMax) { return false; }

    const B_t = (x - B.px) / B.vx;

    if (B_t < 0) { return false; }

    return true;
  }

}

