import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';

export default function Day02() {

  const maxRed = 12;
  const maxGreen = 13;
  const maxBlue = 14;

  const part1 = (input: string): string => {
    return evaluateInput(input, false);
  }

  const part2 = (input: string): string => {
    return evaluateInput(input, true);
  }

  const solverProps = new SolverProps(part1, part2);

  const evaluateInput = (input: string, isPart2: boolean): string => {
    const lines: string[] = input.split('\n'); 
    const values: number[] = lines.map((line) => getLineScore(line, isPart2));
    const sum: number = values.reduce((acc, value) => acc + value, 0);
    return sum.toString();
  };

  const getLineScore = (line: string, isPart2: boolean): number => {
    const line_split = line.split(": ");
    const roundNumber = parseInt((line_split[0].split(" "))[1]);
    
    if (isPart2) {
      const minRGB = getMinimumRGB(line_split[1]);
      return minRGB[0] * minRGB[1] * minRGB[2];
    }
    else {
      const sets = line_split[1].split("; ");
      return sets.every(i => isSetValid(i)) ? roundNumber : 0;
    }
  }

  const getMinimumRGB = (line: string): number[] => {
    const map = new Map();
    map.set("red", 0);
    map.set("green", 0);
    map.set("blue", 0);

    const firstSplit = line.split(", ");
    const secondSplit = firstSplit.flatMap(item => item.split('; '));

    for (const s of secondSplit) {
      const split = s.split(' ');
      const value = parseInt(split[0]);
      const color = split[1];
      if (value > map.get(color)) {
        map.set(color, value);
      }
    }

    return [map.get("red"), map.get("green"), map.get("blue")];
  }

  const isSetValid = (set: string): boolean => {
    const split = set.split(", ");
    return split.every(i => isColourCountValid(i));;
  }

  const isColourCountValid = (s: string): boolean => {
    const split = s.split(" ");
    const count = parseInt(split[0]);
    let limit = 0;
    const colorString = split[1];
    if (colorString == "red") {
      limit = maxRed;
    } else if (colorString == "green") {
      limit = maxGreen;
    } else if (colorString == "blue") {
      limit = maxBlue;
    }
    return count <= limit;
  }
  
  return (
    <PageLayout pageTitle={"Day 02: Cube Conundrum"} >
      <Solver solverProps={solverProps} />
    </PageLayout>
  );
}