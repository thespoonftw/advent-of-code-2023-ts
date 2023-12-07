import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';
import WorkingBox from '../components/WorkingBox';
import Day6Sim from '../components/Day6Sim';

export default function Render() {

  const part1 = (input: string): string => {
    const races = parseRaces(input);
    setRaces(races);
    let product = 1;
    for (const race of races) {
      product *= race.winRange;
    }
    return product.toString();
  }

  const part2 = (input: string): string => {
    const race = parseMegaRace(input);
    setRaces([race]);
    return race.winRange.toString();
  }

  const solverProps = new SolverProps(part1, part2);
  const [shownRaces, setRaces] = useState<Race[]>([]);
  
  return (
    <PageLayout pageTitle={"Day 06: Wait For It"} >
      <Day6Sim/>
      <Solver solverProps={solverProps} />
      <WorkingBox>
      {shownRaces && shownRaces.map((value, index) => (
            <div key={index}>
              Race: {index} | Time: {value.time} | Dist: {value.distance} | Min: {value.lower} | Max: {value.upper} | Range: {value.winRange}
            </div>
          ))
        }
      </WorkingBox>      
    </PageLayout>
  );
}

function parseRaces(input: string): Race[] {
  const lines = input.split("\n");
  const times = lines[0].split(" ").filter(v => v != "").filter(v => v !== "Time:").map(v => parseInt(v));
  const distances = lines[1].split(" ").filter(v => v != "").filter(v => v !== "Distance:").map(v => parseInt(v));

  let returner: Race[] = [];
  for (let i=0; i<times.length; i++) {
    returner.push(new Race(times[i], distances[i]));
  }
  return returner;
}

function parseMegaRace(input: string): Race {
  const lines = input.split("\n");
  const t = parseInt(lines[0].replace(/\D/g, ''));
  const d = parseInt(lines[1].replace(/\D/g, ''));
  return new Race(t, d);
}

class Race {

  time: number;
  distance: number;
  lower: number;
  upper: number;
  winRange: number;

  constructor(time: number, distance: number) {
    this.time = time;
    this.distance = distance;

    const range = Math.abs(Math.sqrt((time * time) - (4 * distance)) / 2);
    const center = time / 2;

    this.lower = Math.floor(center - range) + 1;
    this.upper = Math.ceil(center + range) - 1;
    this.winRange = (this.upper - this.lower) + 1;
  }
}