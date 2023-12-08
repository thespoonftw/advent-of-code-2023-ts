import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';
import WorkingBox from '../components/WorkingBox';
import Day6Sim from '../components/Day6Sim';

export default function Render() {

  const part1 = (input: string[]): string => {
    const races = parseRaces(input);
    setRaces(races);
    let product = 1;
    for (const race of races) {
      product *= race.winRange;
    }
    return product.toString();
  }

  const part2 = (input: string[]): string => {
    const race = parseMegaRace(input);
    setRaces([race]);
    return race.winRange.toString();
  }

  const solverProps = new SolverProps(part1, part2, "Test06.txt");
  const [shownRaces, setRaces] = useState<Race[]>([]);
  
  return (
    <PageLayout pageTitle={"Day 06: Wait For It"} >
      <Day6Sim/>
      <Solver solverProps={solverProps} />
      <WorkingBox>
      <div>
        &nbsp;
        <b>{String("#").padEnd(4, '\u00A0')}</b> 
        &nbsp;|&nbsp;
        <b>{String("Time").padEnd(10, '\u00A0')}</b>
        &nbsp;|&nbsp;
        <b>{String("Dist").padEnd(10, '\u00A0')}</b>
        &nbsp;|&nbsp;
        <b>{String("Min").padEnd(10, '\u00A0')}</b>
        &nbsp;|&nbsp;
        <b>{String("Max").padEnd(10, '\u00A0')}</b>
        &nbsp;|&nbsp;
        <b>{String("Range").padEnd(10, '\u00A0')}</b>
      </div>
      <div>{String("").padStart(72, '-')}</div>
      {shownRaces && shownRaces.map((value, index) => (
            <div key={index}>
              &nbsp;
              {String(index).padEnd(4, '\u00A0')}
              &nbsp;|&nbsp; 
              {String(value.time).padEnd(10, '\u00A0')}
              &nbsp;|&nbsp; 
              {String(value.distance).padEnd(10, '\u00A0')}
              &nbsp;|&nbsp;
              {String(value.lower).padEnd(10, '\u00A0')}
              &nbsp;|&nbsp;
              {String(value.upper).padEnd(10, '\u00A0')}
              &nbsp;|&nbsp;
              {value.winRange}
            </div>
          ))
        }
      </WorkingBox>      
    </PageLayout>
  );
}

function parseRaces(input: string[]): Race[] {
  const times = input[0].split(" ").filter(v => v != "").filter(v => v !== "Time:").map(v => parseInt(v));
  const distances = input[1].split(" ").filter(v => v != "").filter(v => v !== "Distance:").map(v => parseInt(v));

  let returner: Race[] = [];
  for (let i=0; i<times.length; i++) {
    returner.push(new Race(times[i], distances[i]));
  }
  return returner;
}

function parseMegaRace(input: string[]): Race {
  const t = parseInt(input[0].replace(/\D/g, ''));
  const d = parseInt(input[1].replace(/\D/g, ''));
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