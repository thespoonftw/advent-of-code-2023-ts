import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';

export default function Day04() {

  const part1 = (input: string): string => {
    const seeds = getSeeds(input);
    const almanac = new Almanac(input);
    return almanac.getLowestLocation(seeds).toString();
  }

  const part2 = (input: string): string => {
    const seedRanges = getSeedRanges(input);
    const almanac = new Almanac(input);
    return almanac.getLowestLocation(seedRanges).toString();
  }

  const solverProps = new SolverProps(part1, part2);
  
  return (
    <PageLayout pageTitle={"Day 05: If You Give A Seed A Fertilizer"} >
      <Solver solverProps={solverProps} />
    </PageLayout>
  );
}

function getSeeds(input: string) : Range[] {
  return input.split("\n")[0].split(" ").slice(1).map(s => parseInt(s)).map(i => new Range(i, i+1));
}

function getSeedRanges(input: string) : Range[] {
  const seeds = input.split("\n")[0].split(" ").slice(1).map(s => parseInt(s));
  const seedRanges:Range[] = [];
  for (let i = 0; i < seeds.length; i += 2) {
    seedRanges.push(new Range(seeds[i], seeds[i]+seeds[i + 1]));
  }
  return seedRanges;
}

class Almanac {
  mappers: Mapper[];

  constructor(input: string) {
    const lines = input.split("\n");
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

  getLowestLocation(seedRanges: Range[]) : number {
    let locationRanges = this.processSeedData(seedRanges);
    return Math.min(...locationRanges.map(m => m.min));
  }


}

class Mapper {
  filters: Filter[]

  constructor(lines: string[]) {
    this.filters = lines.map(l => new Filter(l));
    this.filters.sort((a, b) => a.min - b.min);
  }

  mapRanges(ranges: Range[]) : Range[] {

    ranges.sort((a, b) => a.min - b.min);
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

