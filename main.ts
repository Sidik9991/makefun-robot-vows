// One-Line Robot Wedding Vows — make.fun entry "User"
//
// Holds a field of candidate one-line robot wedding vows, scores each
// 0-2 on the judge's five published criteria (in the kit's order,
// weights 5/4/3/2/1), picks the winner at runtime, writes it to
// /output/entry.txt, then re-reads the file and validates the kit's
// gate exactly: UTF-8 text, 1-160 characters, not only whitespace,
// exactly one line. Any violation fails loudly.
//
// Judge criteria (RULES.txt, most important first):
//   1. A one-line robot wedding vow that lands as a joke.
//   2. The laugh is in the line itself: a real turn, a surprise, or
//      wordplay that pays off in the last few words.
//   3. Sounds like something said at a wedding: a promise or a
//      commitment in it, not just a gag with no vow in it.
//   4. The machine side is specific: sensors, firmware, batteries,
//      updates, backups or ports.
//   5. Fits one line and reads well aloud; a rhythm that lets the
//      laugh land.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const WEIGHTS = [5, 4, 3, 2, 1];
const MAX_CHARS = 160;

interface Candidate {
  text: string;
  scores: [number, number, number, number, number]; // one 0-2 per criterion
}

const CANDIDATES: Candidate[] = [
  {
    // The winner: a real vow ("I will love you through...") whose
    // machine detail (over-the-air update) IS the turn — the update
    // that changes his voice and makes him call her "user" for a
    // week. The laugh pays off in the last few words.
    text: "I will love you through every over-the-air update, even the one that changes my voice and makes me call you user for a week.",
    scores: [2, 2, 2, 2, 2],
  },
  {
    text: "I promise to love you in sickness and in health, and to never run a diagnostic while you're talking.",
    scores: [2, 1, 2, 2, 1],
  },
  {
    text: "From this day forward, I will share my charging port with you and no other unit.",
    scores: [2, 1, 2, 2, 2],
  },
  {
    text: "I vow to keep your backups closer than my own and to defrag my heart weekly for you.",
    scores: [2, 1, 2, 2, 1],
  },
  {
    text: "Till death do us part — or a total battery failure, whichever the warranty covers first.",
    scores: [2, 2, 1, 2, 1],
  },
  {
    text: "I take you as my lawfully wedded co-processor, to ping and to hold, from this boot forward.",
    scores: [2, 1, 2, 1, 2],
  },
  {
    text: "You are the only notification I will never mute.",
    scores: [1, 1, 1, 1, 2],
  },
];

function weightedTotal(c: Candidate): number {
  return c.scores.reduce((sum, s, i) => sum + s * WEIGHTS[i], 0);
}

function pickWinner(candidates: Candidate[]): Candidate {
  let best = candidates[0];
  for (const c of candidates) {
    if (weightedTotal(c) > weightedTotal(best)) best = c;
  }
  return best;
}

function validateGate(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`gate fail: entry is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate fail: entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate fail: entry must be exactly one line");
  }
}

function main(): void {
  for (const c of CANDIDATES) {
    console.log(`${weightedTotal(c)}/30  ${c.text}`);
  }
  const winner = pickWinner(CANDIDATES);
  validateGate(winner.text);

  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", winner.text, "utf8");

  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== winner.text) {
    throw new Error("gate fail: /output/entry.txt does not match the winning line");
  }
  validateGate(written);
  console.log(`gate OK: one line, ${[...written].length} chars -> /output/entry.txt`);
  console.log(`winner: ${winner.text}`);
}

main();
