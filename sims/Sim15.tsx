import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { Button, InputRow, Row, WorkingBox } from '../components/Solver';
import { LensConfiguration, Step } from '../pages/Day15';
import { ACell, ADashedLine, AHeader } from '../components/AsciiTable';

export default function Render({ config }: { config: LensConfiguration | null }) {

  const [index, setIndex] = useState<number>(0);

  function getMaxIndex(): number { return config ? config.steps.length : 0; }
  function getStep(): Step | null { return config ? config.steps[index - 1] : null; }
  function getStepStr(): string { return getStep() ? getStep()!.str : "-"; } 
  function getBoxNo(): string { return getStep() ? getStep()!.hashValue.toString() : "-"; }

  return (
    <>
      <InputRow label="Sim :">
        <Button label="Next" onClick={next} disabled={config === null} />
        <Button label="Reset" onClick={reset} disabled={config === null} />
      </InputRow>
      <WorkingBox>
        <div>
          <b>&nbsp;Step =</b>
            { String(index).padStart(4, '\u00A0') }
            &nbsp;/
            <ACell text={getMaxIndex()} length={6} />
          <b>&nbsp;Instruction:</b>
          <ACell text={getStepStr()} length={10} />
          <b>Updating Box: </b>
          <span>{getBoxNo()}</span>
        </div>
        <ADashedLine length={72} />
        {
          Array.from({ length: 128 }).map((_, i) => (
            <div key={i}>
              <b>{ String(i).padStart(4, '\u00A0') }:&nbsp;</b>
              { String("contents").padEnd(30, '\u00A0') }
              <b>{ String(i + 128).padStart(4, '\u00A0') }:&nbsp;</b>
              { "contents" }
            </div>
          ))
        }
      </WorkingBox>
    </>
  );

  function reset() {
    setIndex(0);
  }

  function next() {
    setIndex(Math.min(getMaxIndex(), index + 1));
  }
}
