import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    let machine = new PulseMachine(input);

    for (let i = 0; i < 1000; i++) {
      machine.pushButton();
    }

    return machine.lowPulseCount * machine.highPulseCount;
  }

  const part2 = (input: string[]): number => {
    let machine = new PulseMachine(input);

    for (let i = 0; i < 10000; i++) {
      machine.pushButton();
    }

    return 0;
  }


  return (
    <PageLayout pageTitle={"Day 20: Pulse Propagation"} >
      <Solver part1={part1} part2={part2} testFile="Test20.txt" />
    </PageLayout>
  );
}

class PulseMachine {

  moduleMap: Map<string, Module> = new Map<string, Module>();
  lowPulseCount: number = 0;
  highPulseCount: number = 0;
  pressCount: number = 0;

  constructor(input: string[]) {

    const moduleArr = input.map(l => this.createModule(l));
    moduleArr.forEach(m => this.moduleMap.set(m.label, m));

    // need to initialize connections to Conjuctions
    for (const source of moduleArr) {
      for (const destination of source.destinations) {
        const module = this.moduleMap.get(destination);
        if (module instanceof Conjuction) {
          module.createConnection(source.label);
        }
      }
    }
  }

  pushButton() {

    this.pressCount++;
    let activePulses: Pulse[] = [new Pulse(PulseType.Low, "", "broadcaster")];

    while (activePulses.length > 0) {

      const newPulses: Pulse[] = [];

      for (const pulse of activePulses) {
        if (pulse.type === PulseType.High) { this.highPulseCount++; }
        if (pulse.type === PulseType.Low) { this.lowPulseCount++; }

        const destinationModule = this.moduleMap.get(pulse.destination);
        if (!destinationModule) { continue; }

        if (pulse.destination === "dt" && pulse.type === PulseType.High) {
          console.log(this.pressCount);
          console.log(pulse);
        }

        const resultingPulses = destinationModule.sendPulse(pulse);
        newPulses.push(...resultingPulses);
      }

      activePulses = newPulses;
    }
  }

  createModule(line: string) : Module {
    if (line.startsWith("broadcaster")) {
      return new Broadcaster(" " + line);
    } else if (line.startsWith("%")) {
      return new FlipFlop(line);
    } else if (line.startsWith("&")) {
      return new Conjuction(line);
    } else {
      throw new Error();
    }
  }

}

class Module {

  label: string;
  destinations: string[];

  constructor(line: string) {
    const split1 = line.split(" -> ")
    this.label = split1[0].slice(1);
    this.destinations = split1[1].split(", ");
  }

  sendPulse(input: Pulse) : Pulse[] {
    return [];
  }

  createPulses(type: PulseType) : Pulse[] {
    return this.destinations.map(d => new Pulse(type, this.label, d));
  }

}

class Broadcaster extends Module {

  sendPulse(input: Pulse) : Pulse[] {
    return this.createPulses(input.type);
  }
}

class FlipFlop extends Module {
  state: boolean = false;

  sendPulse(input: Pulse) : Pulse[] {
    if (input.type === PulseType.High) { return[]; }
    this.state = !this.state;
    const pulseType = this.state ? PulseType.High : PulseType.Low;
    return this.createPulses(pulseType);
  }
}

class Conjuction extends Module {
  pulseMap: Map<string, PulseType> = new Map<string, PulseType>();

  sendPulse(input: Pulse) : Pulse[] {
    this.pulseMap.set(input.source, input.type);
    const allHigh = [...this.pulseMap.values()].every(t => t === PulseType.High);
    const pulseType = allHigh ? PulseType.Low : PulseType.High;
    return this.createPulses(pulseType);
  }

  createConnection(source: string) {
    this.pulseMap.set(source, PulseType.Low);
  }
}

class Pulse {
  type: PulseType;
  source: string;
  destination: string;
  constructor(type: PulseType, source:string, destination: string) {
    this.type = type;
    this.source = source;
    this.destination = destination;
  }

}

export enum PulseType {
  Low = 0,
  High = 1
}

