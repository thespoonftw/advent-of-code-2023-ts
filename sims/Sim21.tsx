import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { InputRow, Row } from '../components/Solver';
import { Garden, OccupiedState } from '../pages/Day21';

export default function ExpansionSim({ garden }: { garden: Garden | null }) {

  function handleStep() {
    garden!.takeStep();
    drawGarden();
    setStep(step + 1);
  }

  function handleReset() {
    garden!.reset();
    drawGarden();
    setStep(0);
  }

  useEffect(() => {
    if (garden) {
      drawGarden();
      setStep(garden.stepNumber);
    }  
  }, [garden]);

  const [step, setStep] = useState<number>(0);

  return (
    <>
      <InputRow label="Sim:">
        <button className={styles.button} onClick={handleStep} disabled={!garden}>Take Step</button>
        <button className={styles.button} onClick={handleReset} disabled={!garden}>Reset</button>
        { garden && 
          <span>Step = {step} &nbsp; Occupied = {garden.countOccupied()}</span>          
        }

      </InputRow>
      <div className={styles.sim}>
        <div className={styles.horizontal}>
          <canvas className={styles.simCanvas} id="simCanvas"></canvas>
        </div>
      </div>
      
    </>
  );

  function drawGarden() {
    
    if (!garden) { return; }

    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const w = garden.size;
    const h = garden.size;
    canvas.width = w;
    canvas.height = w;
  
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, w, h);

    const isEven = garden.stepNumber % 2 === 0;

    for (let y = 0; y < garden.size; y++) {
      for (let x = 0; x < garden.size; x++) {

        const cell = garden.cells[y][x];

        if (cell.state === OccupiedState.Never) {
          continue;
        }

        if (cell.state === OccupiedState.Rock) {
          ctx.fillStyle = "#555";
          ctx.fillRect(x, y, 1, 1);
          continue;
        }

        if (cell.isOccupied(isEven)) {
          ctx.fillStyle = "#cc6";
          ctx.fillRect(x, y, 1, 1);
        }

      }
    }



  }

  
  
}

