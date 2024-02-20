import React from 'react';
import PageLayout from '../components/PageLayout';
import Big from 'big.js';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';

export default function Render() {
  const part1 = (input: string[]): number => {
    const hailstones = input.map(l => parseHailstone(l));
    const testArea = new TestArea(new Big('200000000000000'), new Big('400000000000000'));
    let sum = 0;

    for (let i = 0; i < hailstones.length; i++) {
      for (let j = i + 1; j < hailstones.length; j++) {
        if (testArea.checkCollide(hailstones[i], hailstones[j])) {
          sum++;
        }
      }
    }

    return sum;
  }

  const part2 = (input: string[]): number => {
    const hailstones = input.map(l => parseHailstone(l));
    const origin = findOrigin(hailstones);
    return origin.a.plus(origin.b).plus(origin.c).toNumber();
  }

  return (
    <PageLayout pageTitle={"Day 24: Never Tell Me The Odds"} >
      <Solver part1={part1} part2={part2} testFile="Test24.txt" />
    </PageLayout>
  );
}

function parseHailstone(str: string): Particle3 {
  const split1 = str.split(" @ ");
  const split2 = split1[0].split(", ");
  const split3 = split1[1].split(", ");
  return new Particle3 (
    new Vec3(new Big(split2[0]), new Big(split2[1]), new Big(split2[2])),
    new Vec3(new Big(split3[0]), new Big(split3[1]), new Big(split3[2]))
  )
}

class Vec2 {
  constructor(
    public a: Big,
    public b: Big
  ) {};
}

class Vec3 {
  constructor(
    public a: Big,
    public b: Big,
    public c: Big
  ) {};
}

class Particle2 {
  constructor (
    public pos: Vec2,
    public vel: Vec2
  ) {};
}

class Particle3 {
  constructor (
    public pos: Vec3,
    public vel: Vec3
  ) {};
}

class TestArea {
  xMin: Big;
  xMax: Big;
  yMin: Big;
  yMax: Big;

  constructor(min: Big, max: Big) {
    this.xMin = min;
    this.xMax = max;
    this.yMin = min;
    this.yMax = max;
  }

  checkCollide(A: Particle2, B: Particle2): boolean {
    const result = findCollision(A, B);

    if (result === null) { return false; }
    if (result.a.lt(this.xMin)) { return false; }
    if (result.a.gt(this.xMax)) { return false; }
    if (result.b.lt(this.yMin)) { return false; }
    if (result.b.gt(this.yMax)) { return false; }

    return true;
  }
}

function findCollision(p1: Particle2, p2: Particle2): Vec2 | null {
  const t_a = p2.vel.a.times(p1.pos.b.minus(p2.pos.b));
  const t_b = p2.vel.b.times(p1.pos.a.minus(p2.pos.a));
  const t_c = p2.vel.b.times(p1.vel.a).minus(p2.vel.a.times(p1.vel.b));

  const t_1 = divide(t_a.minus(t_b), t_c);
  if (t_1 === null || t_1.lt(0)) { return null; } 

  const a = p1.pos.a.plus(t_1.times(p1.vel.a));
  const b = p1.pos.b.plus(t_1.times(p1.vel.b));

  const t_2 = divide(a.minus(p2.pos.a), p2.vel.a);
  if (t_2 === null || t_2.lt(0)) { return null; }
  
  return new Vec2(a, b);
}

function divide(a: Big, b: Big): Big | null { 
  if (a.eq(0) && b.eq(0)) { return new Big(0); }
  if (b.eq(0)) { return null; }
  return a.div(b);
}

function findOrigin(hailstones: Particle3[]): Vec3 {
  const xyParticles = hailstones.map(h => new Particle2(new Vec2(h.pos.a, h.pos.b), new Vec2(h.vel.a, h.vel.b)));
  const xzParticles = hailstones.map(h => new Particle2(new Vec2(h.pos.a, h.pos.c), new Vec2(h.vel.a, h.vel.c)));

  const xy = solve2D(xyParticles);
  const xz = solve2D(xzParticles);

  return new Vec3(xy.a, xy.b, xz.b);
}

function solve2D(hailstones: Particle2[]): Vec2 {
  const limit = 500;

  for (let va = -limit; va < limit; va++) {
    for (let vb = -limit; vb < limit; vb++) {
      const vel = new Vec2(new Big(va), new Big(vb));
      const p1 = cloneInReferenceFrame(hailstones[0], vel);
      const p2 = cloneInReferenceFrame(hailstones[1], vel);
      
      const coll = findCollision(p1, p2);

      if (coll === null) { continue; }

      const a = coll.a;
      const b = coll.b;

      let checker = true;

      for (const h of hailstones) {
        const h2 = cloneInReferenceFrame(h, vel);
        const d = h2.pos.a.minus(a).times(h2.vel.b).minus(h2.pos.b.minus(b).times(h2.vel.a));
        if (Math.abs(d.toNumber()) > 1) {
          checker = false;
          break;
        }
      }

      if (!checker) { continue; }

      return new Vec2(a, b);
    }
  }

  throw new Error("No solution found");
}

function cloneInReferenceFrame(p: Particle2, vel: Vec2): Particle2 {
  return new Particle2(new Vec2(p.pos.a, p.pos.b), new Vec2(p.vel.a.minus(vel.a), p.vel.b.minus(vel.b)));
}