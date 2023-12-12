import { useState, useEffect, ReactNode, ChangeEvent, SetStateAction, Dispatch } from "react";
import styles from './Solver.module.css';

export interface SolverProps {
  part1: (lines: string[]) => number;
  part2: (lines: string[]) => number;
  testFile?: string;
}
  
export default function Solver({ part1, part2, testFile }: SolverProps) {

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
      const result = method(lines);
      if (Number.isNaN(result)) { throw new Error("NaN"); }
      if (!Number.isFinite(result)) { throw new Error("Infinity"); }
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

      <Row label="Input:">
        <textarea className={styles.input} value={inputText} onChange={handleInputChange}></textarea>
      </Row>

      <Row label="Run:">
        <button className={styles.button} onClick={() => handleClick(part1)}>Part 1</button>
        <button className={styles.button} onClick={() => handleClick(part2)}>Part 2</button>
      </Row>

      <Row label="Result:">
        <div className={styles.result}>{result}</div>
        {
          timer && <div className={styles.timer}> in {timer} ms</div>
        }        
      </Row>
      
    </div>
  );
}


export function Row({ children, label }: { children: ReactNode, label: string }) {

  return (
    <div className={styles.row}>
        <div className={styles.label}>{label}</div>
        {children}
      </div>
  );
}

export function WorkingBox({ children }: { children: ReactNode }) {

  return (
    <div className={styles.row}>
      <div className={styles.label}>Working:</div>
      <div className={styles.working}>
        {children}
      </div>
    </div>
  );
}

export function InputRow({ label, children }: { children: ReactNode, label: string }) {

  return (
    <Row label={label}>
      <div className={styles.flexGrow}>
        <span className={styles.centeredRow}>
          {children}
        </span>
      </div>
    </Row>
    
  );
}

export function NumberInput({ label, set, value, width }: { label: string, set: Dispatch<SetStateAction<number>>, value: number, width?: number }) {

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => { set(parseInt(event.target.value)); }
  const style = { width: `${width ?? 45}px` };

  return (
    <>
      <div>{label} =&nbsp;</div>
      <input style={style} className={styles.inputField} value={value} onChange={handleChange} type="number" />
    </>
  );
}