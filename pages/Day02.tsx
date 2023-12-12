import { ChangeEvent, useState } from 'react';
import PageLayout from '../components/PageLayout';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';
import Solver, { InputRow, NumberInput, Row, WorkingBox } from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const games = input.map(l => new Game(l));
    setPart(1);
    setGames(games);
    games.forEach(g => g.setValid(maxRed, maxGreen, maxBlue));
    return games.filter(g => g.isValid).map(g => g.gameNumber).reduce((acc, v) => acc + v);
  }

  const part2 = (input: string[]): number => {
    const games = input.map(l => new Game(l));
    setPart(2);
    setGames(games);  
    return games.map(g => g.minR * g.minG * g.minB).reduce((acc, v) => acc + v);
  }

  const [part, setPart] = useState<number | null>(null);
  const [shownGames, setGames] = useState<Game[]>([]);
  const [maxRed, setMaxRed] = useState<number>(12);
  const [maxGreen, setMaxGreen] = useState<number>(13);
  const [maxBlue, setMaxBlue] = useState<number>(14);
  const getLineLength = () : number => { return shownGames ? Math.max(...shownGames.map(g => g.str.length)) + (part === 1 ? 15 : 25) : 0; }
  
  return (
    <PageLayout pageTitle={"Day 02: Cube Conundrum"} >
      
      <InputRow label="Limits:">
        <NumberInput label="Red" set={setMaxRed} value={maxRed} />
        <NumberInput label="Green" set={setMaxGreen} value={maxGreen} />
        <NumberInput label="Blue" set={setMaxBlue} value={maxBlue} />
      </InputRow>

      <Solver part1={part1} part2={part2} testFile="Test02.txt" />
      <WorkingBox>
        { part && <>
        <div>
          <AHeader text="#" length={5}/>|
          { part === 1 &&
            <><AHeader text="Valid" length={8}/>|</>
          }
          {
            part === 2 &&
            <>
              <AHeader text="R" length={5}/>|
              <AHeader text="G" length={5}/>|
              <AHeader text="B" length={5}/>|
            </>
          }
          <AHeader text="Contents"/>
        </div>
        <ADashedLine length={getLineLength()} />
        { shownGames && shownGames.map((game, index) => (
          <div key={index}>
            <ACell text={game.gameNumber} length={5}/>|
            {
              part === 1 &&
              <>{
                game.isValid 
                ?
                <span style={{color: "green"}}><ACell text="True" length={8} /></span>
                :
                <span style={{color: "red"}}><ACell text="False" length={8} /></span>            
              }|</>
            }
            {
              part === 2 &&
              <>
                <ACell text={game.minR} length={5}/>|
                <ACell text={game.minG} length={5}/>|
                <ACell text={game.minB} length={5}/>|
              </>
            }
            <ACell text={game.str}/>
          </div>
        ))}
      </>}
      </WorkingBox>
    </PageLayout>
  );
}

class Game {

  str: string;
  gameNumber: number;
  isValid: boolean = true;
  minR: number = 0;
  minG: number = 0;
  minB: number = 0;
  hands: Hand[];

  constructor(str: string) {
    const split1 = str.split(": ");
    const split2 = split1[0].split(" ");
    this.str = split1[1];
    this.gameNumber = parseInt(split2[1]);

    this.hands = split1[1].split("; ").map(s => new Hand(s));

    const map: { [key: string]: number } = {};
    map["red"] = 0;
    map["green"] = 0;
    map["blue"] = 0;
    for (const hand of this.hands) {
      for (const set of hand.sets) {
        if (set.value > map[set.type]) {
          map[set.type] = set.value;
        }
      }
    }
    this.minR = map["red"];
    this.minG = map["green"];
    this.minB = map["blue"];

  }

  setValid(maxR: number, maxG: number, maxB: number) {
    this.isValid = this.hands.every(h => h.sets.every(s => s.isValid(maxR, maxG, maxB)))
  }

}

class Hand {
  sets: Set[];

  constructor(str: string) {
    this.sets = str.split(", ").map(s => new Set(s));
  }
}

class Set {

  value: number;
  type: string;

  constructor(str: string) {
    const split = str.split(" ");
    this.value = parseInt(split[0]);
    this.type = split[1];
  }

  isValid(maxR: number, maxG: number, maxB: number) {
    const r = this.type === "red" && this.value <= maxR;
    const g = this.type === "green" && this.value <= maxG;
    const b = this.type === "blue" && this.value <= maxB;
    return r || g || b;
  }
}