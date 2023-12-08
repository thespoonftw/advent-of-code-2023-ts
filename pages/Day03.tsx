import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const g = new Grid(input);
    const value = g.evaluateAdjacentParts();
    setGrid(g);
    return value;
  }

  const part2 = (input: string[]): number => {
    const g = new Grid(input);
    const value = g.evaluateGears();
    setGrid(g);
    return value;
  }

  const [grid, setGrid] = useState<Grid>(new Grid([]));
  const getFontSize = () : number => { return grid && grid.width > 20 ? 8 : 14; }
  
  return (
    <PageLayout pageTitle={"Day 03: Gear Ratios"} >
      <Solver part1={part1} part2={part2} testFile='Test03.txt' >
        {
          grid && <div style={{fontSize: getFontSize()}}>{
            Array.from({ length: grid.width }).map((_, y) => (
              <div key={y}>{
                Array.from({ length: grid.height }).map((_, x) => (
                  <span key={x}>{
                    grid.cells[x][y].isHighlighted ?
                    <span style={{color: "red", fontWeight: "bold"}}>{grid.cells[x][y].c}</span>
                    :
                    <span>{grid.cells[x][y].c}</span>
                  }</span>
                ))
              }</div>
            ))
          }</div>
        }
        <div></div>
      </Solver>
    </PageLayout>
  );
}

class Grid {

  symbols: Symbol[];
  width: number;
  height: number;
  cells: Cell[][];

  constructor(input: string[]) {

    this.height = input.length;
    this.width = this.height ? input[0].length : 0;
    this.symbols = [];
    let numberString = "";
    let numberStartX = 0;
    let isSavingNumber = false;
    this.cells = Array.from({ length: this.height }, () => Array.from({ length: this.width }, () => new Cell()));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x <= this.width; x++) {

        let c = ".";

        if (x < this.width) {
          c = (input[y])[x];
          this.cells[x][y].setChar(c);
        }

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
            const num = new PartNumber(numberStartX, y, value);

            for (let i = numberStartX; i < x; i++) {
              this.cells[i][y].setPartNumber(num);
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
      this.highlightSymbol(symbol);
      for (const adj of this.getAdjacentNumbers(symbol)) {
        this.highlightNumber(adj);
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
      this.highlightSymbol(symbol);
      const adjs = this.getAdjacentNumbers(symbol);
      if (adjs.size !== 2) { continue; }
      adjs.forEach(a => this.highlightNumber(a));
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
        const number = this.cells[x][y].partNumber;
        if (number) { set.add(number); }
      }
    }

    return set;

  }

  highlightNumber(number: PartNumber) {
    for (let i = number.x; i < number.x + number.value.toString().length; i++) {
      this.cells[i][number.y].isHighlighted = true;
    }
  }

  highlightSymbol(symbol: Symbol) {
    this.cells[symbol.x][symbol.y].isHighlighted = true;
  }

}

class Cell {
  c: string = ".";
  partNumber?: PartNumber;
  isHighlighted: boolean = false;

  setPartNumber(partNumber: PartNumber) {
    this.partNumber = partNumber;
  }

  setChar(c: string) {
    this.c = c;
  }
}

class Symbol {
  x: number;
  y: number;
  c: string;

  constructor(x: number, y:number, c:string) {
    this.x = x;
    this.y = y;
    this.c = c;
  }

  
}

class PartNumber {
  value: number;
  x: number;
  y: number;

  constructor(x: number, y: number, value: number) {
    this.x = x;
    this.y = y;
    this.value = value;
  }
}
