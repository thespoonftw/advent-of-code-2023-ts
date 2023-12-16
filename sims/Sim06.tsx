import React, { useState } from 'react';
import styles from '../components/Solver.module.css';
import { InputRow, NumberInput, Row } from '../components/Solver';

export default function BoatSim() {

  const [maxTime, setMaxTime] = useState<number>(8);
  const [distance, setDistance] = useState<number>(11);

  return (
    <>
      <InputRow label="Sim">
        <button className={styles.button} onClick={createSim}>Run</button>
        <div>&nbsp;&nbsp;&nbsp;</div>
        <NumberInput label="Max Time" set={setMaxTime} value={maxTime} />
        <NumberInput label="Distance" set={setDistance} value={distance} />
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

  async function createSim() {
    if (simTimeout) {
      clearTimeout(simTimeout);
    }
  
    const sim = new Sim(maxTime, distance);
    for (let i = 0; i < sim.maxTime; i++) {
      await delay(1000);
      sim.takeStep();
    }
  
    simTimeout = null;
  }
  
}

const pixelSize = 4;
let simTimeout : NodeJS.Timeout | null;


function delay(milliseconds: number){
  return new Promise(resolve => {
    simTimeout = setTimeout(resolve, milliseconds);
  });
}

class Sim {

  width: number;
  height: number;
  maxTime: number;
  distance: number;
  ctx: CanvasRenderingContext2D;
  boatPositions: number[];
  t : number = 0;

  constructor(maxTime: number, distance: number) {
    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.maxTime = maxTime;
    this.distance = distance;
  
    this.width = (this.distance + 3) * pixelSize;
    this.height = (this.maxTime + 1) * pixelSize;
    canvas.width = this.width;
    canvas.height = this.height;
  
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.drawBackground();
    this.boatPositions = new Array(this.maxTime - 1).fill(0);
    this.drawBoats();
  }

  drawBackground() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (x == 1 || x == this.distance + 1) {
          if (y % 2 == 0) {
            this.ctx.fillStyle = "#999";
          } else {
            this.ctx.fillStyle = "#777";
          }
        } else {
          this.ctx.fillStyle = "#0000ff";
        }
        this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      }
    }
  }

  drawBoats() {
    for (let i = 0; i < this.boatPositions.length; i++) {
      this.ctx.fillStyle = "#ff0";
      this.ctx.fillRect((1.25 + this.boatPositions[i]) * pixelSize, (i + 1.25) * pixelSize, pixelSize / 2, pixelSize / 2);
    }
  }

  takeStep() {
    this.t += 1;
    const t = this.t;

    for (let i = 0; i < this.boatPositions.length; i++) {
      const n = i + 1;
      this.boatPositions[i] = Math.min(Math.max(n * (t - n), 0), this.distance);
    }
    this.drawBackground();
    this.drawBoats();
  }

}