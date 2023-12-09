import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';
import WorkingBox from '../components/WorkingBox';

export default function Render() {

  const part1 = (input: string[]): number => {
    const cards = getSortedCards(input, false);
    setCards(cards);
    return calculateTotalBid(cards);
  }

  const part2 = (input: string[]): number => {
    const cards = getSortedCards(input, true);
    setCards(cards);
    return calculateTotalBid(cards);
  }

  const [shownCards, setCards] = useState<CamelCard[] | null>(null);
  
  return (
    <PageLayout pageTitle={"Day 07: Camel Cards"} >
      <Solver part1={part1} part2={part2} testFile='Test07.txt' />
      <WorkingBox>
        { shownCards && <>
          <div>
            <AHeader text="Rank" length={6} />|
            <AHeader text="Hand" length={7} />|
            <AHeader text="Bid" length={5} />|
            <AHeader text="Level" />
            <ADashedLine length={40} />
            {shownCards && shownCards.map((value, index) => (
              <div key={index}>
                <ACell text={shownCards.length - index} length={6}/>|
                <ACell text={value.str} length={7}/>|
                <ACell text={value.bid} length={5}/>|
                <ACell text={value.level} />
              </div>
            ))}
          </div>
        </>}
      </WorkingBox>      
    </PageLayout>
  );
}

function getSortedCards(input: string[], useJokers: boolean) : CamelCard[] {
    const cards = input.map(l => new CamelCard(l, useJokers));
    cards.sort((a, b) => a.compare(b));
    return cards;
}

function calculateTotalBid(cards: CamelCard[]) : number {
  let sum = 0;
  let i = cards.length;
  for (const card of cards) {
    sum += card.bid * i;
    i--;
  }
  return sum;
}

const simpleRanks = [ "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A" ];
const advRanks = [ "J", "2", "3", "4", "5", "6", "7", "8", "9", "T", "Q", "K", "A" ];
const handLevel = { "Five of Kind": 6, "Four of a Kind": 5, "Full House": 4, "Three of a Kind": 3, "Two Pair": 2, "One Pair": 1, "High Card": 0 } as const; 
type HandLevel = keyof typeof handLevel;

class CamelCard {

  str: string;
  cards: number[];
  bid: number;
  level: HandLevel;
  useJokers: boolean;

  constructor(line: string, useJokers: boolean) {

    const split = line.split(" ");
    this.str = split[0];
    this.bid = parseInt(split[1]);
    this.useJokers = useJokers;

    this.cards = [];
    for (let i=0; i<5; i++) {
      const card = line[i];
      const value = this.useJokers ? advRanks.indexOf(card) : simpleRanks.indexOf(card);
      this.cards.push(value);
    }
    this.level = this.getLevel();

  }

  getLevel() : HandLevel {

    const frequencyMap: { [key: number]: number } = {};
    for (const num of this.cards) {
      frequencyMap[num] = (frequencyMap[num] || 0) + 1;
    }

    let jokerCount = 0;
    if (this.useJokers && frequencyMap[0]) {
      jokerCount = frequencyMap[0];
      frequencyMap[0] = 0;
    }

    const frequencies = Object.values(frequencyMap);
    frequencies.sort((a, b) => b - a);
    const freq1 = frequencies[0];
    const freq2 = frequencies[1];

    if (freq1 + jokerCount === 5) {
      return "Five of Kind";
    } else if (freq1 + jokerCount === 4) {
      return "Four of a Kind";
    } else if (freq1 + jokerCount === 3 && freq2 === 2) {
      return "Full House";
    } else if (freq1 + jokerCount === 3) {
      return "Three of a Kind";
    } else if (freq1 === 2 && freq2 + jokerCount === 2) {
      return "Two Pair";
    } else if (freq1 + jokerCount === 2) {
      return "One Pair";
    } else {
      return "High Card";
    }    
  }

  compare(other: CamelCard) : number {
    if (this.level !== other.level) {
      return handLevel[other.level] - handLevel[this.level];
    }
    for (let i = 0; i < 5; i++) {
      const o = other.cards[i];
      const t = this.cards[i];
      if (o !== t) {
        return o - t;
      }
    }
    return 0;
  }
}

