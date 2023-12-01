import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useState } from 'react';

export default function Home() {

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(0);
  const [lineValues, setLineValues] = useState<number[]>([]);

  const digits = [
    "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"
  ]

  const strings = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"
  ]

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };

  const handlePart1Click = () => {
    evaluateInput(false);
  };

  const handlePart2Click = () => {
    evaluateInput(true);
  };

  const evaluateInput = (isPart2: boolean) => {
    const lines: string[] = inputText.split('\n'); 
    const values: number[] = lines.map((line) => evaluateLine(line, isPart2));
    setLineValues(values);
    const sum: number = values.reduce((acc, value) => acc + value, 0);
    setResult(sum);
  };

  const evaluateLine = (line: string, isPart2: boolean): number => {
    const a = getValueInLine(line, isPart2, true);
    const b = getValueInLine(line, isPart2, false);
    return parseInt(a.toString() + b.toString());
  }

  const getValueInLine = (line: string, isPart2: boolean, isForward: boolean): number => {

    let i = isForward ? 0 : line.length - 1;

    while (i >= 0 && i < line.length) {

      const c = line[i];

      for (let j = 0; j < 10; j++) {
        if (c === digits[j]) {
          return j;
        }
      }

      if (isPart2) {
        for (let j = 0; j < 10; j++) {

          const toMatch = strings[j];
          const endIndex = i + toMatch.length;
          
          if (endIndex > line.length) { continue; }

          const substr = line.substring(i, endIndex);

          if (substr === toMatch) {
            return j;
          }
        }
      }

      i += isForward ? 1 : -1;
    }

    throw new Error("No numbers found");
  }
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Advent of Code 2023 - Typescript</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 className={styles.title}>
          Advent of Code 2023
          <br/>
          TypeScript
        </h1>

        <p className={styles.description}>Day 1</p>

        <p>Paste <code>input</code> into text area below and click Part 1 / Part 2.</p>

        <textarea value={inputText} onChange={handleInputChange}></textarea>

        <span>

        
        <button  onClick={handlePart1Click}>Part 1</button>
        <button  onClick={handlePart2Click}>Part 2</button>
        </span>

        <p className={styles.description}>Working:</p>

        {lineValues && (
            <div>
              {lineValues.map(value => value.toString()).join(' + ')}
            </div>
        )}

        <p className={styles.description}>Result:</p>

        <p className={styles.description}>{result}</p>

      </main>

      <style jsx>{`
        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        footer img {
          margin-left: 0.5rem;
        }
        footer a {
          display: flex;
          justify-content: center;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}

function process() {

}