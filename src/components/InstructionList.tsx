import type { Condition, InstructionType } from '../engine/types';
import { createInstruction, type EditorInstruction } from './editorTypes';
import { CONDITION_LABELS, INSTRUCTION_LABELS } from './instructionLabels';

interface InstructionListProps {
  instructions: EditorInstruction[];
  onChange: (next: EditorInstruction[]) => void;
  allowed: InstructionType[];
  floorSize: number;
  activeId?: string;
}

export function InstructionList({ instructions, onChange, allowed, floorSize, activeId }: InstructionListProps) {
  function updateAt(index: number, next: EditorInstruction): void {
    const copy = [...instructions];
    copy[index] = next;
    onChange(copy);
  }

  function removeAt(index: number): void {
    onChange(instructions.filter((_, i) => i !== index));
  }

  return (
    <div className="instruction-list">
      {instructions.map((instruction, index) => (
        <InstructionRow
          key={instruction.id}
          instruction={instruction}
          floorSize={floorSize}
          allowed={allowed}
          activeId={activeId}
          onChange={(next) => updateAt(index, next)}
          onRemove={() => removeAt(index)}
        />
      ))}
      <div className="instruction-palette">
        {allowed.map((type) => (
          <button
            key={type}
            type="button"
            className="palette-button"
            onClick={() => onChange([...instructions, createInstruction(type)])}
          >
            + {INSTRUCTION_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

function TileSelect({
  tile,
  floorSize,
  onChange,
}: {
  tile: number;
  floorSize: number;
  onChange: (tile: number) => void;
}) {
  if (floorSize === 0) return null;
  return (
    <select value={tile} onChange={(e) => onChange(Number(e.target.value))}>
      {Array.from({ length: floorSize }, (_, t) => (
        <option key={t} value={t}>
          Tile {t}
        </option>
      ))}
    </select>
  );
}

function InstructionRow({
  instruction,
  floorSize,
  allowed,
  activeId,
  onChange,
  onRemove,
}: {
  instruction: EditorInstruction;
  floorSize: number;
  allowed: InstructionType[];
  activeId?: string;
  onChange: (next: EditorInstruction) => void;
  onRemove: () => void;
}) {
  const isActive = instruction.id === activeId;

  return (
    <div className={`instruction-row${isActive ? ' instruction-row--active' : ''}`}>
      <div className="instruction-row__header">
        <span className="instruction-row__label">{INSTRUCTION_LABELS[instruction.type]}</span>
        {(instruction.type === 'COPYFROM' ||
          instruction.type === 'COPYTO' ||
          instruction.type === 'ADD' ||
          instruction.type === 'SUB' ||
          instruction.type === 'BUMPUP' ||
          instruction.type === 'BUMPDOWN') && (
          <TileSelect
            tile={instruction.tile}
            floorSize={floorSize}
            onChange={(tile) => onChange({ ...instruction, tile })}
          />
        )}
        {instruction.type === 'IF' && (
          <select
            value={instruction.condition}
            onChange={(e) => onChange({ ...instruction, condition: e.target.value as Condition })}
          >
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        )}
        <button type="button" className="instruction-row__remove" onClick={onRemove} aria-label="Remove instruction">
          ×
        </button>
      </div>
      {instruction.type === 'IF' && (
        <div className="instruction-row__branches">
          <div className="instruction-row__branch">
            <div className="instruction-row__branch-label">then</div>
            <InstructionList
              instructions={instruction.then}
              allowed={allowed}
              floorSize={floorSize}
              activeId={activeId}
              onChange={(next) => onChange({ ...instruction, then: next })}
            />
          </div>
          <div className="instruction-row__branch">
            <div className="instruction-row__branch-label">else</div>
            <InstructionList
              instructions={instruction.else}
              allowed={allowed}
              floorSize={floorSize}
              activeId={activeId}
              onChange={(next) => onChange({ ...instruction, else: next })}
            />
          </div>
        </div>
      )}
      {instruction.type === 'LOOP' && (
        <div className="instruction-row__branches">
          <div className="instruction-row__branch">
            <InstructionList
              instructions={instruction.body}
              allowed={allowed}
              floorSize={floorSize}
              activeId={activeId}
              onChange={(next) => onChange({ ...instruction, body: next })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
