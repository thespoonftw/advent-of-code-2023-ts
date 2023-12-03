import { useState } from "react";
import styles from './Solver.module.css';

export class SolverProps {

  constructor(solvePart1: (text: string) => string, solvePart2: (text: string) => string) {
    this.solvePart1 = solvePart1;
    this.solvePart2 = solvePart2;
  }

  solvePart1: (text: string) => string;
  solvePart2: (text: string) => string;
}

export default function Solver({ solverProps }: {solverProps: SolverProps}) {

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('-');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handlePart1Click = () => {
    setResult(solverProps.solvePart1(inputText));
  };

  const handlePart2Click = () => {
    setResult(solverProps.solvePart2(inputText));
  };
  
  return (
    <div>

      <div className={styles.row}>
        <div className={styles.label}>Input:</div>
        <textarea className={styles.input} value={inputText} onChange={handleInputChange}></textarea>
      </div>

      <div className={styles.row}>
        <div className={styles.label}>Run: </div>
        <button className={styles.button} onClick={handlePart1Click}>Part 1</button>
        <button className={styles.button} onClick={handlePart2Click}>Part 2</button>
      </div>

      <div className={styles.row}>
        <div className={styles.label}>Result:</div>
        <div className={styles.result}>{result}</div>
      </div>

        
    </div>
  );
}
