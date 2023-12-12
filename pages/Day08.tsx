import { useState } from 'react';
import PageLayout from '../components/PageLayout';
import Solver, { WorkingBox } from '../components/Solver';
import { ADashedLine, AHeader, ACell } from '../components/AsciiTable';

export default function Render() {

  const part1 = (input: string[]): number => {
    const map = new NodeMap(input);
    const path = Navigate(map);
    setPath(path);
    setPart(1);
    return path.length;
  }

  const part2 = (input: string[]): number => {
    const map = new NodeMap(input);
    const ghosts = GhostNavigate(map);
    setPart(2);
    setGhosts(ghosts);
    return findLCM(ghosts.map(g => g.zVisit));
  }

  const [part, setPart] = useState<number | null>(null);
  const [path, setPath] = useState<string[]>([])
  const [ghosts, setGhosts] = useState<Ghost[]>([])
  
  return (
    <PageLayout pageTitle={"Day 08: Haunted Wasteland"} >
      <Solver part1={part1} part2={part2} testFile="Test08.txt" />
      <WorkingBox>
        { part === 1 && 
          <div>
            {
              path && path.map((value, index) => (
                <span key={index}>{value},&nbsp; 
                  {
                    (index + 1) % 16 === 0 && <br/>
                  }
                </span>
              ))
            }
          </div>
        }
        { part === 2 && 
          <div>
            <AHeader text="Start" length={7} />|
            <AHeader text="End" length={7} />|
            <AHeader text="Steps" />
            <ADashedLine length={24} />
            { ghosts && ghosts.map((ghost, index) => (
              <div key={index}>
                <ACell text={ghost.startNode} length={7}/>|
                <ACell text={ghost.currentNode} length={7}/>|
                <ACell text={ghost.zVisit} />
              </div>
            ))}
          </div>
        }
      </WorkingBox>   
    </PageLayout>
  );
}

function Navigate(map: NodeMap) : string[] {
  let nodeStr = "AAA";
  let path = [nodeStr];

  while (nodeStr !== "ZZZ") {
    nodeStr = map.findNextNode(nodeStr);
    map.moveToNextInstruction();
    path.push(nodeStr);
  }

  return path;
}

function GhostNavigate(map: NodeMap) : Ghost[] {

  let ghosts = Object.keys(map.nodes).filter(k => k.endsWith("A")).map(n => new Ghost(n));
  let finishedGhosts = [];
  let i = 1;

  while (ghosts.length > 0) {
    for (const ghost of ghosts.slice()) {
      ghost.currentNode = map.findNextNode(ghost.currentNode);
      if (ghost.currentNode.endsWith("Z")) {
        ghosts = ghosts.filter(g => g.startNode !== ghost.startNode);
        finishedGhosts.push(ghost);
        ghost.zVisit = i;
      }
    }
    map.moveToNextInstruction();
    i++;
  }
  return finishedGhosts;
}

class NodeMap {

  instructions: string;
  nodes: { [key: string]: Node } = {};
  instructionIndex: number = 0;

  constructor(lines: string[]) {

    this.instructions = lines[0];
    const nodeLines = lines.slice(2);

    for (const line of nodeLines) {
      const split1 = line.split(" = ");
      const split2 = split1[1].split(", ");

      const name = split1[0];
      const left = split2[0].slice(1);
      const right = split2[1].slice(0, split2[1].length - 1);

      this.nodes[name] = new Node(left, right);
    }
  }

  findNextNode(nodeStr: string) : string {
    const node = this.nodes[nodeStr];
    return this.instructions[this.instructionIndex] === "L" ? node.leftNodeStr : node.rightNodeStr;
  }

  moveToNextInstruction() {
    this.instructionIndex = (this.instructionIndex + 1) % this.instructions.length;
  }

}

class Node {

  leftNodeStr: string;
  rightNodeStr: string;

  constructor(leftNodeStr: string, rightNodeStr: string) {
    this.leftNodeStr = leftNodeStr;
    this.rightNodeStr = rightNodeStr;
  }

}

class Ghost {

  startNode: string;
  currentNode: string;
  zVisit: number = 0;

  constructor(startNode: string) {
    this.startNode = startNode;
    this.currentNode = startNode;
  }
}

function gcd(a: number, b: number) : number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number) : number {
  return (a * b) / gcd(a, b);
}

function findLCM(array: number[]) : number {
  let result = array[0];
  for (let i = 1; i < array.length; i++) {
    result = lcm(result, array[i]);
  }
  return result;
}
