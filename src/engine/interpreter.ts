import type { Condition, Instruction, Level, RunResult, RunState, TraceEntry, Value } from './types';

// A program that loops without ever halting would otherwise hang the browser tab.
const MAX_STEPS = 10_000;

class Halt extends Error {}
class StepLimitExceeded extends Error {}
class RuntimeFault extends Error {}

function checkCondition(condition: Condition, value: Value): boolean {
  switch (condition) {
    case 'ZERO':
      return value === 0;
    case 'NOT_ZERO':
      return value !== 0;
    case 'NEGATIVE':
      return value < 0;
    case 'NOT_NEGATIVE':
      return value >= 0;
  }
}

function arraysEqual(a: Value[], b: Value[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function run(program: Instruction[], level: Level): RunResult {
  const state: RunState = {
    inbox: [...level.input],
    outbox: [],
    floor: new Array(level.floorSize).fill(undefined),
    hand: undefined,
  };
  const trace: TraceEntry[] = [];
  let steps = 0;

  function requireHand(): Value {
    if (state.hand === undefined) {
      throw new RuntimeFault('You tried to use an empty hand! Pick something up first.');
    }
    return state.hand;
  }

  function requireTile(tile: number): Value {
    if (tile < 0 || tile >= state.floor.length) {
      throw new RuntimeFault(`There is no floor tile ${tile} on this level.`);
    }
    const value = state.floor[tile];
    if (value === undefined) {
      throw new RuntimeFault(`Floor tile ${tile} is empty.`);
    }
    return value;
  }

  function setTile(tile: number, value: Value): void {
    if (tile < 0 || tile >= state.floor.length) {
      throw new RuntimeFault(`There is no floor tile ${tile} on this level.`);
    }
    state.floor[tile] = value;
  }

  function recordStep(instruction: Instruction): void {
    trace.push({
      instruction,
      hand: state.hand,
      inbox: [...state.inbox],
      outbox: [...state.outbox],
      floor: [...state.floor],
    });
  }

  function tick(): void {
    steps++;
    if (steps > MAX_STEPS) {
      throw new StepLimitExceeded();
    }
  }

  function exec(instructions: Instruction[]): void {
    for (const instruction of instructions) {
      execOne(instruction);
    }
  }

  function execOne(instruction: Instruction): void {
    tick();
    switch (instruction.type) {
      case 'INBOX': {
        if (state.inbox.length === 0) {
          throw new Halt();
        }
        state.hand = state.inbox.shift();
        recordStep(instruction);
        return;
      }
      case 'OUTBOX': {
        const hand = requireHand();
        state.outbox.push(hand);
        state.hand = undefined;
        recordStep(instruction);
        return;
      }
      case 'COPYFROM': {
        state.hand = requireTile(instruction.tile);
        recordStep(instruction);
        return;
      }
      case 'COPYTO': {
        setTile(instruction.tile, requireHand());
        recordStep(instruction);
        return;
      }
      case 'ADD': {
        state.hand = requireHand() + requireTile(instruction.tile);
        recordStep(instruction);
        return;
      }
      case 'SUB': {
        state.hand = requireHand() - requireTile(instruction.tile);
        recordStep(instruction);
        return;
      }
      case 'BUMPUP': {
        const next = requireTile(instruction.tile) + 1;
        setTile(instruction.tile, next);
        state.hand = next;
        recordStep(instruction);
        return;
      }
      case 'BUMPDOWN': {
        const next = requireTile(instruction.tile) - 1;
        setTile(instruction.tile, next);
        state.hand = next;
        recordStep(instruction);
        return;
      }
      case 'IF': {
        const branch = checkCondition(instruction.condition, requireHand()) ? instruction.then : instruction.else;
        exec(branch);
        return;
      }
      case 'LOOP': {
        // Always runs until INBOX halts naturally (or the step guard trips) -
        // mirrors the original game's "loop forever, take from inbox" idiom.
        while (true) {
          exec(instruction.body);
        }
      }
    }
  }

  try {
    exec(program);
  } catch (error) {
    if (error instanceof Halt) {
      // Reaching an empty inbox is a normal, graceful end of the run.
    } else if (error instanceof StepLimitExceeded) {
      return {
        status: 'error',
        outbox: state.outbox,
        steps,
        trace,
        error: 'Your program ran too long - check for a loop that never stops.',
      };
    } else if (error instanceof RuntimeFault) {
      return { status: 'error', outbox: state.outbox, steps, trace, error: error.message };
    } else {
      throw error;
    }
  }

  const passed = arraysEqual(state.outbox, level.expectedOutput);
  return { status: passed ? 'passed' : 'failed', outbox: state.outbox, steps, trace };
}
