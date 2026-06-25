import type { Condition, Instruction, InstructionType } from '../engine/types';

// Mirrors Instruction, but every node carries a stable id so the editor can
// add/remove/reorder rows without instructions becoming ambiguous.
export type EditorInstruction =
  | { id: string; type: 'INBOX' }
  | { id: string; type: 'OUTBOX' }
  | { id: string; type: 'COPYFROM'; tile: number }
  | { id: string; type: 'COPYTO'; tile: number }
  | { id: string; type: 'ADD'; tile: number }
  | { id: string; type: 'SUB'; tile: number }
  | { id: string; type: 'BUMPUP'; tile: number }
  | { id: string; type: 'BUMPDOWN'; tile: number }
  | { id: string; type: 'IF'; condition: Condition; then: EditorInstruction[]; else: EditorInstruction[] }
  | { id: string; type: 'LOOP'; body: EditorInstruction[] };

function newId(): string {
  return crypto.randomUUID();
}

export function createInstruction(type: InstructionType): EditorInstruction {
  switch (type) {
    case 'INBOX':
    case 'OUTBOX':
      return { id: newId(), type };
    case 'COPYFROM':
    case 'COPYTO':
    case 'ADD':
    case 'SUB':
    case 'BUMPUP':
    case 'BUMPDOWN':
      return { id: newId(), type, tile: 0 };
    case 'IF':
      return { id: newId(), type, condition: 'ZERO', then: [], else: [] };
    case 'LOOP':
      return { id: newId(), type, body: [] };
  }
}

export function stripIds(list: EditorInstruction[]): Instruction[] {
  return list.map(stripId);
}

function stripId(instruction: EditorInstruction): Instruction {
  switch (instruction.type) {
    case 'IF':
      return {
        id: instruction.id,
        type: 'IF',
        condition: instruction.condition,
        then: stripIds(instruction.then),
        else: stripIds(instruction.else),
      };
    case 'LOOP':
      return { id: instruction.id, type: 'LOOP', body: stripIds(instruction.body) };
    case 'INBOX':
    case 'OUTBOX':
      return { id: instruction.id, type: instruction.type };
    case 'COPYFROM':
    case 'COPYTO':
    case 'ADD':
    case 'SUB':
    case 'BUMPUP':
    case 'BUMPDOWN':
      return { id: instruction.id, type: instruction.type, tile: instruction.tile };
  }
}
