import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';
import WorkingBox from '../components/WorkingBox';

export default function Render() { 

  const [values, setValues] = useState<CalibrationValue[] | null>(null);

  const part1 = (input: string[]): number => {
    const values = input.map(s => new CalibrationValue(s, true));
    setValues(values);
    return getSumOfValues(values);
  }
  
  const part2 = (input: string[]): number => {
    const values = input.map(s => new CalibrationValue(s, false));
    setValues(values);
    return getSumOfValues(values);
  }

  return (
    <PageLayout pageTitle={"Day 01: Trebuchet?!"} >
      
      <Solver part1={part1} part2={part2} testFile="Test01.txt" />
      <WorkingBox>
        { values && <div>
          <AHeader text="Row" length={5}/>|
          <AHeader text="#" length={4}/>|
          <AHeader text="String"/>
          <ADashedLine length={72} />
          { values.map((value, index) => (
            <div key={index} style={{position: "relative"}}>
              <HighlightRow index={value.leftValue.index} length={value.leftValue.length} color='rgba(255, 0, 0, 0.25)' />
              <HighlightRow index={value.rightValue.index} length={value.rightValue.length} color='rgba(0, 0, 255, 0.25)' />
              <ACell text={index} length={5} />
              |&nbsp;
              <span style={{backgroundColor: "rgba(255, 0, 0, 0.25)"}}>{value.leftValue.digit}</span>
              <span style={{backgroundColor: "rgba(0, 0, 255, 0.25)"}}>{value.rightValue.digit}</span>
              &nbsp;|
              <ACell text={value.inputString} />
            </div>
          ))}
        </div>}
      </WorkingBox>
      
    </PageLayout>
  );
}

interface HighlightProps {
  index: number;
  length: number;
  color: string;
}

const HighlightRow: React.FC<HighlightProps> = ({ index, length, color }) => {
  const indexArray = Array.from({ length: index });
  const highlightArray = Array.from({ length: length });
  const myStyle = {color: 'rgba(0, 0, 0, 0)', backgroundColor: color};
  return (
    <div style={{position: 'absolute'}}>
      <span style={{color: "white"}}>____________{indexArray.map((_, index) => ( "_" ))}</span>
      <span style={{...myStyle}}>{highlightArray.map((_, index) => ( "_" ))}</span>
    </div>
  );
};
  
const digits = [
  "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
]

const strings = [
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
]

class Highlight {

  index: number;
  length: number;
  digit: number;

  constructor(index: number, length: number, digit: number) {
    this.index = index;
    this.length = length;
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
        return new Highlight(i, 1, j);
      }
    }

    if (!isSimple) {
      for (let j = 0; j < 10; j++) {

        const toMatch = strings[j];
        const endIndex = i + toMatch.length;
        
        if (endIndex > line.length) { continue; }

        const substr = line.substring(i, endIndex);

        if (substr === toMatch) {
          return new Highlight(i, toMatch.length, j);
        }
      }
    }

    i += isForward ? 1 : -1;
  }

  throw new Error("No numbers found");
}