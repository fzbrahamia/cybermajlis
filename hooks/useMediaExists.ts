"use client";

/* Does this media file actually exist?
 *
 * A <video> onError does NOT fire reliably for a 404 — tested twice against a
 * genuinely missing file and both times an empty player rendered and no error
 * event arrived. Since films are gitignored (see public/MEDIA.md), a fresh
 * clone has every src but none of the files, so "the player is just black" is
 * the default experience rather than an edge case.
 *
 * One HEAD request settles it. Optimistic while it is in flight, so a present
 * film never flashes a placeholder first. A network failure is treated as
 * present: a blip should not hide a video that is really there. Only an
 * outright "not found" counts as missing.
 */

import { useEffect, useState } from "react";

export type MediaState = "checking" | "present" | "missing";

export function useMediaExists(src: string | null | undefined): MediaState {
  const [state, setState] = useState<MediaState>(src ? "checking" : "missing");

  useEffect(() => {
    if (!src) { setState("missing"); return; }
    let alive = true;
    setState("checking");
    fetch(src, { method: "HEAD" })
      .then(r => { if (alive) setState(r.status === 404 || r.status === 403 ? "missing" : "present"); })
      .catch(() => { if (alive) setState("present"); })
      .finally(() => {});
    return () => { alive = false; };
  }, [src]);

  return state;
}
