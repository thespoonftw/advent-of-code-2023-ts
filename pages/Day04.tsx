import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';

export default function Render() {

  const part1 = (input: string): string => {
    return scoreBasicScratchCards(input).toString();
  }

  const part2 = (input: string): string => {
    return countWinMoreScratchCards(input).toString();
  }

  const solverProps = new SolverProps(part1, part2);
  
  return (
    <PageLayout pageTitle={"Day 04: Scratchcards"} >
      <Solver solverProps={solverProps} />
    </PageLayout>
  );
}

class Scratchcard {

  winningValues: number[];
  scratchValues: number[];

  constructor(input: string) {
    const split1 = input.split(": ");
    const split2 = split1[1].split(" | ");

    this.winningValues = split2[0].split(" ").filter(v => v != "").map(s => parseInt(s));
    this.scratchValues = split2[1].split(" ").filter(v => v != "").map(s => parseInt(s));
  }

  getNumberOfMatches() : number {
    return this.scratchValues.filter(v => this.winningValues.includes(v)).length;
  }

  getSingleScore() : number {
    const l = this.getNumberOfMatches();
    return l> 0 ? Math.pow(2, l - 1) : 0;
  }
}

function scoreBasicScratchCards(input: string) : number {
  const lines = input.split("\n");
  const scores: number[] = lines.map((line) => new Scratchcard(line).getSingleScore());
  return scores.reduce((acc, value) => acc + value, 0);
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
    const matches = new Scratchcard(line).getNumberOfMatches();

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