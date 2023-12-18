import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import Sim15 from '../sims/Sim15';

export default function Render() {

  const part1 = (input: string[]): number => {
    setSimConfig(new LensConfiguration(input[0]));
    return input[0].split(",").reduce((acc, s) => acc + hashToNumber(s), 0);
  }

  const part2 = (input: string[]): number => {
    const lensConfig = new LensConfiguration(input[0]);
    setSimConfig(new LensConfiguration(input[0]));
    return lensConfig.findFocusingPower();
  }

  const [simConfig, setSimConfig] = useState<LensConfiguration | null>(null);
  
  return (
    <PageLayout pageTitle={"Day 15: Lens Library"} >
      <Solver part1={part1} part2={part2} testFile="Test15.txt" />
      <Sim15 config={simConfig} />  
    </PageLayout>
  );
}

function hashToNumber(str: string): number {
  let v = 0;
  for (let i = 0; i < str.length; i++) {
    v += str.charCodeAt(i);
    v *= 17;
    v %= 256;    
  }
  return v;
}

export class Step {

  str: string;
  hashValue: number;
  instruction: Instruction;

  constructor(str: string) {
    this.str = str;
    this.instruction = str.endsWith("-") ? new RemoveLens(str) : new Lens(str)
    this.hashValue = hashToNumber(this.instruction.label);
  }
}

export class LensConfiguration {

  boxes: Box[] = new Array(256).fill(0).map(() => new Box());
  steps: Step[];
  focusingPower: number = 0;
  stepIndex: number = 0;

  constructor(str: string) {
    this.steps = str.split(",").map(s => new Step(s));
  }

  findFocusingPower() : number {

    while(this.takeStep()) {

    }

    let re = 0;

    for (let i = 0; i < this.boxes.length; i++) {
      const box = this.boxes[i];
      for (let j = 0; j < box.lenses.length; j++) {
        re += (1 + i) * (1 + j) * box.lenses[j].focalLength;
      }
    }

    return re;
  }

  takeStep() : boolean {

    const step = this.steps[this.stepIndex];
    const instruction = step.instruction;
    const box = this.boxes[step.hashValue];

    if (instruction instanceof Lens) {
      const existingLens = box.lenses.find(l => l.label === instruction.label);

      if (existingLens) {
        existingLens.focalLength = instruction.focalLength;

      } else {
        box.lenses.push(instruction);
      }

    } else {
      box.lenses = box.lenses.filter(l => l.label !== instruction.label);
    }

    this.stepIndex ++;
    return this.stepIndex === this.steps.length;
  }

  reset() {
    this.stepIndex = 0;
    this.boxes.forEach(b => b.lenses = [])
  }


}

class Instruction {
  str: string;
  label: string; 

  constructor(str: string, label: string) {
    this.str = str;
    this.label = label;
  }
}

class RemoveLens extends Instruction {

  constructor(str: string) {
    super(str, str.slice(0, str.length - 1));
  }
}

class Lens extends Instruction {
  focalLength: number;

  constructor(str: string) {
    const split = str.split("=");
    super(str, split[0]);
    this.focalLength = parseInt(split[1]);
  }
}

export class Box {
  lenses: Lens[] = [];
}
