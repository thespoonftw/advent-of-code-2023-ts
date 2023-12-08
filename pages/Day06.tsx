import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import Day6Sim from '../components/Day6Sim';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';

export default function Render() {

  const part1 = (input: string[]): number => {
    const races = parseRaces(input);
    setRaces(races);
    let product = 1;
    for (const race of races) {
      product *= race.winRange;
    }
    return product;
  }

  const part2 = (input: string[]): number => {
    const race = parseMegaRace(input);
    setRaces([race]);
    return race.winRange;
  }

  const [races, setRaces] = useState<Race[] | null>(null);
  
  return (
    <PageLayout pageTitle={"Day 06: Wait For It"} >
      <Day6Sim/>
      <Solver part1={part1} part2={part2} testFile='Test06.txt' >
        { races && <>
          <AHeader text="#" length={6}/>|
          <AHeader text="Time" length={12}/>|
          <AHeader text="Dist" length={12}/>|
          <AHeader text="Min" length={12}/>|
          <AHeader text="Max" length={12}/>|
          <AHeader text="Range" length={12}/>
          <ADashedLine length={72} />
          {races && races.map((value, index) => (
            <div key={index}>
              <ACell text={index} length={6}/>|
              <ACell text={value.time} length={12}/>|
              <ACell text={value.distance} length={12}/>|
              <ACell text={value.lower} length={12}/>|
              <ACell text={value.upper} length={12}/>|
              <ACell text={value.winRange}/>
            </div>
          ))}
        </>}
      </Solver>      
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