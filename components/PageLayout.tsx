import React, { ReactNode } from 'react';
import NavBar from './NavBar';
import styles from './PageLayout.module.css';

interface PageLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, pageTitle }) => {
  return (
    <>
      <NavBar/>
      <div className={styles.container}>
        <div className={styles.pageTitle}>{pageTitle}</div>
        {children}
      </div>
    </>
  );
};

export default PageLayout;
