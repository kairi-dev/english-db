export type EntryId = string;

export interface Entry {
  id: EntryId;
  /** Text shown in the list row */
  title: string;
  /** Description shown when the row is expanded */
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function createEntryId(): EntryId {
  return `entry_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyEntry(): Entry {
  const now = Date.now();
  return {
    id: createEntryId(),
    title: '',
    content: '',
    createdAt: now,
    updatedAt: now,
  };
}
