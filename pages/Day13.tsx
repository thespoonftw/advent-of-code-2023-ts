import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, PagedWorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const rockPatterns = buildRockPatterns(input);
    rockPatterns.forEach(r => r.findReflections());
    setRockPatterns(rockPatterns);
    return rockPatterns.reduce((acc, r) => acc + r.reflectionValue, 0);
  }

  const part2 = (input: string[]): number => {
    const rockPatterns = buildRockPatterns(input);
    rockPatterns.forEach(r => r.findReflections(1));
    setRockPatterns(rockPatterns);
    console.log(rockPatterns);
    return rockPatterns.reduce((acc, r) => acc + r.reflectionValue, 0);
  }

  const [rockPatterns, setRockPatterns] = useState<RockPattern[] | null>(null);
  const maxIndex = (): number => { return rockPatterns ? rockPatterns.length : 0; }
  const [index, setIndex] = useState<number>(0);

  return (
    <PageLayout pageTitle="Day 13: Points of Incidence" >
      <Solver part1={part1} part2={part2} testFile="Test13.txt" />
      <PagedWorkingBox label="Rock Pattern" index={index} maxIndex={maxIndex()} setIndex={setIndex} >
      { rockPatterns && RenderRockPattern(rockPatterns[index]) }
      </PagedWorkingBox>
    </PageLayout>
  );

  function RenderRockPattern(rockPattern: RockPattern) {

    if (rockPattern === null) { return; }
  
    return (
      <>
      <div>&nbsp;Reflection Value: {rockPattern.reflectionValue}</div>
      <div>&nbsp;</div>
      { rockPattern.array.map((row, y) => (
        <div key={y} >&nbsp;&nbsp;
          { row.map((c, x) => RenderTile(rockPattern, x, y, c))}
        </div>
      ))}
      </>
    );
  }

  function RenderTile(rockPattern: RockPattern, x: number, y: number, c: string) {

    const isSmudge = rockPattern.smudges.some(s => s[1] === x && s[0] === y);
    const isReflection = (rockPattern.xReflection && x < rockPattern.xReflection) || (rockPattern.yReflection && y < rockPattern.yReflection);
    const highlight = isSmudge ? "red" : "white";
    const color = isReflection ? "green" : "blue";

    return (
      <span key={x} style={{color: color, backgroundColor: highlight}} >
        {c}
      </span>
    )
  }
}

function buildRockPatterns(input: string[]) : RockPattern[] { 

  let startIndex = 0;
  const re: RockPattern[] = [];

  for (let i = 0; i <= input.length; i++) {
    if (i === input.length || input[i].length === 0) {
      re.push(new RockPattern(input.slice(startIndex, i)));
      startIndex = i + 1;
    }
  }
  return re;
}

class RockPattern {

  array: string[][];
  xReflection: number | null = null;
  yReflection: number | null = null;
  reflectionValue: number = 0;
  width: number;
  height: number;
  smudges: [number, number][] = [];

  constructor(lines: string[]) {
    this.array = lines.map(l => l.split(""));
    this.height = lines.length;
    this.width = lines.length > 0 ? lines[0].length : 0;
  }

  findReflections(smudges: number = 0) {
    for (let i = 1; i < this.width; i++) {
      if (this.checkReflection(i, false, smudges)) {
        this.xReflection = i;
        this.reflectionValue += i;
        break;
      }
    }
    for (let i = 1; i < this.height; i++) {
      if (this.checkReflection(i, true, smudges)) {
        this.yReflection = i;
        this.reflectionValue += i * 100;
        break;
      }
    }
  }

  checkReflection(index: number, invert: boolean, smudgeCount: number) : boolean {
    let smudges: [number, number][] = [];
    const w = invert ? this.height : this.width;
    const h = invert ? this.width : this.height;
    const xStart = Math.max(0, (2 * index) - w);
    for (let a = xStart; a < index; a++) {
      for (let b = 0; b < h; b++) {
        const c1 = this.getCell(a, b, invert);
        const c2 = this.getCell((2 * index) - a - 1, b, invert);
        if (c1 !== c2) { 
          smudges.push(invert ? [a, b] : [b, a]); 
        }
      }
    }
    if (smudges.length === smudgeCount) {
      this.smudges.push(...smudges);
      return true;
    } else {
      return false;
    }
  }

  getCell(a: number, b: number, invert: boolean) {
    return invert ? this.array[a][b] : this.array[b][a];
  }

}

