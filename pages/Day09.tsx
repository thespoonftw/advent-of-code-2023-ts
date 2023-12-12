import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';
import styles from '../components/Solver.module.css';

export default function Render() {

  const part1 = (input: string[]): number => {
    const oasises = input.map(l => new Oasis(l));
    const values = oasises.map(o => o.findNextValue());
    updateIndex(oasises.length);
    setOasises(oasises);
    setPart1(true);
    
    return values.reduce((acc, v) => acc + v, 0);
  }

  const part2 = (input: string[]): number => {
    const oasises = input.map(l => new Oasis(l));
    const values = oasises.map(o => o.findPreviousValue());
    updateIndex(oasises.length);
    setOasises(oasises);
    setPart1(false);
    return values.reduce((acc, v) => acc + v, 0);
  }

  const prev = () => {
    if (index <= 0) { return; }
    setIndex(index - 1);
  }

  const next = () => {
    const max = oasises ? oasises.length - 1 : 0;
    if (index >= max) { return; }
    setIndex(index + 1);
  }

  const updateIndex = (newLength: number) => {
    if (index >= newLength) { setIndex(0); }
  }

  const [oasises, setOasises] = useState<Oasis[] | null>(null)
  const [index, setIndex] = useState<number>(0);
  const [isPart1, setPart1] = useState<boolean>(true);
  
  return (
    <PageLayout pageTitle={"Day 09: Mirage Maintenance"} >
      <Solver part1={part1} part2={part2} testFile="Test09.txt" /> 
      <div className={styles.row}>
        <div className={styles.label}>Working:</div>
        <div>
          <button className={styles.button} onClick={prev} disabled={oasises === null}>Prev</button>
          <button className={styles.button} onClick={next} disabled={oasises === null}>Next</button>
          { oasises && <span>Oasis: {index+1} / {oasises.length}</span> }
        </div>
      </div>
      <div className={styles.row}>
      <div className={styles.label}></div>
        <div className={styles.working}>
          { oasises && RenderOasis(oasises[index]) }
        </div>
      </div>  
    </PageLayout>
  );

  function RenderOasis(oasis: Oasis) {

    const l1 = Math.max(...oasis.values[0]).toString().length;
    const l2 = Math.min(...oasis.values[0]).toString().length;
    const l = Math.max(l1, l2);
  
    return (
      <>
      { oasis.values.map((row, index2) => (
        <div key={index2}>
          { String("").padStart(index2 * l + 1, '\u00A0') }
          { row.map((value, index3) => (
            <span key={index3}>
              { 
                (isPart1 && index3 === row.length - 1) || (!isPart1 && index3 === 0)
                ?
                <b>{String(value).padStart(l, '\u00A0').padEnd(l * 2, '\u00A0')}</b>
                :
                String(value).padStart(l, '\u00A0').padEnd(l * 2, '\u00A0')
              }
            </span>
          ))}
        </div>
      ))}
      <br/>
      </>
    );
  }
}



class Oasis {

  values: number[][] = [];

  constructor(line: string) {

    const row0 = line.split(" ").map(v => parseInt(v));
    if (row0.length === 0) { throw new Error(); }
    this.values.push(row0);

    let row = this.values[0];

    while (true) {
      const nextRow = [];
      for (let i = 0; i < row.length - 1; i++) {
        nextRow.push(row[i + 1] - row[i]);
      }
  
      this.values.push(nextRow);
      row = nextRow;
      const sumOfRow = row.reduce((acc, value) => acc + value, 0);
      if (sumOfRow === 0) { break; }

    }

  }

  findNextValue(): number {
    const n = this.values.length;
    const lastRow = this.values[n - 1];
    lastRow.push(0);

    for (let i = n - 2; i >= 0; i--) {
      const r1 = this.values[i];
      const r2 = this.values[i+1];
      const n1 = r1[r1.length - 1];
      const n2 = r2[r2.length - 1];
      r1.push(n1 + n2);
    }

    const firstRow = this.values[0];
    return firstRow[firstRow.length - 1];
  }

  findPreviousValue(): number {
    const n = this.values.length;
    const lastRow = this.values[n - 1];
    lastRow.unshift(0);

    for (let i = n - 2; i >= 0; i--) {
      const r1 = this.values[i];
      const r2 = this.values[i+1];
      const n1 = r1[0];
      const n2 = r2[0];
      r1.unshift(n1 - n2);
    }

    return this.values[0][0];
  }

}