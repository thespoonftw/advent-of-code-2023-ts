import React from 'react';
import styles from './NavBar.module.css';

const NavBar = () => {
  return (
    <nav className={styles.navbar}>

      <div className={styles.navcontainer}>
        <div className={styles.navheader}>
          <div className={styles.title}>ADVENT OF CODE 2023</div>
          <div className={styles.github}><b>github</b></div>
        </div>

        <div className={styles.navdays}>
          <a href="/Day01">01</a>&nbsp;
          <a href="/Day02">02</a>&nbsp;
          <a href="/Day03">03</a>&nbsp;
          <a href="/Day04">04</a>&nbsp;
          <a href="/Day05">05</a>&nbsp;
          <a href="/Day06">06</a>&nbsp;
          <a href="/Day07">07</a>&nbsp;
          <a href="/Day08">08</a>&nbsp;
          <a href="/Day09">09</a>&nbsp;
          <a href="/Day10">10</a>&nbsp;
          <a href="/Day11">11</a>&nbsp;
          <a href="/Day12">12</a>&nbsp;
          <a href="/Day13">13</a>&nbsp;
          <a href="/Day14">14</a>&nbsp;
          <a href="/Day15">15</a>&nbsp;
          <a href="/Day16">16</a>&nbsp;
          <a href="/Day17">17</a>&nbsp;
          <a href="/Day18">18</a>&nbsp;
          <a href="/Day19">19</a>&nbsp;
          <a href="/Day20">20</a>&nbsp;
          <a href="/Day21">21</a>&nbsp;
          <a href="/Day22">22</a>&nbsp;
          <a href="/Day23">23</a>&nbsp;
          <a href="/Day24">24</a>&nbsp;
          <a href="/Day25">25</a>&nbsp;
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
