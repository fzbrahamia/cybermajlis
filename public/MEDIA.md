# Media that is NOT in this repository

Video is gitignored (see `.gitignore`). The repo already carries ~1.8GB of
history from films committed before that rule existed; the files below would
have added ~760MB more, and git history cannot be trimmed afterwards without
rewriting it for everyone.

**A fresh clone will be missing these.** Keep a copy somewhere backed up, and
add a line here whenever you add a film. What the page does without the file
is not the same everywhere:

| File | Size | Used by | Without it |
|---|---|---|---|
| `/Hospital-case.mp4` | 191M | WannaCry case, `/dashboard/cases/hospital` | Falls back, but see the note below |
| `/concepts/Hole.mp4` | 157M | Zero day concept, `/dashboard/concepts/zero-day` | Falls back, but see the note below |
| `/quantum/locked-chest.mp4` | 158M | Quantum Majlis path | **No fallback.** An empty player |
| `/quantum/spinning-coin.mp4` | 257M | Quantum Majlis path | **No fallback.** An empty player |

The two fallbacks above hang off a `<video>` `onError`, and a media error event
is not something to depend on: it did not fire when this was tested against a
missing file, and an empty player rendered instead. The Vastaamo case avoids
the problem by declaring `videoPending: true` in the data rather than waiting
to be told at runtime. If a film here is ever retired for good, prefer that
route. Quantum has no handling at all.

## Not made yet

| Expected path | For |
|---|---|
| `/cases/vastaamo.mp4` | The Vastaamo case. Until it exists the page holds the slot open and says "The film is being made" — that is the `videoPending` flag on the case in `app/lib/cyberData.ts`. Drop the file in and delete the flag. |

## Films that ARE committed

The 28 films under `public/arabicVids/`, `public/lessons/vids/`, `public/demos/`
and `public/posters/` went in before the rule and stay tracked — gitignore does
not untrack anything, so nothing that works today stops working.
