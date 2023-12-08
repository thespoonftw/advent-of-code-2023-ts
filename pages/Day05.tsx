import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const seedIds = getSeeds(input[0]);
    return findLowestLocation(input, seedIds);
  }

  const part2 = (input: string[]): number => {
    const seedRanges = getSeedRanges(input[0]);
    return findLowestLocation(input, seedRanges);
  }

  const findLowestLocation = (input: string[], inputSeeds: Range[]): number => {
    const almanac = new Almanac(input);
    const locations = almanac.processSeedData(inputSeeds);
    const histories = locations.map(l => almanac.findSeedHistory(l));
    setSeeds(histories);
    return Math.min(...locations.map(l => l.min));
  }

  const [seeds, setSeeds] = useState<SeedHistory[]>([]);
  const columnWidth = () : number => { return seeds.length > 0 ? Math.max(6, Math.max(...seeds.map(s => s.values[0])).toString().length) : 0; }
  const columnNames = [ "Seed", "Soil", "Fert.", "Water", "Light", "Temp.", "Humid.", "Loc." ];

  return (
    <PageLayout pageTitle={"Day 05: If You Give A Seed A Fertilizer"} >
      <Solver part1={part1} part2={part2} testFile='Test05.txt' >
        { seeds && <>
          <div>
            &nbsp;
            { columnNames.map((title, index) => (
              <span key={index}>
                <b>{String(title).padEnd(columnWidth(), '\u00A0')}</b>
                {index < columnNames.length - 1 && <>&nbsp;|&nbsp;</>}
              </span>
            ))}
          </div>
          <div>{String("").padStart((columnWidth() + 3) * 8, '-')}</div>
          <div>
            {
              seeds.map((seed, index) => (
                <div key={index}>
                  &nbsp;
                  {
                    seed.values.map((value, index2) => (
                      <span key={index2}>
                        {String(value).padEnd(columnWidth(), '\u00A0')}
                        {index2 < seed.values.length - 1 && <>&nbsp;|&nbsp;</>}
                      </span>                    
                    ))
                  }
                </div>
              ))
            }
          </div>
        </> }
      </Solver>
    </PageLayout>
  );
}

function getSeeds(input: string) : Range[] {
  return input.split(" ").slice(1).map(s => parseInt(s)).map(i => new Range(i, i+1));
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

  processSeedData(seedRanges: Range[]) : Range[] {
    let mapped = seedRanges;    
    for (const mapper of this.mappers) {
      mapped = mapper.mapRanges(mapped);
    }
    return mapped;
  }

  findSeedHistory(location: Range): SeedHistory {

    let currentValue = location.min;
    const arr = [];
    arr.push(currentValue);

    for (let i=this.mappers.length-1; i >=0; i--) {
      const mapper = this.mappers[i];
      currentValue = mapper.reverseMap(currentValue);
      arr.push(currentValue);
    }

    return new SeedHistory(arr.reverse());
  }
}

class Mapper {
  filters: Filter[]

  constructor(lines: string[]) {
    this.filters = lines.map(l => new Filter(l));
    this.filters.sort((a, b) => a.min - b.min);
  }

  reverseMap(value: number) : number {
    for (const filter of this.filters) {
      if (value >= filter.min + filter.translator && value <= filter.max + filter.translator) {
        return value - filter.translator;
      }
    }
    return value;
  }

  mapRanges(ranges: Range[]) : Range[] {

    let i = 0;
    let j = 0;
    let current = ranges[0];
    let returner:Range[] = [];

    while (i < ranges.length) {

      // no more filters left
      if (j >= this.filters.length) {
        returner.push(new Range(current.min, current.max));
        i++;
        current = ranges[i];
        continue;
      }

      let filter = this.filters[j];
      let t = filter.translator;

      // filter is behind current, switch to next filter
      if (filter.max <= current.min) {
        j++;
      }
      // current is behind filter, save and move to next
      else if (filter.min >= current.max) {
        returner.push(new Range(current.min, current.max));
        i++;
        current = ranges[i];
      }
      // current is contained wholly by filter, save and move to next
      else if (filter.min <= current.min && filter.max >= current.max) {
        returner.push(new Range(current.min + t, current.max + t))
        i++;
        current = ranges[i];
      }
      // filter is contained wholly by current, save in parts
      else if (current.min < filter.min && current.max > filter.max) {
        returner.push(new Range(current.min, filter.min));
        returner.push(new Range(filter.min + t, filter.max + t));
        current = new Range(filter.max, current.max);
      }
      // lower edge of current is in filter
      else if (filter.min <= current.min && filter.max < current.max) {
        returner.push(new Range(current.min + t, filter.max + t));
        current = new Range(filter.max, current.max);
      }
      // right edge of current is in filter
      else if (filter.min > current.min && filter.max >= current.max) {
        returner.push(new Range(current.min, filter.min));
        returner.push(new Range(filter.min + t, current.max + t));
        i++;
        current = ranges[i];
      }
    }

    returner.sort((a, b) => a.min - b.min);
    return returner;    
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

class SeedHistory {
  values: number[];

  constructor(values: number[]) {
    this.values = values;
  }
}

