import type { TraceEntry } from '../engine/types';

export function captionFor(entry: TraceEntry | undefined): string {
  if (!entry) return 'Ready when you are.';
  const { instruction, hand, outbox } = entry;
  switch (instruction.type) {
    case 'INBOX':
      return `Picked up ${hand} from the Inbox.`;
    case 'OUTBOX':
      return `Dropped ${outbox[outbox.length - 1]} in the Outbox.`;
    case 'COPYFROM':
      return `Picked up ${hand} from floor tile ${instruction.tile}.`;
    case 'COPYTO':
      return `Put ${hand} down on floor tile ${instruction.tile}.`;
    case 'ADD':
      return `Added floor tile ${instruction.tile} - now holding ${hand}.`;
    case 'SUB':
      return `Subtracted floor tile ${instruction.tile} - now holding ${hand}.`;
    case 'BUMPUP':
      return `Bumped floor tile ${instruction.tile} up - now holding ${hand}.`;
    case 'BUMPDOWN':
      return `Bumped floor tile ${instruction.tile} down - now holding ${hand}.`;
    default:
      return '';
  }
}
