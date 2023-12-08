import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';

export default function Render() {

  const part1 = (input: string[]): number => {
    const cards = input.map(l => new Scratchcard(l));
    setScratchCards(cards);
    const totalScore = cards.reduce((acc, card) => acc + card.score, 0);
    return totalScore;
  }

  const part2 = (input: string[]): number => {
    let cards = input.map(l => new Scratchcard(l));
    setScratchCards(cards);
    return countWinMoreScratchCards(cards);
  }

  const [scratchCards, setScratchCards] = useState<Scratchcard[] | null>(null);
  const getScratchedLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].scratchNumbersStr.length + 2 : 10; }
  const getWinningLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].winningNumbersStr.length + 2 : 10; }
  
  return (
    <PageLayout pageTitle={"Day 04: Scratchcards"} >
      <Solver part1={part1} part2={part2} testFile='Test04.txt' >
        { scratchCards && <>
        <AHeader text="#" length={5}/>|
        <AHeader text="Wins" length={7}/>|
        <AHeader text="Score" length={7}/>|
        <AHeader text="Scratched" length={getScratchedLength()}/>|
        <AHeader text="Winning"/>
        <ADashedLine length={24 + getScratchedLength() + getWinningLength()} />
        {scratchCards.map((value, index) => (
          <div key={index} style={{position: "relative"}}>
            <HighlightRow offset={23} indexes={value.scratchIndexes} />
            <HighlightRow offset={24 + getScratchedLength()} indexes={value.winningIndexes} />
            <ACell text={value.id} length={5}/>|
            <ACell text={value.matches} length={7}/>|
            <ACell text={value.score} length={7}/>|
            <ACell text={value.scratchNumbersStr} />|
            <ACell text={value.winningNumbersStr} />
          </div>
        ))}
        </>}
      </Solver>
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
        <div key={index} style={{position: 'absolute'}}>
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

function countWinMoreScratchCards(cards: Scratchcard[]) : number {

  const l = cards.length;
  const ticketCounts = [];
  const maxMatches = 5;

  for (let i = 1; i <= l + maxMatches; i++) {
    ticketCounts[i] = 1;
  }

  let i = 0;
  for (let i = 1; i <= l; i++) {

    const matches = cards[i-1].matches;
    const ticketCount = ticketCounts[i];

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