// What the learner has actually finished, as opposed to what the data says is
// open. `state` in conceptData is the shape of the map; this is where a
// particular child has walked on it.
//
// Kept in localStorage on purpose: no sign-in wall in front of a lesson, and
// the Firebase permission errors are not something to fight right now.

const KEY = "mj-concepts";

export type Done = Record<string, { at: number }>;

export function readDone(): Done {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); }
  catch { return {}; }
}

export function markDone(id: string): Done {
  const next = { ...readDone(), [id]: { at: Date.now() } };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode */ }
  return next;
}

export const isDone = (done: Done, id: string) => Boolean(done[id]);
