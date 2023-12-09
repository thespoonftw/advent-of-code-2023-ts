import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';
import WorkingBox from '../components/WorkingBox';

export default function Render() {

  const part1 = (input: string[]): number => {
    const cards = input.map(l => new Scratchcard(l));
    setScratchCards(cards);
    setIsPart1(true);
    return cards.reduce((acc, card) => acc + card.score, 0);
  }

  const part2 = (input: string[]): number => {
    let cards = input.map(l => new Scratchcard(l));
    setCounts(cards);
    setScratchCards(cards);
    setIsPart1(false);
    return cards.reduce((acc, card) => acc + card.count, 0);
  }

  const [scratchCards, setScratchCards] = useState<Scratchcard[] | null>(null);
  const [isPart1, setIsPart1] = useState<boolean>(true);
  const getScratchedLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].scratchNumbersStr.length + 2 : 10; }
  const getWinningLength = () : number => { return scratchCards && scratchCards.length > 0 ? scratchCards[0].winningNumbersStr.length + 2 : 10; }
  
  return (
    <PageLayout pageTitle={"Day 04: Scratchcards"} >
      <Solver part1={part1} part2={part2} testFile='Test04.txt' />
      <WorkingBox>
        { scratchCards && <>
        <AHeader text="#" length={5}/>|
        <AHeader text="Wins" length={7}/>|
        { isPart1 ? <AHeader text="Score" length={10}/> : <AHeader text="Count" length={10}/>}|
        <AHeader text="Scratched" length={getScratchedLength()}/>|
        <AHeader text="Winning"/>
        <ADashedLine length={24 + getScratchedLength() + getWinningLength()} />
        { scratchCards.map((value, index) => (
          <div key={index} style={{position: "relative"}}>
            <ACell text={value.id} length={5}/>|
            <ACell text={value.matches} length={7}/>|
            { isPart1 ? <ACell text={value.score} length={10}/> : <ACell text={value.count} length={10}/>}|
            <span>
              { value.scratchValues.map((value2, index) => (<>{
                <>&nbsp;<span style={{backgroundColor: value.scratchIndexes.includes(index) ? "#9f9" : "#fff"}}>{String(value2).padStart(2, '\u00A0')}</span></>
              }</>))}
            </span>&nbsp;|
            <span>
              { value.winningValues.map((value2, index) => (
                <>&nbsp;<span style={{backgroundColor: value.winningIndexes.includes(index) ? "#9f9" : "#fff"}}>{String(value2).padStart(2, '\u00A0')}</span></>
              ))}
            </span>&nbsp;
          </div>
        ))}
        </>}
      </WorkingBox>
    </PageLayout>
  );
}

class Scratchcard {

  id: number;
  winningValues: number[];
  scratchValues: number[];
  matches: number = 0;
  score: number;
  count: number = 1;
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

function setCounts(cards: Scratchcard[]) {

  for (let i = 0; i < cards.length; i++) {

    const matches = cards[i].matches;
    const ticketCount = cards[i].count;
    const max = Math.min(i + matches, cards.length);

    for (let j = i + 1; j <= max; j++) {
      cards[j].count += ticketCount;
    }
  }
}