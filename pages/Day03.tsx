import PageLayout from '../components/PageLayout';
import Solver, { SolverProps } from '../components/Solver';

export default function Render() {

  const part1 = (input: string): string => {
    return new Grid(input).evaluateAdjacentParts().toString();
  }

  const part2 = (input: string): string => {
    return new Grid(input).evaluateGears().toString();
  }

  const solverProps = new SolverProps(part1, part2);
  
  return (
    <PageLayout pageTitle={"Day 03: Gear Ratios"} >
      <Solver solverProps={solverProps} />
    </PageLayout>
  );
}

class Grid {

  symbols: Symbol[];
  numbers: Map<string, PartNumber>;
  width: number;
  height: number;

  constructor(input: string) {

    const lines = input.split("\n");
    this.height = lines.length;
    this.width = lines[0].length;

    this.symbols = [];
    this.numbers = new Map();

    let numberString = "";
    let numberStartX = 0;
    let isSavingNumber = false;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x <= this.width; x++) {
      
        let c = x < this.width ? (lines[y])[x] : ".";
        let isDigit = /^\d$/.test(c);

        if (isDigit) {

          numberString += c;

          if (!isSavingNumber) {
            isSavingNumber = true;
            numberStartX = x;
          }

        }
        else {

          if (isSavingNumber) {

            const value = parseInt(numberString);
            const num = new PartNumber(value);

            for (let i = numberStartX; i < x; i++) {
              const key = createKey(i, y);
              this.numbers.set(key, num);
            }
            
            isSavingNumber = false;
            numberString = "";
          }

          if (c == ".") { continue; }

          const symbol = new Symbol(x, y, c);
          this.symbols.push(symbol);

        }
      }
    }
  }

  evaluateAdjacentParts() : number {

    const set = new Set<PartNumber>();

    for (const symbol of this.symbols) {
      for (const adj of this.getAdjacentNumbers(symbol)) {
        set.add(adj);
      }
    }

    let sum = 0;
    for (const number of set) {
      sum += number.value;
    }

    return sum;
  }

  evaluateGears() : number {

    let sum = 0;
  
    for (const symbol of this.symbols) {

      if (symbol.c !== '*') { continue; }
      const adjs = this.getAdjacentNumbers(symbol);
      if (adjs.size !== 2) { continue; }
      const arr:PartNumber[] = [...adjs];
      const product = arr[0].value * arr[1].value;
      sum += product;
    }

    return sum;  
  }

  getAdjacentNumbers(symbol: Symbol) : Set<PartNumber> {

    const set = new Set<PartNumber>();

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const x = symbol.x + i;
        const y = symbol.y + j;
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) { continue; }
        const key = createKey(x, y);
        const number = this.numbers.get(key);
        if (number) { set.add(number); }
      }
    }

    return set;

  }

}



function createKey(x: number, y: number) {
  return `${x}_${y}`;
}

class Symbol {
  constructor(x: number, y:number, c:string) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  x: number;
  y: number;
  c: string;
}

class PartNumber {
  constructor(value: number) {
    this.value = value;
  }

  value: number;
}
