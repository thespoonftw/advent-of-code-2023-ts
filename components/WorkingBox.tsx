import React, { ReactNode } from 'react';
import styles from './Solver.module.css';

interface WorkingBoxProps {
  children: ReactNode; 
}

export default function WorkingBox({ children }: WorkingBoxProps) {
  
  return (
    <div className={styles.row}>
      <div className={styles.label}>Working:</div>
      <div className={styles.working}>
        {children}
      </div>
    </div>
  );
}
