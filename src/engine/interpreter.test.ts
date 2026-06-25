import { describe, expect, it } from 'vitest';
import { run } from './interpreter';
import type { Instruction, Level } from './types';

function makeLevel(overrides: Partial<Level> = {}): Level {
  return {
    id: 'test',
    title: 'Test Level',
    description: '',
    input: [],
    expectedOutput: [],
    floorSize: 0,
    allowedInstructions: [],
    ...overrides,
  };
}

describe('INBOX / OUTBOX', () => {
  it('copies input straight to output', () => {
    const program: Instruction[] = [
      { type: 'LOOP', body: [{ type: 'INBOX' }, { type: 'OUTBOX' }] },
    ];
    const level = makeLevel({ input: [1, 2, 3], expectedOutput: [1, 2, 3] });

    const result = run(program, level);

    expect(result.status).toBe('passed');
    expect(result.outbox).toEqual([1, 2, 3]);
  });

  it('fails when output does not match', () => {
    const program: Instruction[] = [
      { type: 'LOOP', body: [{ type: 'INBOX' }, { type: 'OUTBOX' }] },
    ];
    const level = makeLevel({ input: [1, 2], expectedOutput: [1, 99] });

    const result = run(program, level);

    expect(result.status).toBe('failed');
    expect(result.outbox).toEqual([1, 2]);
  });

  it('halts gracefully when the inbox runs dry mid-loop', () => {
    const program: Instruction[] = [{ type: 'LOOP', body: [{ type: 'INBOX' }, { type: 'OUTBOX' }] }];
    const level = makeLevel({ input: [], expectedOutput: [] });

    const result = run(program, level);

    expect(result.status).toBe('passed');
    expect(result.outbox).toEqual([]);
  });

  it('errors when OUTBOX is used with an empty hand', () => {
    const program: Instruction[] = [{ type: 'OUTBOX' }];
    const level = makeLevel({ input: [], expectedOutput: [] });

    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/empty hand/i);
  });
});

describe('floor tiles', () => {
  it('COPYTO then COPYFROM round-trips a value through a floor tile', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'INBOX' },
      { type: 'COPYFROM', tile: 0 },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [7, 99], expectedOutput: [7], floorSize: 1 });

    const result = run(program, level);

    expect(result.status).toBe('passed');
  });

  it('errors when reading from an empty floor tile', () => {
    const program: Instruction[] = [{ type: 'COPYFROM', tile: 0 }];
    const level = makeLevel({ floorSize: 1 });

    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/empty/i);
  });

  it('errors when referencing a floor tile that does not exist on the level', () => {
    const program: Instruction[] = [{ type: 'INBOX' }, { type: 'COPYTO', tile: 5 }];
    const level = makeLevel({ input: [1], floorSize: 1 });

    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/no floor tile/i);
  });
});

describe('arithmetic', () => {
  it('ADD sums the held value with a floor tile', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'INBOX' },
      { type: 'ADD', tile: 0 },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [4, 5], expectedOutput: [9], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });

  it('SUB subtracts a floor tile from the held value, allowing negatives', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'INBOX' },
      { type: 'SUB', tile: 0 },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [10, 3], expectedOutput: [-7], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });

  it('BUMPUP increments a floor tile in place and leaves the new value in hand', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'BUMPUP', tile: 0 },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [9], expectedOutput: [10], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });

  it('BUMPDOWN decrements a floor tile in place and leaves the new value in hand', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'BUMPDOWN', tile: 0 },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [9], expectedOutput: [8], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });

  it('errors when ADD is used with an empty hand', () => {
    const program: Instruction[] = [{ type: 'ADD', tile: 0 }];
    const level = makeLevel({ floorSize: 1 });
    // tile 0 has no value either, but the empty-hand check should fire first
    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/empty hand/i);
  });
});

describe('IF / ELSE', () => {
  it('takes the then-branch when the condition holds', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      {
        type: 'IF',
        condition: 'ZERO',
        then: [{ type: 'INBOX' }],
        else: [],
      },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [0, 42], expectedOutput: [42] });

    expect(run(program, level).status).toBe('passed');
  });

  it('takes the else-branch when the condition does not hold', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      {
        type: 'IF',
        condition: 'ZERO',
        then: [{ type: 'INBOX' }],
        else: [],
      },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [5], expectedOutput: [5] });

    expect(run(program, level).status).toBe('passed');
  });

  it('routes negative values into the NEGATIVE branch', () => {
    // tile 0 is deliberately left empty, so taking `then` surfaces as an error -
    // proving the branch that actually ran.
    const program: Instruction[] = [
      { type: 'INBOX' },
      {
        type: 'IF',
        condition: 'NEGATIVE',
        then: [{ type: 'SUB', tile: 0 }],
        else: [],
      },
      { type: 'OUTBOX' },
    ];
    const level = makeLevel({ input: [-3], expectedOutput: [-3], floorSize: 1 });

    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/empty/i);
  });

  it('routes non-negative values into the else branch', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      {
        type: 'IF',
        condition: 'NOT_NEGATIVE',
        then: [{ type: 'OUTBOX' }],
        else: [{ type: 'SUB', tile: 0 }],
      },
    ];
    const level = makeLevel({ input: [3], expectedOutput: [3], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });
});

describe('LOOP', () => {
  it('drains the inbox, doubling each value via a floor tile', () => {
    const program: Instruction[] = [
      {
        type: 'LOOP',
        body: [
          { type: 'INBOX' },
          { type: 'COPYTO', tile: 0 },
          { type: 'ADD', tile: 0 },
          { type: 'OUTBOX' },
        ],
      },
    ];
    const level = makeLevel({ input: [1, 2, 3], expectedOutput: [2, 4, 6], floorSize: 1 });

    expect(run(program, level).status).toBe('passed');
  });

  it('trips the step guard on a loop that never reaches INBOX', () => {
    const program: Instruction[] = [
      { type: 'INBOX' },
      { type: 'COPYTO', tile: 0 },
      { type: 'LOOP', body: [{ type: 'COPYFROM', tile: 0 }] },
    ];
    const level = makeLevel({ input: [1], floorSize: 1 });

    const result = run(program, level);

    expect(result.status).toBe('error');
    expect(result.error).toMatch(/too long/i);
  });
});
