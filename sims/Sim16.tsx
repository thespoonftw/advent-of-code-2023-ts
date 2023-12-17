import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { Button, InputRow, Row } from '../components/Solver';
import { ReflectionMaze, TileType } from '../pages/Day16';
import { Direction } from '../pages/Day14';

export default function Render({ maze }: { maze: ReflectionMaze | null }) {

  useEffect(() => {
    renderSim();
  });

  function run() {

  }

  return (
    <>
      <InputRow label="Sim" >
        <Button label="Run" onClick={run} />
      </InputRow>
      <Row label="">
        <div className={styles.flexGrow}>
          <div className={styles.sim}>
            <div className={styles.horizontal}>
              <canvas className={styles.simCanvas} id="simCanvas"></canvas>
            </div>
          </div>            
        </div>
      </Row>
    </>
  );

  function renderSim() {
    if (maze === null) { return; }
    
    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const tileSize = 3;
    const w = (maze.width * (tileSize + 1)) + 1;
    const h = (maze.height * (tileSize + 1)) + 1;
    canvas.width = w;
    canvas.height = h;
  
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#666";
    ctx.fillRect(0, 0, w, h);

    
    for (let x = 0; x < maze.width; x++) {
      for (let y = 0; y < maze.height; y++) {

        const tx = x * (tileSize + 1) + 1;
        const ty = y * (tileSize + 1) + 1;        
        const tile = maze.tiles[y][x];

        ctx.fillStyle = "#555";
        ctx.fillRect(tx, ty, tileSize, tileSize);

        ctx.fillStyle = "#c33";
        if (tile.energizedDirections.includes(Direction.North)) { ctx.fillRect(tx + 1, ty - 1, 1, 3); }
        if (tile.energizedDirections.includes(Direction.South)) { ctx.fillRect(tx + 1, ty + 1, 1, 3); }
        if (tile.energizedDirections.includes(Direction.East)) { ctx.fillRect(tx + 1, ty + 1, 3, 1); }
        if (tile.energizedDirections.includes(Direction.West)) { ctx.fillRect(tx - 1, ty + 1, 3, 1); }

        ctx.fillStyle = "#ccc";
        switch (tile.type) {

          case TileType.HSplit: 
            ctx.fillRect(tx, ty + 1, tileSize, 1); 
            break;
            
          case TileType.VSplit:
            ctx.fillRect(tx + 1, ty, 1, tileSize); 
            break;

          case TileType.BackMirror:
            ctx.fillRect(tx, ty, 1, 1); 
            ctx.fillRect(tx + 1, ty + 1, 1, 1); 
            ctx.fillRect(tx + 2, ty + 2, 1, 1); 
            break;


          case TileType.ForwardMirror:
            ctx.fillRect(tx + 2, ty, 1, 1); 
            ctx.fillRect(tx + 1, ty + 1, 1, 1); 
            ctx.fillRect(tx, ty + 2, 1, 1); 
            break;
        }
      }
    }    

  }
}
