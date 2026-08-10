// ============================================================
// AVATARS
//
// The four animal guardians used to double as profile pictures. They are now
// CyberMajlis characters only: they have jobs there and they do not travel,
// while an avatar follows a child across all three majalis.
//
// Accounts created before that change still hold an animal path in Firestore.
// Rather than migrate every document, we resolve on read: a legacy value maps
// to a Hamad portrait, deterministically, so a returning child sees the same
// face every time instead of a random one.
// ============================================================

export const HAMAD_AVATARS = [
  "/characters/HamadAvatars/hamad-1.png",
  "/characters/HamadAvatars/hamad-2.png",
  "/characters/HamadAvatars/hamad-3.png",
  "/characters/HamadAvatars/hamad-4.png",
] as const;

export const DEFAULT_AVATAR = HAMAD_AVATARS[0];

/** Old animal picture -> the Hamad a returning account now shows. */
const LEGACY: Record<string, string> = {
  "/characters/oryx.jpeg":         HAMAD_AVATARS[0],
  "/characters/fox.jpeg":          HAMAD_AVATARS[1],
  "/characters/falcon.jpeg":       HAMAD_AVATARS[2],
  "/characters/ArabianHorse.jpeg": HAMAD_AVATARS[3],
  "/characters/oryx.GIF":          HAMAD_AVATARS[0],
  "/characters/fox.GIF":           HAMAD_AVATARS[1],
  "/characters/saqr.GIF":          HAMAD_AVATARS[2],
  "/characters/hisan.GIF":         HAMAD_AVATARS[3],
};

/**
 * What to actually show for a stored avatar value.
 * Empty, missing or legacy all resolve to a Hamad portrait.
 */
export function resolveAvatar(stored?: string | null): string {
  if (!stored) return DEFAULT_AVATAR;
  if (LEGACY[stored]) return LEGACY[stored];
  return stored;
}

/** True when the stored value is one of the retired animal pictures. */
export const isLegacyAvatar = (stored?: string | null) => !!stored && stored in LEGACY;
