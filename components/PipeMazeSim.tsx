import React, { useEffect } from 'react';
import styles from './Solver.module.css';
import { Tile, PipeMaze } from '../pages/Day10';

export default function Render({ maze, isPart1 }: { maze: PipeMaze, isPart1: boolean }) {

  useEffect(() => {
    renderSim();
  });

  return (
    <div className={styles.flexGrow}>
      <div className={styles.sim}>
        <div className={styles.horizontal}>
          <canvas className={styles.simCanvas} id="simCanvas"></canvas>
        </div>
      </div>            
    </div>
  );

  function renderSim() {
    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const tileSize = 3;
    const w = (maze.width * tileSize);
    const h = (maze.height * tileSize);
    canvas.width = w;
    canvas.height = h;
  
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#444";
    for (let x = 0; x < maze.width; x++) {
      for (let y = 0; y < maze.height; y++) {
        if (x % 2 === y % 2) {
          ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
      }
    }

    ctx.fillStyle = "#ff0"
    ctx.fillRect(maze.startTile.x * tileSize, maze.startTile.y * tileSize, tileSize, tileSize);

    for (let x = 0; x < maze.width; x++) {
      for (let y = 0; y < maze.height; y++) {
        const tile = maze.tryGetTile(x, y)!;

        if (!isPart1 && tile.isInside && !tile.isPipe) {
          ctx.fillStyle = "#0f0"
          ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
        }

        const minX = x * tileSize;
        const minY = y * tileSize;
        ctx.fillStyle = getColour(tile);

        if (tile.connections.length > 0) {
          ctx.fillRect(minX + 1, minY + 1, 1, 1);
        }
        if (tile.connections.includes("N")) {
          ctx.fillRect(minX + 1, minY, 1, 1);
        }
        if (tile.connections.includes("S")) {
          ctx.fillRect(minX + 1, minY + 2, 1, 1);
        }
        if (tile.connections.includes("E")) {
          ctx.fillRect(minX + 2, minY + 1, 1, 1);
        }
        if (tile.connections.includes("W")) {
          ctx.fillRect(minX, minY + 1, 1, 1);
        }
        
        
      }
    }

    function getColour(tile: Tile) : string {
      if (isPart1) {
        return tile.isPipe ? "#9f9" : "#777"
      } else {
        return tile.isPipe ? "#aaa" : tile.isInside ? "#afa" : "#777"
      }      
    }

  }
}
