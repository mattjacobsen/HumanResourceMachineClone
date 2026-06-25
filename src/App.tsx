import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { InstructionList } from './components/InstructionList';
import { captionFor } from './components/captionFor';
import { stripIds, type EditorInstruction } from './components/editorTypes';
import { OfficeFloor } from './components/OfficeFloor';
import { run } from './engine/interpreter';
import type { RunResult } from './engine/types';
import { levels } from './levels/levels';
import { loadSave, persistSave } from './storage';

function App() {
  const [save, setSave] = useState(loadSave);
  const [selectedLevelId, setSelectedLevelId] = useState(levels[0].id);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);

  const level = useMemo(() => levels.find((l) => l.id === selectedLevelId)!, [selectedLevelId]);
  const program = save.programs[selectedLevelId] ?? [];
  const trace = runResult?.trace ?? [];
  const currentEntry = stepIndex >= 0 ? trace[stepIndex] : undefined;

  useEffect(() => {
    persistSave(save);
  }, [save]);

  function setProgram(next: EditorInstruction[]): void {
    setSave((prev) => ({ ...prev, programs: { ...prev.programs, [selectedLevelId]: next } }));
  }

  function selectLevel(id: string): void {
    setSelectedLevelId(id);
    setRunResult(null);
    setStepIndex(-1);
  }

  function handleRun(): void {
    const result = run(stripIds(program), level);
    setRunResult(result);
    setStepIndex(result.trace.length > 0 ? 0 : -1);
    if (result.status === 'passed' && !save.solved.includes(level.id)) {
      setSave((prev) => ({ ...prev, solved: [...prev.solved, level.id] }));
    }
  }

  function handleReset(): void {
    setRunResult(null);
    setStepIndex(-1);
  }

  const snapshot = currentEntry ?? {
    inbox: level.input,
    outbox: [],
    floor: new Array(level.floorSize).fill(undefined),
    hand: undefined,
  };
  const showError = runResult?.status === 'error' && stepIndex === trace.length - 1;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Office Quest</h1>
        <p className="app__tagline">Program the little office worker. Inspired by Human Resource Machine.</p>
      </header>

      <div className="app__body">
        <nav className="level-select">
          {levels.map((l) => (
            <button
              key={l.id}
              type="button"
              className={`level-select__item${l.id === selectedLevelId ? ' level-select__item--active' : ''}`}
              onClick={() => selectLevel(l.id)}
            >
              {save.solved.includes(l.id) ? '✓ ' : ''}
              {l.title}
            </button>
          ))}
        </nav>

        <main className="app__main">
          <section className="level-brief">
            <h2>{level.title}</h2>
            <p>{level.description}</p>
          </section>

          <OfficeFloor
            inbox={snapshot.inbox}
            outbox={snapshot.outbox}
            floor={snapshot.floor}
            hand={snapshot.hand}
            caption={showError ? runResult!.error! : captionFor(currentEntry)}
          />

          <div className="run-controls">
            <button type="button" onClick={handleRun}>
              Run
            </button>
            <button type="button" onClick={handleReset} disabled={!runResult}>
              Reset
            </button>
            <button type="button" onClick={() => setStepIndex((i) => Math.max(0, i - 1))} disabled={stepIndex <= 0}>
              ← Step
            </button>
            <button
              type="button"
              onClick={() => setStepIndex((i) => Math.min(trace.length - 1, i + 1))}
              disabled={stepIndex >= trace.length - 1}
            >
              Step →
            </button>
            {runResult && (
              <span className={`run-status run-status--${runResult.status}`}>
                {runResult.status === 'passed' && 'Level complete!'}
                {runResult.status === 'failed' &&
                  `Not quite - expected [${level.expectedOutput.join(', ')}] but got [${runResult.outbox.join(', ')}]`}
                {runResult.status === 'error' && runResult.error}
              </span>
            )}
          </div>

          <section className="editor">
            <h3>Your Program</h3>
            <InstructionList
              instructions={program}
              onChange={setProgram}
              allowed={level.allowedInstructions}
              floorSize={level.floorSize}
              activeId={currentEntry?.instruction.id}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
