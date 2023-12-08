import { useState, useEffect, ReactNode } from "react";
import styles from './Solver.module.css';

export interface SolverProps {

  part1: (lines: string[]) => number;
  part2: (lines: string[]) => number;
  testFile?: string;
  children: ReactNode;

}
  

export default function Solver({ children, part1, part2, testFile }: SolverProps) {

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('-');
  const [timer, setTimer] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handleClick = (method: (lines: string[]) => number) => {
    const start = performance.now();
    const lines = getLines(inputText);

    try {
      const result = method(lines).toString();
      setResult(result.toString());
    }
    catch(error) {
      setResult("Error");
      console.log(error);
    }

    setTimer((performance.now() - start).toFixed(1));
  }

  const getLines = (input: string) : string[] => {
    return input.split('\n').map(l => l.trim());
  }

  useEffect(() => {
    if (testFile) {
      fetch("/test_data/" + testFile).then(
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
        <button className={styles.button} onClick={() => handleClick(part1)}>Part 1</button>
        <button className={styles.button} onClick={() => handleClick(part2)}>Part 2</button>
      </div>

      <div className={styles.row}>
        <div className={styles.label}>Result:</div>
        <div className={styles.result}>{result}</div>
        {
          timer && <div className={styles.timer}> in {timer} ms</div>
        }        
      </div>

      <div className={styles.row}>
        <div className={styles.label}>Working:</div>
        <div className={styles.working}>
          {children}
        </div>
      </div>

        
    </div>
  );
}
