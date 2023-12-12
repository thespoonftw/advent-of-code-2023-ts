import { ChangeEvent, SetStateAction, useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput } from '../components/Solver';
import styles from '../components/Solver.module.css';
import ExpansionSim from '../components/ExpansionSim';

export default function Render() {

  const part1 = (input: string[]): number => {
    const galaxy = new Galaxy(input);
    setLines(input);
    galaxy.expand(2);
    return galaxy.measureDistances();
  }

  const part2 = (input: string[]): number => {
    const galaxy = new Galaxy(input);
    setLines(input);
    galaxy.expand(1_000_000);
    return galaxy.measureDistances();
  }

  const [lines, setLines] = useState<string[] | null>(null);
  const [expansionFactor, setExpansionFactor] = useState<number>(1_000_000);
  
  return (
    <PageLayout pageTitle="Day 11: Cosmic Expansion" >
      <InputRow label="Params:">
        <NumberInput label="Part 2 Expansion Factor" set={setExpansionFactor} value={expansionFactor} width={100} />
      </InputRow>
      <Solver part1={part1} part2={part2} testFile="Test11.txt" />
      <ExpansionSim lines={lines} />
      
    </PageLayout>
  );

}

export class Galaxy {

  width: number;
  height: number;
  stars: Star[] = [];

  constructor(input: string[]) {
    this.height = input.length;
    this.width = input.length > 0 ? input[0].length : 0;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const c = input[y][x];
        if (c == "#") {
          this.stars.push(new Star(x, y));
        }
      }
    }

  }

  expand(factor: number) {
    const f = factor - 1;    
    for (let x = 0; x < this.width; x++) {
      const columnCount = this.stars.filter(s => s.x === x).length;
      if (columnCount === 0) {
        const toExpand = this.stars.filter(s => s.x > x);
        toExpand.forEach(s => s.x += f);
        this.width += f;
        x += f;
      }
    }

    for (let y = 0; y < this.height; y++) {
      const rowCount = this.stars.filter(s => s.y === y).length;
      if (rowCount === 0) {
        const toExpand = this.stars.filter(s => s.y > y);
        toExpand.forEach(s => s.y += f);
        this.height += f;
        y += f;
      }
    }

  }

  measureDistances() {
    let d = 0;
    const n = this.stars.length;
    
  for (let i = 0; i < n; i++) {
    const star1 = this.stars[i];
    for (let j = i + 1; j < n; j++) {
      const star2 = this.stars[j];
      d += star1.getDistanceTo(star2);
    }
  }
    return d;
  }

}

class Star {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    console.log(x + ":" + y);
    this.x = x;
    this.y = y;
  }

  getDistanceTo(other: Star) : number {
    return Math.abs(other.x - this.x) + Math.abs(other.y - this.y);
  }
}

