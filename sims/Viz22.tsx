import React, { useEffect, useState } from 'react';
import styles from '../components/Solver.module.css';
import { InputRow, Row } from '../components/Solver';
import { BrickTower } from '../pages/Day22';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default function ExpansionSim({ tower }: { tower: BrickTower | null }) {

  useEffect(() => {
    if (tower) {
      renderTower();
    }  
  }, [tower]);

  return (
    <>

      <div className={styles.sim}>
        <div className={styles.horizontal}>
          <canvas className={styles.simCanvas} id="simCanvas"></canvas>
        </div>
      </div>
      
    </>
  );

  function renderTower() {
    
    if (!tower) { return; }

    const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
    const container = canvas.parentElement!;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setSize(container.clientWidth, container.clientWidth);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Ambient light
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Directional light
    directionalLight.position.set(5, 5, 5); // Set light position
    scene.add(directionalLight);

    const geometry = new THREE.BoxGeometry();
    const outlineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

    const defaultMat = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const matCount = 20;
    const dangerMats = generateMaterials(matCount);
    const maxDanger = tower.bricks.reduce((max, brick) => Math.max(max, brick.danger), Number.NEGATIVE_INFINITY);

    for (let i = 0; i < tower.bricks.length; i++) {
      const brick = tower.bricks[i];

      const dangerIndex = Math.floor((brick.danger / (maxDanger + 0.01)) * matCount);
      console.log(dangerIndex);

      const mat = brick.danger ? dangerMats[dangerIndex] : defaultMat;
      const cube = new THREE.Mesh(geometry, mat);
      scene.add(cube);
      cube.position.x = (brick.xMin + brick.xMax) / 2;
      cube.position.z = (brick.yMin + brick.yMax) / 2;
      cube.position.y = (brick.zMin + brick.zMax) / 2;

      cube.scale.x = brick.xLen;
      cube.scale.z = brick.yLen;
      cube.scale.y = brick.zLen;

      const edges = new THREE.EdgesGeometry(cube.geometry);
      const outline = new THREE.LineSegments(edges, outlineMaterial);
      cube.add(outline);
    }

    const controls = new OrbitControls(camera, renderer.domElement);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      controls.target.x = 5;
      controls.target.z = 5;
    };

    animate();

  }

  function generateMaterials(count: number): THREE.MeshStandardMaterial[] {
    const materials: THREE.MeshStandardMaterial[] = [];
    const l = count - 1;
  
    for (let i = 0; i < count; i++) {
      const hueValue = (1 - (i / l)) * 0.65;
      const color = new THREE.Color().setHSL(hueValue, 1, 0.5); // Adjust saturation and lightness as needed
      const material = new THREE.MeshStandardMaterial({ color });
      materials.push(material);
    }
  
    return materials;
  }
  
}

