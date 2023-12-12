import React, { useEffect, useState } from 'react';
import styles from './Solver.module.css';
import { InputRow, Row } from './Solver';
import { Galaxy } from '../pages/Day11';

export default function ExpansionSim({ lines }: { lines: string[] | null }) {

  function handleExpand() {
    updateGalaxy(factor + 1);
  }

  function handleReset() {
    updateGalaxy(1);
  }

  const [galaxy, setGalaxy] = useState<Galaxy | null>(null);
  const [factor, setFactor] = useState<number>(1);

  useEffect(() => {
    if (lines) {
      updateGalaxy(1);
    }    
  }, [lines]);

  return (
    <>
      <InputRow label="Sim:">
        <button className={styles.button} onClick={handleExpand} disabled={!lines}>Expand</button>
        <button className={styles.button} onClick={handleReset} disabled={!lines}>Reset</button>
        { galaxy && 
          <span>Expansion Factor = {factor} &nbsp;&nbsp;&nbsp; Seperation = {galaxy.measureDistances()}</span>          
        }

      </InputRow>
      <Row label="">
        <div className={styles.sim}>
          <div className={styles.horizontal}>
            <canvas className={styles.simCanvas} id="simCanvas"></canvas>
          </div>
        </div>
      </Row>
      
    </>
  );

  function updateGalaxy(factor: number) {

    setFactor(factor);
    const galaxy = new Galaxy(lines!);
    galaxy.expand(factor);
    setGalaxy(galaxy);


    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const w = galaxy.width + 2;
    const h = galaxy.height + 2;
    canvas.width = w;
    canvas.height = w;
  
    ctx.clearRect(0, 0, w, w);

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, w);

    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#fff";

    for (const star of galaxy.stars) {
      ctx.fillRect(star.x + 1, star.y + 1, 1, 1);
    }

  }

  
  
}

