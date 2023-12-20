import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const sorter = new MachinePartSorter(input);
    console.log(sorter);
    return sorter.machineParts.filter(m => m.isAccepted).reduce((acc, m) => acc + m.sumValue, 0);
  }

  const part2 = (input: string[]): number => {
    return 0;
  }


  return (
    <PageLayout pageTitle={"Day 19: Aplenty"} >
      <Solver part1={part1} part2={part2} testFile="Test19.txt" />
    </PageLayout>
  );
}

class MachinePartSorter {

  workflows: Map<string, Workflow> = new Map<string, Workflow>();
  machineParts: MachinePart[];

  constructor(input: string[]) {

    const i = input.indexOf("");
    const workflowsArr = input.slice(0, i).map(l => new Workflow(l));
    this.machineParts = input.slice(i + 1, input.length).map(l => new MachinePart(l))

    workflowsArr.forEach(w => this.workflows.set(w.label, w));

    for (const machinePart of this.machineParts) {
      let workflow = this.workflows.get("in")!;
      let ruleIndex = 0;

      while (true) {

        const rule = workflow.rules[ruleIndex];
        console.log(rule);

        let destination: string | null = rule.tryGetDestination(machinePart);
        if (destination === "A") {
          machinePart.isAccepted = true;
          break;
        } else if (destination === "R") {
          machinePart.isAccepted = false;
          break;
        } else if (destination !== null) {
          workflow = this.workflows.get(destination)!;
          ruleIndex = 0;
        } else {
          ruleIndex++;
        }
      }
    }

      



  }


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

  tryGetDestination(machinePart: MachinePart) : string | null {
    return this.destination;
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

  tryGetDestination(machinePart: MachinePart) : string | null {
    const machineValue = machinePart.attributeMap.get(this.attribute);
    if (this.type === ComparisonType.Greater) {
      return machineValue! > this.value ? this.destination : null;
    } else {
      return machineValue! < this.value ? this.destination : null;
    }
  }

}

class MachinePart {

  str: string;
  attributeMap: Map<string, number> = new Map<string, number>();
  isAccepted: boolean | null = null;
  sumValue: number = 0;

  constructor(input: string) {
    this.str = input;
    const split = input.slice(1, input.length - 1).split(",");
    split.forEach(s => {
      const [key, value] = s.split("=");
      this.attributeMap.set(key, parseInt(value));
      this.sumValue += parseInt(value);
    });
  }

}

export enum ComparisonType {
  Less = 0,
  Greater = 1
}



