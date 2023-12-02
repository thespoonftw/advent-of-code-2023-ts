import styles from '../styles/Home.module.css';
import { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function Home() {

  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(0);
  const maxRed = 12;
  const maxGreen = 13;
  const maxBlue = 14;

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
    const values: number[] = lines.map((line) => getLineScore(line, isPart2));
    const sum: number = values.reduce((acc, value) => acc + value, 0);
    setResult(sum);
  };

  const getLineScore = (line: string, isPart2: boolean): number => {
    const line_split = line.split(": ");
    const roundNumber = parseInt((line_split[0].split(" "))[1]);
    
    if (isPart2) {
      const minRGB = getMinimumRGB(line_split[1]);
      return minRGB[0] * minRGB[1] * minRGB[2];
    }
    else {
      const sets = line_split[1].split("; ");
      return sets.every(i => isSetValid(i)) ? roundNumber : 0;
    }
  }

  const getMinimumRGB = (line: string): number[] => {
    const map = new Map();
    map.set("red", 0);
    map.set("green", 0);
    map.set("blue", 0);

    const firstSplit = line.split(", ");
    const secondSplit = firstSplit.flatMap(item => item.split('; '));

    for (const s of secondSplit) {
      const split = s.split(' ');
      const value = parseInt(split[0]);
      const color = split[1];
      if (value > map.get(color)) {
        map.set(color, value);
      }
    }

    return [map.get("red"), map.get("green"), map.get("blue")];
  }

  const isSetValid = (set: string): boolean => {
    const split = set.split(", ");
    return split.every(i => isColourCountValid(i));;
  }

  const isColourCountValid = (s: string): boolean => {
    const split = s.split(" ");
    const count = parseInt(split[0]);
    let limit = 0;
    const colorString = split[1];
    if (colorString == "red") {
      limit = maxRed;
    } else if (colorString == "green") {
      limit = maxGreen;
    } else if (colorString == "blue") {
      limit = maxBlue;
    }
    return count <= limit;
  }
  
  return (
    <PageLayout>
      <p>Paste <code>input</code> into text area below and click Part 1 / Part 2.</p>

      <textarea value={inputText} onChange={handleInputChange}></textarea>

      <br/>

      <span>
        <button  onClick={handlePart1Click}>Part 1</button>
        <button  onClick={handlePart2Click}>Part 2</button>
      </span>

      <p className={styles.description}>Result:</p>

      <p className={styles.description}>{result}</p>
    </PageLayout>
  );
}