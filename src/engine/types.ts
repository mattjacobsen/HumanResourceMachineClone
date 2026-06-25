// The game only deals in whole numbers for now (letters/characters are a later extension).
export type Value = number;

export type Condition = 'ZERO' | 'NOT_ZERO' | 'NEGATIVE' | 'NOT_NEGATIVE';

// Control flow is expressed as nested blocks (if/else, loop) rather than the
// original game's jump-to-line arrows. Same underlying machine, gentler mental model.
// `id` is an optional pass-through the engine never reads - it lets the UI match a
// trace entry back to the editor block that produced it, for step-playback highlighting.
export type Instruction =
  | { id?: string; type: 'INBOX' }
  | { id?: string; type: 'OUTBOX' }
  | { id?: string; type: 'COPYFROM'; tile: number }
  | { id?: string; type: 'COPYTO'; tile: number }
  | { id?: string; type: 'ADD'; tile: number }
  | { id?: string; type: 'SUB'; tile: number }
  | { id?: string; type: 'BUMPUP'; tile: number }
  | { id?: string; type: 'BUMPDOWN'; tile: number }
  | { id?: string; type: 'IF'; condition: Condition; then: Instruction[]; else: Instruction[] }
  | { id?: string; type: 'LOOP'; body: Instruction[] };

export type InstructionType = Instruction['type'];

export interface Level {
  id: string;
  title: string;
  description: string;
  input: Value[];
  expectedOutput: Value[];
  floorSize: number;
  allowedInstructions: InstructionType[];
}

export interface RunState {
  inbox: Value[];
  outbox: Value[];
  floor: (Value | undefined)[];
  hand: Value | undefined;
}

export type RunStatus = 'passed' | 'failed' | 'error';

// One visible action, for animating the worker step by step in the UI.
export interface TraceEntry {
  instruction: Instruction;
  hand: Value | undefined;
  inbox: Value[];
  outbox: Value[];
  floor: (Value | undefined)[];
}

export interface RunResult {
  status: RunStatus;
  outbox: Value[];
  steps: number;
  error?: string;
  trace: TraceEntry[];
}
