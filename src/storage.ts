import type { EditorInstruction } from './components/editorTypes';

const STORAGE_KEY = 'office-quest-save-v1';

export interface SaveData {
  programs: Record<string, EditorInstruction[]>;
  solved: string[];
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { programs: {}, solved: [] };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return { programs: parsed.programs ?? {}, solved: parsed.solved ?? [] };
  } catch {
    return { programs: {}, solved: [] };
  }
}

export function persistSave(data: SaveData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
