import { ChangeEvent, useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import styles from '../components/Solver.module.css';

export default function Render() {

  const part1 = (input: string[]): number => {
    const games = input.map(l => new Game(l));
    setPart1(true);
    setGames(games);
    games.forEach(g => g.setValid(maxRed, maxGreen, maxBlue));
    return games.filter(g => g.isValid).map(g => g.gameNumber).reduce((acc, v) => acc + v);
  }

  const part2 = (input: string[]): number => {
    const games = input.map(l => new Game(l));
    setPart1(false);
    setGames(games);  
    return games.map(g => g.minR * g.minG * g.minB).reduce((acc, v) => acc + v);
  }

  const [isPart1, setPart1] = useState<boolean>(true);
  const [shownGames, setGames] = useState<Game[]>([]);
  const [maxRed, setMaxRed] = useState<number>(12);
  const [maxGreen, setMaxGreen] = useState<number>(13);
  const [maxBlue, setMaxBlue] = useState<number>(14);
  const handleRedChange = (event: ChangeEvent<HTMLInputElement>) => { setMaxRed(parseInt(event.target.value)); }
  const handleGreenChange = (event: ChangeEvent<HTMLInputElement>) => { setMaxGreen(parseInt(event.target.value)); }
  const handleBlueChange = (event: ChangeEvent<HTMLInputElement>) => { setMaxBlue(parseInt(event.target.value)); }
  const getLineLength = () : number => { return shownGames ? Math.max(...shownGames.map(g => g.str.length)) + (isPart1 ? 15 : 25) : 0; }
  
  return (
    <PageLayout pageTitle={"Day 02: Cube Conundrum"} >
      <div className={styles.row}>
        <div className={styles.label}>Limits:</div>
        <div className={styles.flexGrow}>
          <span className={styles.centeredRow}>
            <div>Red =&nbsp;</div>
            <input className={styles.inputField} value={maxRed} onChange={handleRedChange} type="number" />
            <div>Green =&nbsp;</div>
            <input className={styles.inputField} value={maxGreen} onChange={handleGreenChange} type="number" />
            <div>Blue =&nbsp;</div>
            <input className={styles.inputField} value={maxBlue} onChange={handleBlueChange} type="number" />
          </span>          
        </div>
      </div>
      <Solver part1={part1} part2={part2} testFile='Test02.txt'>
        <div>
          &nbsp;
          <b>{String("#").padEnd(3, '\u00A0')}</b>
          &nbsp;|&nbsp;
          { isPart1 ?
            <b>Valid&nbsp;</b>
            :
            <>
              <b>{String("R").padEnd(3, '\u00A0')}</b>
              &nbsp;|&nbsp;
              <b>{String("G").padEnd(3, '\u00A0')}</b>
              &nbsp;|&nbsp;
              <b>{String("B").padEnd(3, '\u00A0')}</b>
            </>
          }
          &nbsp;|&nbsp;
          <b>Contents</b> 
        </div>
        <div>{String("").padStart(getLineLength(), '-')}</div>
      { shownGames && shownGames.map((game, index) => (
        <div key={index}>
          &nbsp;
          {String(game.gameNumber).padEnd(3, '\u00A0')}
          &nbsp;|&nbsp;
          {
            isPart1 ?
            <>{
              game.isValid 
              ?
              <span style={{color: "green"}}>True&nbsp;&nbsp;</span>
              :
              <span style={{color: "red"}}>False&nbsp;</span>             
            }</>
            :
            <>
              {String(game.minR).padEnd(3, '\u00A0')}
              &nbsp;|&nbsp;
              {String(game.minG).padEnd(3, '\u00A0')}
              &nbsp;|&nbsp;
              {String(game.minB).padEnd(3, '\u00A0')}
            </>
          }
          &nbsp;|&nbsp;
          {game.str}
        </div>
      ))}
      </Solver>
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