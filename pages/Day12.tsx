import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const records = input.map(i => new ConditionRecord(i));
    records.forEach(r => r.calculatePermutations());
    return records.reduce((acc, c) => acc + c.permutations, 0);
  }

  const part2 = (input: string[]): number => {
    const records = input.map(i => new ConditionRecord(i));
    records.forEach(r => r.unfold(5));
    records.forEach(r => r.calculatePermutations())
    return records.reduce((acc, c) => acc + c.permutations, 0);
  }
  
  return (
    <PageLayout pageTitle={"Day 12: Hot Springs"} >
      <Solver part1={part1} part2={part2} testFile="Test12.txt" />
    </PageLayout>
  );

}

class ConditionRecord {

  str: string;
  springLengths: number[];
  permutations: number = 0;
  cache: { [key: string]: number } = {};

  constructor(line: string) {

    const split = line.split(" ");
    this.str = split[0];
    this.springLengths = split[1].split(",").map(s => parseInt(s));
  }

  unfold(factor: number) {
    this.springLengths = Array(factor).fill([...this.springLengths]).flat();
    this.str = Array(factor).fill(this.str).join("?");
  }

  calculatePermutations() {
    this.permutations = this.getPermutationsRecursive(0, 0);
  }

  getPermutationsRecursive(springIndex: number, strIndex: number) : number {

    let key = springIndex + "-" + strIndex;
    if (this.cache[key]) { return this.cache[key]; }

    let r = 0;
    const matches: number[] = [];
    
    const springLength = this.springLengths[springIndex];
    const max = this.str.length - springLength;

    for (let i = strIndex; i <= max; i++) {

      const end = i + springLength;      
      if (this.str[i - 1] === "#") { break; } // if we're leaving behind a #, stop
      if (this.str[end] === "#") { continue; } // if next character along is a #, not valid
      const slice = this.str.slice(i, end);
      if (slice.includes(".")) { continue; } // slice contains a "."", not valid
      
      matches.push(end);
    }

    if (springIndex + 1 >= this.springLengths.length) {
      for (const m of matches) {
        const remaining = this.str.substring(m, this.str.length);
        if (remaining.includes('#')) { continue; }
        r += 1;
      }
      
    } else {
      for (const m of matches) {
        r += this.getPermutationsRecursive(springIndex + 1, m + 1);
      }
    }
    
    this.cache[key] = r;
    return r;
  }

  /*
  getPermutationsRecursive(springIndex: number, soFar: string) : string[] {

    const r: string[] = [];
    const matches: string[] = [];
    
    const springLength = this.springLengths[springIndex];
    const max = this.str.length - springLength;
    const start = soFar.length;

    for (let i = start; i <= max; i++) {
      
      if (this.str[i - 1] === "#") { break; } // if we're leaving behind a #, stop
      if (this.str[i + springLength] === "#") { continue; } // if next character along is a #, not valid
      const slice = this.str.slice(i, i + springLength);
      if (slice.includes(".")) { continue; } // slice contains a "."", not valid
      
      const newStr = soFar + this.str.substring(start, i) + "#".repeat(springLength);
      matches.push(newStr);
    }

    if (springIndex + 1 >= this.springLengths.length) {
      for (const m of matches) {
        const remaining = this.str.substring(m.length, this.str.length);
        if (remaining.includes('#')) { continue; }
        const finalStr = (m + remaining).replaceAll("?", ".");
        r.push(finalStr);
      }
      
    } else {
      for (const m of matches) {
        r.push(...this.getPermutationsRecursive(springIndex + 1, m + "."))
      }
    }
    
    return r;
  }
  */

}
