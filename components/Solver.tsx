import { useState, useEffect } from "react";
import styles from './Solver.module.css';

export class SolverProps {

  solvePart1: (text: string) => string;
  solvePart2: (text: string) => string;
  testDataFileName?: string;

  constructor(solvePart1: (text: string) => string, solvePart2: (text: string) => string, testDataFileName?: string) {
    this.solvePart1 = solvePart1;
    this.solvePart2 = solvePart2;
    this.testDataFileName = testDataFileName;
  }

}
  

export default function Solver({ solverProps }: {solverProps: SolverProps}) {

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('-');
  const [timer, setTimer] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handlePart1Click = () => {
    const start = performance.now();
    setResult(solverProps.solvePart1(inputText));
    setTimer((performance.now() - start).toFixed(1));
  };

  const handlePart2Click = () => {
    const start = performance.now();
    setResult(solverProps.solvePart2(inputText));
    setTimer((performance.now() - start).toFixed(1));
  };

  useEffect(() => {
    if (solverProps.testDataFileName) {
      fetch("/test_data/" + solverProps.testDataFileName).then(
        r => { return r.blob()}
      ).then(
        b => {
          const reader = new FileReader();
          reader.onload = () => {
            const text = reader.result;
            if (typeof text === "string") {
              setInputText(text);
            }
          }
          reader.readAsText(b);
        }
      );
    }
  }, []);
  
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
        {
          timer && <div className={styles.timer}> in {timer} ms</div>
        }        
      </div>

        
    </div>
  );
}
