'use client';

// ============================================================
// AVATAR PICKER
//
// Hamad and Rouda, the two children the stories follow. They replaced the four
// animal guardians here on purpose: the guardians have jobs inside CyberMajlis
// and do not travel, but an avatar follows a child across all three majalis, so
// it has to be someone who belongs in all of them.
//
// One account, one avatar, every majlis. The value stored is the image path.
// ============================================================

import { useLocale } from 'next-intl';

export const AVATARS = [
  { id: 'hamad-1', src: '/characters/HamadAvatars/hamad-1.png', who: 'hamad' },
  { id: 'hamad-2', src: '/characters/HamadAvatars/hamad-2.png', who: 'hamad' },
  { id: 'hamad-3', src: '/characters/HamadAvatars/hamad-3.png', who: 'hamad' },
  { id: 'hamad-4', src: '/characters/HamadAvatars/hamad-4.png', who: 'hamad' },
  { id: 'rouda-1', src: '/characters/RoudaAvatars/rouda-1.png', who: 'rouda' },
  { id: 'rouda-2', src: '/characters/RoudaAvatars/rouda-2.png', who: 'rouda' },
  { id: 'rouda-3', src: '/characters/RoudaAvatars/rouda-3.png', who: 'rouda' },
  { id: 'rouda-4', src: '/characters/RoudaAvatars/rouda-4.png', who: 'rouda' },
] as const;

const NAMES = {
  hamad: { en: 'Hamad', ar: 'حمد' },
  rouda: { en: 'Rouda', ar: 'روضة' },
} as const;

export default function CharacterSelection({
  onSelect,
  value,
}: {
  onSelect: (avatar: string) => void;
  value?: string;
}) {
  const locale = useLocale();
  const isAR = locale === 'ar';

  return (
    <div>
      <p style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: '0.95rem', color: 'rgba(106,70,64,0.85)',
        textAlign: 'center', margin: '0 0 1rem',
      }}>
        {isAR ? 'اختر شخصيتك' : 'Choose your character'}
      </p>

      <div
        role="radiogroup"
        aria-label={isAR ? 'اختر شخصيتك' : 'Choose your character'}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '0.7rem',
        }}
      >
        {AVATARS.map(a => {
          const on = value === a.src;
          const name = NAMES[a.who][isAR ? 'ar' : 'en'];
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={name}
              onClick={() => onSelect(a.src)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '0.55rem 0.35rem 0.5rem',
                borderRadius: 16, cursor: 'pointer',
                background: on ? 'rgba(139,38,53,0.08)' : 'rgba(99,32,36,0.03)',
                border: `1.5px solid ${on ? 'rgba(139,38,53,0.55)' : 'rgba(99,32,36,0.14)'}`,
                boxShadow: on ? '0 6px 18px rgba(99,32,36,0.14)' : 'none',
                transition: 'transform .18s ease, background .18s ease, border-color .18s ease',
                transform: on ? 'translateY(-2px)' : 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.src}
                alt=""
                style={{
                  width: '100%', aspectRatio: '1', objectFit: 'contain',
                  borderRadius: 12,
                }}
              />
              <span style={{
                fontFamily: "'Cinzel', serif", fontSize: 10, fontWeight: 700,
                letterSpacing: '0.06em',
                color: on ? '#7a1e22' : 'rgba(106,70,64,0.7)',
              }}>
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
