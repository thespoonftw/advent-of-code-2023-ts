import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { InputRow, Row } from '../components/Solver';
import { HikingTrail, TileType } from '../pages/Day23';

export default function ExpansionSim({ trail }: { trail: HikingTrail | null }) {

  useEffect(() => {
    updateViz();
  }, [trail]);

  return (
    <>
      <InputRow label="Sim:">
        <></>

      </InputRow>
      <div className={styles.sim}>
        <div className={styles.horizontal}>
          <canvas className={styles.simCanvas} id="simCanvas"></canvas>
        </div>
      </div>
      
    </>
  );

  function updateViz() {
    
    if (!trail) { return; }

    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const tileSize = 7;
    const w = trail.width * tileSize;
    const h = trail.height * tileSize;
    canvas.width = w;
    canvas.height = h;
  
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#164";
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < trail.height; y++) {
      for (let x = 0; x < trail.width; x++) {

        const ty = y * tileSize;
        const tx = x * tileSize;
        const tile = trail.tiles[y][x];

        if (tile.type !== TileType.Forest) {

          if (tile.isVisited) {
            ctx.fillStyle = "#ff9";
            ctx.fillRect(tx, ty, tileSize, tileSize);
          }
          else {
            ctx.fillStyle = "#aaf";
            ctx.fillRect(tx, ty, tileSize, tileSize);
          }

        }

        ctx.fillStyle = "#666";
        if (tile.type === TileType.SlopeSouth) {

          ctx.fillRect(tx, ty, tileSize, 1);
          ctx.fillRect(tx, ty + 6, tileSize, 1);

          ctx.fillRect(tx + 1, ty + 1, 5, 1);
          ctx.fillRect(tx + 2, ty + 2, 3, 1);
          ctx.fillRect(tx + 3, ty + 3, 1, 1);

          ctx.fillRect(tx + 0, ty + 3, 1, 1);
          ctx.fillRect(tx + 6, ty + 3, 1, 1);

          ctx.fillRect(tx + 0, ty + 4, 2, 1);
          ctx.fillRect(tx + 5, ty + 4, 2, 1);

          ctx.fillRect(tx + 0, ty + 5, 3, 1);
          ctx.fillRect(tx + 4, ty + 5, 3, 1);
        }
        else if (tile.type === TileType.SlopeEast) {
          
          ctx.fillRect(tx, ty, 1, tileSize);
          ctx.fillRect(tx + 6, ty, 1, tileSize);

          ctx.fillRect(tx + 1, ty + 1, 1, 5);
          ctx.fillRect(tx + 2, ty + 2, 1, 3);
          ctx.fillRect(tx + 3, ty + 3, 1, 1);

          ctx.fillRect(tx + 3, ty + 0, 1, 1);
          ctx.fillRect(tx + 3, ty + 6, 1, 1);

          ctx.fillRect(tx + 4, ty + 0, 1, 2);
          ctx.fillRect(tx + 4, ty + 5, 1, 2);

          ctx.fillRect(tx + 5, ty + 0, 1, 3);
          ctx.fillRect(tx + 5, ty + 4, 1, 3);
        }

      }
    }



  }

  
  
}

