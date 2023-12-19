import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { Tile, PipeMaze } from '../pages/Day10';
import { DigSite } from '../pages/Day18';
import { InputRow } from '../components/Solver';

export default function Render({ digSite }: { digSite: DigSite | null }) {

  useEffect(() => {
    renderSim();
  });

  const [cellX, setCellX] = useState<number>(0);
  const [cellY, setCellY] = useState<number>(0);
  const [cellWidth, setCellWidth] = useState<number>(0);
  const [cellHeight, setCellHeight] = useState<number>(0);
  const [showCell, setShowCell] = useState<boolean>(false);

  return (
    <>
      <InputRow label="Sim: ">
        { showCell &&
          <span>x = {cellX}&nbsp; y = {cellY}&nbsp; width = {cellWidth}&nbsp; height = {cellHeight}</span>
        }
      </InputRow>
      <div className={styles.flexGrow}>
        <div className={styles.sim}>
          <div className={styles.horizontal}>
            <canvas className={styles.simCanvas} id="simCanvas" onMouseMove={handleMouseMove}></canvas>
          </div>
        </div>            
    </div>
    </>
  );

  function renderSim() {

    if (!digSite) { return; }

    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const w = digSite.width;
    const h = digSite.height;
    canvas.width = w + 2;
    canvas.height = h + 2;
  
    ctx.clearRect(0, 0, w + 2, h + 2);
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, w + 2, h + 2);
    
    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const cell = digSite.cells[y][x];
        ctx.fillStyle = cell.isWall ? "#666" : cell.isInside ? "#c63" : "#999";
        ctx.fillRect(x + 1, y + 1, 1, 1);
      }
    }
  }

  function handleMouseMove(event: React.MouseEvent<HTMLCanvasElement>) {

    if (!digSite) { return; }

    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (((event.clientX - rect.left) / canvas.clientWidth) * canvas.width) - 1;
    const y = (((event.clientY - rect.top) / canvas.clientHeight) * canvas.height) - 1;

    if (x < 0 || y < 0 || x > digSite.width || y > digSite.height) {
      setShowCell(false);
      return;
    } else {
      setShowCell(true);
    }

    const xb = Math.floor(Math.min(Math.max(x, 0), digSite.width + 1));
    const yb = Math.floor(Math.min(Math.max(y, 0), digSite.height + 1));
    setCellX(xb);
    setCellY(yb);
    setCellWidth(digSite.getCellWidth(xb));
    setCellHeight(digSite.getCellHeight(yb));
  }
}
