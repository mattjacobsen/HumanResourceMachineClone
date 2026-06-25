import type { Level } from '../engine/types';

// Levels are ordered to introduce exactly one new idea at a time, with an
// extra repetition level after each new mechanic before the next one shows up -
// that's the main lever for flattening the original game's difficulty curve.
export const levels: Level[] = [
  {
    id: 'mail-room',
    title: 'Mail Room',
    description: 'Take everything from the INBOX and put it straight in the OUTBOX.',
    input: [3, 9, 5],
    expectedOutput: [3, 9, 5],
    floorSize: 0,
    allowedInstructions: ['INBOX', 'OUTBOX', 'LOOP'],
  },
  {
    id: 'busy-mail-room',
    title: 'Busy Mail Room',
    description: 'Same job, just a lot more mail today.',
    input: [4, 1, 8, 2, 7, 6, 3, 9],
    expectedOutput: [4, 1, 8, 2, 7, 6, 3, 9],
    floorSize: 0,
    allowedInstructions: ['INBOX', 'OUTBOX', 'LOOP'],
  },
  {
    id: 'coffee-break',
    title: 'Coffee Break',
    description: 'Two coworkers hand you a coffee each. Serve them in the opposite order they asked.',
    input: [5, 9],
    expectedOutput: [9, 5],
    floorSize: 1,
    allowedInstructions: ['INBOX', 'OUTBOX', 'COPYFROM', 'COPYTO'],
  },
  {
    id: 'double-trouble',
    title: 'Double Trouble',
    description: 'Every number from the INBOX needs to be doubled before it goes in the OUTBOX.',
    input: [1, 2, 3, 4, 5],
    expectedOutput: [2, 4, 6, 8, 10],
    floorSize: 1,
    allowedInstructions: ['INBOX', 'OUTBOX', 'COPYFROM', 'COPYTO', 'ADD', 'LOOP'],
  },
];
