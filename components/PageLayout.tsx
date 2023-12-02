import React, { ReactNode } from 'react';
import NavBar from './NavBar';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  return (
    <>
      <NavBar/>
      <div className={styles.container}>
        {children}
      </div>
    </>
  );
};

export default PageLayout;
