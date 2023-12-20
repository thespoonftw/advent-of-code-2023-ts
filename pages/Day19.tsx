import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const emptyRowIndex = input.indexOf("");
    const sorter = new MachinePartSorter(input.slice(0, emptyRowIndex));
    const parts = input.slice(emptyRowIndex + 1, input.length).map(l => createSimpleMachinePart(l));
    sorter.sort(parts);
    return sorter.sumValues();
  }

  const part2 = (input: string[]): number => {
    const emptyRowIndex = input.indexOf("");
    const sorter = new MachinePartSorter(input.slice(0, emptyRowIndex));
    const parts = [createAdvancedMachinePart()]
    sorter.sort(parts);
    return sorter.sumCombos();
  }


  return (
    <PageLayout pageTitle={"Day 19: Aplenty"} >
      <Solver part1={part1} part2={part2} testFile="Test19.txt" />
    </PageLayout>
  );
}

const COMBINATION_LIMIT: number = 4000;

class MachinePartSorter {

  workflows: Map<string, Workflow> = new Map<string, Workflow>();
  accepted: MachinePart[] = [];
  rejected: MachinePart[] = [];

  constructor(input: string[]) {
    const workflowsArr = input.map(l => new Workflow(l));
    workflowsArr.forEach(w => this.workflows.set(w.label, w));
  }

  sort(input: MachinePart[]) {
    input.forEach(p => this.sortRecursive(p, "in", 0));
  }

  sumValues() : number {
    return this.accepted.reduce((acc, p) => acc += p.getSumOfAttributes(), 0);
  }

  sumCombos() : number {
    let sum = 0;
    for (const part of this.accepted) {
      sum += part.getRange("x").getWidth() * part.getRange("m").getWidth() * part.getRange("a").getWidth() * part.getRange("s").getWidth();
    }
    return sum;
  }

  sortRecursive(part: MachinePart, destination: string, ruleIndex: number) {

    if (destination === "A") {
      this.accepted.push(part);
      return;

    } else if (destination === "R") {
      this.rejected.push(part);
      return;
    }

    const workflow = this.workflows.get(destination);
    const rule = workflow!.rules[ruleIndex];
    const [part1, part2] = rule.splitPart(part);

    if (part1) {
      this.sortRecursive(part1, rule.destination, 0);
    }
    if (part2) {
      this.sortRecursive(part2, destination, ruleIndex + 1);
    }

  }
}

function createSimpleMachinePart(line: string) : MachinePart {
  let map = new Map<string, Range>();
  const split = line.slice(1, line.length - 1).split(",");
    split.forEach(s => {
      const [key, valueStr] = s.split("=");
      const value = parseInt(valueStr)
      const range = new Range(value, value);
      map.set(key, range);
    });
  return new MachinePart(map);
}

function createAdvancedMachinePart() : MachinePart {
  let map = new Map<string, Range>();
  map.set("x", new Range(1, COMBINATION_LIMIT));
  map.set("m", new Range(1, COMBINATION_LIMIT));
  map.set("a", new Range(1, COMBINATION_LIMIT));
  map.set("s", new Range(1, COMBINATION_LIMIT));
  return new MachinePart(map);
}

class Workflow {

  str: string;
  label: string;
  rules: Rule[];

  constructor(input: string) {
    this.str  = input;
    const split1 = input.split("{");
    this.label = split1[0];
    const split2 = split1[1];
    this.rules = split2.slice(0, split2.length - 1).split(",").map(s => this.CreateRule(s));
  }

  CreateRule(str: string) : Rule {
    return str.includes(":") ? new ComparisonRule(str) : new Rule(str);
  }

}



class Rule {

  destination: string;

  constructor(input: string) {
    this.destination = input;
  }

  splitPart(machinePart: MachinePart) : [toSend: MachinePart | null, remainder: MachinePart | null] {
    return [machinePart, null]
  }

}

class ComparisonRule extends Rule {

  value: number;
  type: ComparisonType;
  attribute: string;

  constructor(input: string) {
    const split1 = input.split(":");
    super(split1[1]);

    this.attribute = input[0];
    this.type = input[1] === ">" ? ComparisonType.Greater : ComparisonType.Less;
    this.value = parseInt(split1[0].slice(2));
  }

  splitPart(machinePart: MachinePart) : [toSend: MachinePart | null, remainder: MachinePart | null] {
    if (this.type === ComparisonType.Greater) {
      const toSend = machinePart.cloneAndEditMin(this.attribute, this.value + 1);
      const remainder = machinePart.cloneAndEditMax(this.attribute, this.value);
      return [toSend, remainder];
    } else {
      const toSend = machinePart.cloneAndEditMax(this.attribute, this.value - 1);
      const remainder = machinePart.cloneAndEditMin(this.attribute, this.value);
      return [toSend, remainder];
    }
  }

}

class MachinePart {

  attributeMap: Map<string, Range> = new Map<string, Range>();

  constructor(map: Map<string, Range>) {
    this.attributeMap = map;
  }

  clone() : MachinePart {
    const clonedMap = new Map<string, Range>();
    for (const [key, value] of this.attributeMap.entries()) {
      clonedMap.set(key, value.clone());
    }
    return new MachinePart(clonedMap);
  }

  getSumOfAttributes(): number {
    let sum = 0;
    return [...this.attributeMap.values()].reduce((acc, r) => acc + r.min, 0);
  }  

  cloneAndEditMin(attr: string, min: number) : MachinePart | null {
    const range = this.attributeMap.get(attr)!;
    if (min > range.max) { return null; }
    const clone = this.clone();
    if (min < range.min) { return clone; }
    clone.attributeMap.get(attr)!.min = min;
    return clone;
  }

  cloneAndEditMax(attr: string, max: number) : MachinePart | null {
    const range = this.attributeMap.get(attr)!;
    if (max < range.min) { return null; }
    const clone = this.clone();
    if (max > range.max) { return clone; }
    clone.attributeMap.get(attr)!.max = max;
    return clone;
  }

  getRange(attr: string) : Range {
    return this.attributeMap.get(attr)!;
  }

}

class Range {
  min: number; // inclusive
  max: number; // inclusive

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }

  clone() {
    return new Range(this.min, this.max);
  }

  getWidth() {
    return (this.max - this.min) + 1
  }
}

export enum ComparisonType {
  Less = 0,
  Greater = 1
}



