import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';
import WorkingBox from '../components/WorkingBox';

export default function Render() {

  const part1 = (input: string): string => {
    const cards = input.split("\n").map(l => new Scratchcard(l));
    setScratchCards(cards);
    console.log(cards);
    const totalScore = cards.reduce((acc, card) => acc + card.score, 0);
    return totalScore.toString();
  }

  const part2 = (input: string): string => {
    let cards = input.split("\n").map(l => new Scratchcard(l));
    setScratchCards(cards);
    return countWinMoreScratchCards(input).toString();
  }

  const solverProps = new SolverProps(part1, part2, "Test04.txt");
  const [scratchCards, setScratchCards] = useState<Scratchcard[]>([]);
  const getScratchedLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].scratchNumbersStr.length : 10; }
  const getWinningLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].winningNumbersStr.length : 10; }
  
  return (
    <PageLayout pageTitle={"Day 04: Scratchcards"} >
      <Solver solverProps={solverProps} />
      <WorkingBox>
        { scratchCards && <>
        <div>
          &nbsp;
          <b>#</b>
          &nbsp;&nbsp;&nbsp;|&nbsp; 
          <b>Wins</b>
          &nbsp;|&nbsp;
          <b>Score</b>
          &nbsp;|&nbsp;
          <b>{String("Scratched").padEnd(getScratchedLength(), '\u00A0')}</b>
          &nbsp;|&nbsp;
          <b>{String("Winning").padEnd(getWinningLength(), '\u00A0')}</b> 
        </div>
        <div>{String("").padStart(26 + getScratchedLength() + getWinningLength(), '-')}</div>
        {scratchCards.map((value, index) => (
            <div key={index} style={{position: "relative"}}>
              <HighlightRow offset={22} indexes={value.scratchIndexes} />
              <HighlightRow offset={25 + getScratchedLength()} indexes={value.winningIndexes} />
              &nbsp;
              {String(value.id).padEnd(3, '\u00A0')}
              &nbsp;|&nbsp;
              {String(value.matches).padEnd(4, '\u00A0')}
              &nbsp;|&nbsp;
              {String(value.score).padEnd(5, '\u00A0')}
              &nbsp;|&nbsp;
              {value.scratchNumbersStr}
              &nbsp;|&nbsp;
              {value.winningNumbersStr}
            </div>
          ))
        }
        </>}
      </WorkingBox>
    </PageLayout>
  );
}

interface HighlightProps {
  offset: number;
  indexes: number[];
}

const HighlightRow: React.FC<HighlightProps> = ({ offset, indexes }) => {
  return (
    <>
      { indexes.map((value, index) => ( 
        <div style={{position: 'absolute'}}>
          {String("").padEnd(offset, '\u00A0')}
          {String("").padEnd(value * 3, '\u00A0')}
          <span style={{backgroundColor: "rgba(0, 255, 0, 0.25)"}}>&nbsp;&nbsp;</span>
        </div>
      ))}
    </>
  );
};

class Scratchcard {

  id: number;
  winningValues: number[];
  scratchValues: number[];
  matches: number = 0;
  score: number;
  scratchNumbersStr: string;
  winningNumbersStr: string;
  scratchIndexes: number[] = [];
  winningIndexes: number[] = [];

  constructor(input: string) {
    
    const split1 = input.split(": ");
    const split2 = split1[1].split(" | ");
    const split3 = split1[0].split(" ").filter(s => s !== "");

    this.id = parseInt(split3[1]);
    this.scratchValues = split2[0].split(" ").filter(v => v != "").map(s => parseInt(s));
    this.winningValues = split2[1].split(" ").filter(v => v != "").map(s => parseInt(s));
    this.scratchNumbersStr = split2[0];
    this.winningNumbersStr = split2[1];

    for (let i = 0; i < this.scratchValues.length; i++) {
      for (let j = 0; j < this.winningValues.length; j++) {
        if (this.scratchValues[i] === this.winningValues[j]) {
          this.matches++;
          this.scratchIndexes.push(i);
          this.winningIndexes.push(j);
        }
      }
    }
    this.score = this.matches > 0 ? Math.pow(2, this.matches - 1) : 0;
  }
}

function countWinMoreScratchCards(input: string) : number {

  const lines = input.split("\n");
  const l = lines.length;
  const ticketCounts = [];
  const maxMatches = 5;

  for (let i = 1; i <= l + maxMatches; i++) {
    ticketCounts[i] = 1;
  }

  let i = 0;
  for (let i = 1; i <= l; i++) {

    const line = lines[i-1];
    const ticketCount = ticketCounts[i];
    const matches = new Scratchcard(line).matches;

    for (let j = i + 1; j <= i + matches; j++) {
      ticketCounts[j] += ticketCount;
    }
  }

  let sum = 0;
  for (let i = 1; i <= l; i++) {
    sum += ticketCounts[i];
  }
  return sum;
}