import styles from '../styles/Home.module.css';
import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';
import WorkingBox from '../components/WorkingBox';

export default function Day01() { 

  const [values, setValues] = useState<CalibrationValue[]>([]);

  const part1 = (input: string): string => {
    const values = input.split('\n').map(s => new CalibrationValue(s, true));
    setValues(values);
    return getSumOfValues(values).toString();
  }
  
  const part2 = (input: string): string => {
    const values = input.split('\n').map(s => new CalibrationValue(s, false));
    setValues(values);
    return getSumOfValues(values).toString();
  }
  
  const solverProps = new SolverProps(part1, part2);

  return (
    <PageLayout pageTitle={"Day 01: Trebuchet?!"} >
      
      <Solver solverProps={solverProps} />

      <WorkingBox>
        {values && values.map((value, index) => (
            <div key={index}>
              <span style={{color: "gray"}}>{String(index).padStart(3, '0')}</span> {value.leftValue.digit}{value.rightValue.digit} {value.inputString}
            </div>
          ))
        }
      </WorkingBox>
      
    </PageLayout>
  );
}
  
const digits = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
]

const strings = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
]

class Highlight {

  startIndex: number;
  endIndex: number;
  digit: number;

  constructor(startIndex: number, endIndex: number, digit: number) {
    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.digit = digit;
  }

}

class CalibrationValue {

  inputString : string;
  leftValue: Highlight;
  rightValue: Highlight;

  constructor(inputString: string, isSimple: boolean) {
    this.inputString = inputString;
    this.leftValue = getHighlightInLine(inputString, isSimple, true);
    this.rightValue = getHighlightInLine(inputString, isSimple, false);
  }

  getValue() : number {
    return parseInt(this.leftValue.digit.toString() + this.rightValue.digit.toString());
  }

}

function getSumOfValues(values: CalibrationValue[]) : number {
  return values.reduce((acc, c) => acc + c.getValue(), 0);
}

const getHighlightInLine = (line: string, isSimple: boolean, isForward: boolean): Highlight => {

  let i = isForward ? 0 : line.length - 1;

  while (i >= 0 && i < line.length) {

    const c = line[i];

    for (let j = 0; j < 10; j++) {
      if (c === digits[j]) {
        return new Highlight(i, i, j);
      }
    }

    if (!isSimple) {
      for (let j = 0; j < 10; j++) {

        const toMatch = strings[j];
        const endIndex = i + toMatch.length;
        
        if (endIndex > line.length) { continue; }

        const substr = line.substring(i, endIndex);

        if (substr === toMatch) {
          return new Highlight(i, i + toMatch.length, j);
        }
      }
    }

    i += isForward ? 1 : -1;
  }

  throw new Error("No numbers found");
}