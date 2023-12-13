import PageLayout from '../components/PageLayout';
import Solver from '../components/Solver';

export default function Render() {

  const part1 = (input: string[]): number => {
    const checker = new RecordChecker(input);
    checker.findPermutations();
    return checker.sum();
  }

  const part2 = (input: string[]): number => {
    const records = new RecordChecker(input);
    records.unfold(5);
    records.findPermutations();
    return records.sum();
  }
  
  return (
    <PageLayout pageTitle={"Day 12: Hot Springs"} >
      <Solver part1={part1} part2={part2} testFile="Test12.txt" />
    </PageLayout>
  );

}

class RecordChecker {

  records: ConditionRecord[];
  cache: { [key: string]: number } = {};

  constructor(input: string[]) {
    this.records = input.map(i => new ConditionRecord(i));
  }

  unfold(factor: number) {
    for (const record of this.records) {
      record.groups = Array(factor).fill([...record.groups]).flat();
      record.str = Array(factor).fill(record.str).join("?");
    }
  }

  findPermutations() {
    for (const record of this.records) {
      record.permutations = this.getPermutationsRecursive(record.str, record.groups);
    }
  }

  sum() {
    return this.records.reduce((acc, c) => acc + c.permutations, 0);
  }

  getPermutationsRecursive(str: string, groups: number[]) : number {

    // no more str remaining, check if groups is empty
    if (str.length === 0) { return groups.length === 0 ? 1 : 0; }

    // no more groups remaining, check if there's no more # left
    if (groups.length === 0) { return str.includes("#") ? 0 : 1; } 

    const key = str + "-" + groups.join(",");
    if (this.cache[key]) { return this.cache[key]; }

    let re = 0;
    const c = str[0];

     // if we start with a . (or a ?), trim the first character
    if (c === "." || c === "?") { 
      re += this.getPermutationsRecursive(str.slice(1), groups);
    }

    // if we start with a # (or a ?), check for a group
    if (c === "#" || c === "?") { 

      const check1 = str.length >= groups[0]; // must be enough remaining characters
      const check2 = !str.slice(0, groups[0]).includes("."); // does the slice contain a "."
      const check3 = str[groups[0]] !== "#"; // the following character must not be #

      if (check1 && check2 && check3) {
        re += this.getPermutationsRecursive(str.slice(groups[0] + 1), groups.slice(1))
      }
    }

    this.cache[key] = re;
    return re;
  }
}

class ConditionRecord {

  str: string;
  groups: number[];
  permutations: number = 0;

  constructor(line: string) {
    const split = line.split(" ");
    this.str = split[0];
    this.groups = split[1].split(",").map(s => parseInt(s));
  }
}
