import styles from '../styles/Home.module.css';
import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';

export default function Day01() {

  const [lineValues, setLineValues] = useState<number[]>([]);
  
  const digits = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
  ]

  const strings = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
  ]

  const part1 = (input: string): string => {
    return evaluateInput(input, false);
  }

  const part2 = (input: string): string => {
    return evaluateInput(input, true);
  }

  const solverProps = new SolverProps(part1, part2);

  const evaluateInput = (input: string, isPart2: boolean): string => {
    const lines: string[] = input.split('\n'); 
    const values: number[] = lines.map((line) => evaluateLine(line, isPart2));
    setLineValues(values);
    const sum: number = values.reduce((acc, value) => acc + value, 0);
    return sum.toString();
  };

  const evaluateLine = (line: string, isPart2: boolean): number => {
    const a = getValueInLine(line, isPart2, true);
    const b = getValueInLine(line, isPart2, false);
    return parseInt(a.toString() + b.toString());
  }

  const getValueInLine = (line: string, isPart2: boolean, isForward: boolean): number => {

    let i = isForward ? 0 : line.length - 1;

    while (i >= 0 && i < line.length) {

      const c = line[i];

      for (let j = 0; j < 10; j++) {
        if (c === digits[j]) {
          return j;
        }
      }

      if (isPart2) {
        for (let j = 0; j < 10; j++) {

          const toMatch = strings[j];
          const endIndex = i + toMatch.length;
          
          if (endIndex > line.length) { continue; }

          const substr = line.substring(i, endIndex);

          if (substr === toMatch) {
            return j;
          }
        }
      }

      i += isForward ? 1 : -1;
    }

    throw new Error("No numbers found");
  }
  
  return (
    <PageLayout pageTitle={"Day 01: Trebuchet?!"} >
      
      <Solver solverProps={solverProps} />



      <p className={styles.description}>Working:</p>

      {lineValues && (
          <div>
            {lineValues.map(value => value.toString()).join(' + ')}
          </div>
      )}

    </PageLayout>
  );
}