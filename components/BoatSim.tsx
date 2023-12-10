import React from 'react';
import styles from './Solver.module.css';

export default function BoatSim() {
  return (
    <div className={styles.row}>
      <div className={styles.label}>Sim:</div>
      <div className={styles.flexGrow}>
        <span className={styles.centeredRow}>
          <button className={styles.button} onClick={createSim}>Run</button>
          <div>&nbsp;&nbsp;&nbsp;Max Time =&nbsp;</div>
          <input id="timeInput" className={styles.inputField} defaultValue={8} type="number" />
          <div>Distance =&nbsp;</div>
          <input id="distanceInput" className={styles.inputField} defaultValue={11} type="number" />
        </span>
        <div className={styles.sim}>
          <div className={styles.horizontal}>
            <canvas className={styles.simCanvas} id="simCanvas"></canvas>
          </div>
        </div>            
      </div>
    </div>
  );
}

const pixelSize = 4;
let simTimeout : NodeJS.Timeout | null;

async function createSim() {
  if (simTimeout) {
    clearTimeout(simTimeout);
  }

  const sim = new Sim();
  for (let i = 0; i < sim.maxTime; i++) {
    await delay(1000);
    sim.takeStep();
  }

  simTimeout = null;
}

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

  constructor() {
    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.maxTime = parseInt((document.getElementById("timeInput") as HTMLInputElement).value);
    this.distance = parseInt((document.getElementById("distanceInput") as HTMLInputElement).value);
  
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