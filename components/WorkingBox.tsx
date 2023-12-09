import { ReactNode } from 'react';
import styles from './Solver.module.css';

export default function Render({ children }: { children: ReactNode }) {

  return (
    <div className={styles.row}>
      <div className={styles.label}>Working:</div>
      <div className={styles.working}>
        {children}
      </div>
    </div>
  );
}
