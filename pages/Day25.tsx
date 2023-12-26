import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { InputRow, NumberInput, WorkingBox } from '../components/Solver';
export default function Render() {

  const part1 = (input: string[]): number => {
    const d = new WiringDiagram(input);
    return d.solve();
  }

  const part2 = (input: string[]): number => {
    throw new Error("No part 2");
  }

  return (
    <PageLayout pageTitle={"Day 25: Snowverload"} >
      <Solver part1={part1} part2={part2} testFile="Test25.txt" />
    </PageLayout>
  );

}

class WiringDiagram {

  componentMap: Map<string, Component> = new Map<string, Component>();
  edgeVisits: Map<string, number> = new Map<string, number>();

  constructor(input: string[]) {
    const componentArr = input.map(l => createComponentFromLine(l));
    componentArr.forEach(c => this.componentMap.set(c.label, c));
    
    for (const component of componentArr) {
      for (const connectionStr of component.connections) {

        if (!this.componentMap.has(connectionStr)) {
          this.componentMap.set(connectionStr, new Component(connectionStr, []));
        }

        const other = this.componentMap.get(connectionStr)!;
        if (!other.connections.includes(component.label)) {
          other.connections.push(component.label);
        }
        
      }
    }
  }

  solve() : number {

    const arr = Array.from(this.componentMap.values());
    
    for (let n = 0; n < 300; n++) {
      const a = arr[getRandomNumber(0, arr.length)];
      const b = arr[getRandomNumber(0, arr.length)];
      if (a === b) { continue; }
      const path = this.findPath(a, b);

      for (let i = 0; i < path.length - 1; i++) {
        this.visitEdge(path[i], path[i+1]);
      }
    }

    const top3Edges = Array.from(this.edgeVisits.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(pair => pair[0]);

    top3Edges.forEach(e => this.cutEdge(e));

    const clusterCount = this.countNeighbours(arr[0]);

    console.log(arr.length);
    console.log(clusterCount);

    return (arr.length - clusterCount) * clusterCount;    
  }

  findPath(startNode: Component, endNode: Component) : Component[] {

    let queue: { node: Component; path: Component[] }[] = [{ node: startNode, path: [startNode] }];
    let checked: Component[] = [];

    while (queue.length > 0) {

      const { node, path } = queue.shift()!;
      checked.push(node);

      const neighbours = node.connections
        .map(s => this.componentMap.get(s)!)
        .filter(n => !checked.includes(n));

      for (const neighbour of neighbours) {
        const newPath = [...path, neighbour];
        if (neighbour === endNode) { return newPath; }
        queue.push({ node: neighbour, path: newPath });
      }
    }
    throw new Error("Path not found");
  }

  visitEdge(nodeA: Component, nodeB: Component) {
    const key = [nodeA.label, nodeB.label].sort().join("-");
    if (!this.edgeVisits.has(key)) { this.edgeVisits.set(key, 0); }
    this.edgeVisits.set(key, this.edgeVisits.get(key)! + 1);
  }

  cutEdge(edgeKey: string) {
    const split = edgeKey.split("-");
    const n1 = this.componentMap.get(split[0])!;
    const n2 = this.componentMap.get(split[1])!;
    n1.connections = n1.connections.filter(n => n !== n2.label);
    n2.connections = n2.connections.filter(n => n !== n1.label);
  }

  countNeighbours(node: Component) : number {

    const checked: Set<Component> = new Set();
    const toCheck = [node];

    while (toCheck.length > 0) {
      const current = toCheck.shift()!;
      checked.add(current);
      const neighbours = current.connections
        .map(s => this.componentMap.get(s)!)
        .filter(n => !checked.has(n));
      neighbours.forEach(n => toCheck.push(n));
    }

    return checked.size;
  }

  
}

function createComponentFromLine(line: string) : Component {
  const split = line.split(": ");
  return new Component(split[0], split[1].split(" "));
}

class Component {

  label: string;
  connections: string[];

  constructor(label: string, connections: string[]) {
    this.label = label;
    this.connections = connections;
  }

}

function getRandomNumber(min: number, max: number): number { // min inclusive, max exclusive
  return Math.floor(Math.random() * (max - min)) + min;
}