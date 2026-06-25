import type { Condition, InstructionType } from '../engine/types';

export const INSTRUCTION_LABELS: Record<InstructionType, string> = {
  INBOX: 'Take from Inbox',
  OUTBOX: 'Put in Outbox',
  COPYFROM: 'Pick up from Floor',
  COPYTO: 'Put down on Floor',
  ADD: 'Add Floor Tile',
  SUB: 'Subtract Floor Tile',
  BUMPUP: 'Bump Floor Tile Up',
  BUMPDOWN: 'Bump Floor Tile Down',
  IF: 'If hand...',
  LOOP: 'Repeat Forever',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  ZERO: 'is Zero',
  NOT_ZERO: 'is Not Zero',
  NEGATIVE: 'is Negative',
  NOT_NEGATIVE: 'is Not Negative',
};
