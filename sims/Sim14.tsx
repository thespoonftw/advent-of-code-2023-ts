import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { Direction, Platform, TileState } from '../pages/Day14';
import { Button, InputRow, Row } from '../components/Solver';

export default function Render({ platform }: { platform: Platform | null }) {

  useEffect(() => {
    renderSim();
  });

  const [load, setLoad] = useState<number>(0);
  const [sliding, setSliding] = useState<boolean>(false);
  function isDisabled() : boolean { return platform === null || sliding; }

  return (
    <>
      <InputRow label="Sim :">
        <Button label="⮝ North" onClick={() => slide(Direction.North)} disabled={isDisabled()} />
        <Button label="⮜ West" onClick={() => slide(Direction.West)} disabled={isDisabled()} />
        <Button label="⮟ South" onClick={() => slide(Direction.South)} disabled={isDisabled()} />
        <Button label="⮞ East" onClick={() => slide(Direction.East)} disabled={isDisabled()} />
        <span>&nbsp;Load = {load}</span>
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

  async function slide(dir: Direction) {
    setSliding(true);
    while (platform!.slideStep(dir)) {
      await delay(50);
      renderSim();
    }
    setSliding(false);
  }

  function delay(milliseconds: number){
    return new Promise(resolve => {
      setTimeout(resolve, milliseconds);
    });
  }

  function renderSim() {
    if (platform === null) { return; }
    
    setLoad(platform!.findLoad())
    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const tileSize = 4;
    const w = (platform.width * (tileSize + 1)) + 1;
    const h = (platform.height * (tileSize + 1)) + 1;
    canvas.width = w;
    canvas.height = h;
  
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#777";
    ctx.fillRect(0, 0, w, h);

    
    for (let x = 0; x < platform.width; x++) {
      for (let y = 0; y < platform.height; y++) {

        const tx = x * (tileSize + 1) + 1;
        const ty = y * (tileSize + 1) + 1;        
        const tile = platform.tiles[y][x];

        if (tile.state === TileState.Square) {
          ctx.fillStyle = "#333";

        } else if (tile.state === TileState.Round){ 
          ctx.fillStyle = "#bb8";

        } else {
          ctx.fillStyle = "#888";
        }

        ctx.fillRect(tx, ty, tileSize, tileSize);
      }
    }    

  }
}
