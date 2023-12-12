import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';

export default function Render() {

  const part1 = (input: string[]): number => {
    const seedIds = input[0].split(" ").slice(1).map(s => parseInt(s));;
    const almanac = new Almanac(input);
    const seeds = seedIds.map(id => almanac.getSeed(id));
    setSeeds(seeds);
    return Math.min(...seeds.map(s => s.values[7]));
  }

  const part2 = (input: string[]): number => {
    const seedRanges = getSeedRanges(input[0]);
    const almanac = new Almanac(input);
    const seedId = findMinimumSeed(seedRanges, almanac);
    const seed = almanac.getSeed(seedId);
    setSeeds([seed]);
    return seed.values[7];
  }

  const [seeds, setSeeds] = useState<Seed[] | null>(null);
  const columnWidth = () : number => { return seeds ? Math.max(8, Math.max(...seeds.map(s => s.values[0])).toString().length + 2) : 0; }
  const columnNames = [ "Seed", "Soil", "Fert.", "Water", "Light", "Temp.", "Humid.", "Loc." ];

  return (
    <PageLayout pageTitle={"Day 05: If You Give A Seed A Fertilizer"} >
      <Solver part1={part1} part2={part2} testFile="Test05.txt" />
      <WorkingBox>
        { seeds && <>
          <div>
            { columnNames.map((title, index) => (
              <span key={index}>
                <AHeader text={title} length={columnWidth()}/>
                {index < columnNames.length - 1 && <>|</>}
              </span>
            ))}
          </div>
          <div>{String("").padStart((columnWidth() + 1) * 8, '-')}</div>
          <div>
            {
              seeds.map((seed, index) => (
                <div key={index}>
                  {
                    seed.values.map((value, index2) => (
                      <span key={index2}>
                        <ACell text={value} length={columnWidth()}/>
                        {index2 < seed.values.length - 1 && <>|</>}
                      </span>                    
                    ))
                  }
                </div>
              ))
            }
          </div>
        </> }
      </WorkingBox>
    </PageLayout>
  );
}

function getSeedRanges(input: string) : Range[] {
  const seeds = input.split(" ").slice(1).map(s => parseInt(s));
  const seedRanges:Range[] = [];
  for (let i = 0; i < seeds.length; i += 2) {
    seedRanges.push(new Range(seeds[i], seeds[i]+seeds[i + 1]));
  }
  seedRanges.sort((a, b) => a.min - b.min);
  return seedRanges;
}

function findMinimumSeed(seedRanges: Range[], almanac: Almanac) : number {

  const timeout = 100_000_000;
  let i = 0; 

  while (i < timeout) {
    i++;
    const seedId = almanac.getSeedIdFromLocation(i);
    for (const range of seedRanges) {
      if (seedId >= range.min && seedId < range.max) {
        return seedId;
      }
    }
  }

  return 0;
}

class Almanac {
  mappers: Mapper[];

  constructor(lines: string[]) {
    this.mappers = [];

    let startOfMapLine = 1;
    for (let i = 2; i < lines.length; i++) {
      if (lines[i] === "" || i === lines.length - 1) {
        const linesForMap = lines.slice(startOfMapLine + 2, i)
        const newMapper = new Mapper(linesForMap);
        this.mappers.push(newMapper);
        startOfMapLine = i;
      }
    }
  }

  getSeed(seedId: number) : Seed {
    let currentValue = seedId  
    const arr = [currentValue];
    for (const mapper of this.mappers) {
      currentValue = mapper.map(currentValue);
      arr.push(currentValue);
    }
    return new Seed(arr);
  }

  getSeedIdFromLocation(locationId: number) : number {
    let currentValue = locationId;
    for (let i = this.mappers.length - 1; i >= 0; i--) {
      currentValue = this.mappers[i].reverseMap(currentValue);
    }
    return currentValue;
  }
}

class Mapper {
  filters: Filter[]

  constructor(lines: string[]) {
    this.filters = lines.map(l => new Filter(l));
    this.filters.sort((a, b) => a.min - b.min);
  }

  map(value: number) : number {
    for (const filter of this.filters) {
      if (value >= filter.min && value < filter.max) {
        return value + filter.translator;
      }
    }
    return value;
  }

  reverseMap(value: number) : number {
    for (const filter of this.filters) {
      if (value >= filter.min + filter.translator && value < filter.max + filter.translator) {
        return value - filter.translator;
      }
    }
    return value;
  }
}

class Filter {
  min: number;
  max: number;
  translator: number;

  constructor(line: string) {
    const split = line.split(" ");
    const destinationStart = parseInt(split[0]);
    const sourceStart = parseInt(split[1]);
    const range = parseInt(split[2]);

    this.min = sourceStart;
    this.max = sourceStart + range;
    this.translator = destinationStart - sourceStart;
  }
}

class Range {
  min: number;
  max: number;

  constructor(min: number, max: number) {
    this.min = min;
    this.max = max;
  }
}

class Seed {
  values: number[];

  constructor(values: number[]) {
    this.values = values;
  }
}

