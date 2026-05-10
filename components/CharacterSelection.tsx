'use client';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations, useLocale } from 'next-intl';

interface Character {
  id: number;
  name: string;
  role: string;
  backstory: string;
  imageUrl: string;
  videoUrl: string;
}

const characterAssetsEn = [
  { id: 1, imageUrl: '/characters/oryx.jpeg',        videoUrl: '/quotes/oryx.mp4'  },
  { id: 2, imageUrl: '/characters/fox.jpeg',          videoUrl: '/quotes/fox.mp4'   },
  { id: 3, imageUrl: '/characters/falcon.jpeg',       videoUrl: '/quotes/falcon.mp4'},
  { id: 4, imageUrl: '/characters/ArabianHorse.jpeg', videoUrl: '/quotes/horse.mp4' },
];

const characterAssetsAr = [
  { id: 1, imageUrl: '/characters/oryx.jpeg',        videoUrl: '/arabicvids/characters/oryx.mp4'  },
  { id: 2, imageUrl: '/characters/fox.jpeg',          videoUrl: '/arabicvids/characters/fox.mp4'   },
  { id: 3, imageUrl: '/characters/falcon.jpeg',       videoUrl: '/arabicvids/characters/falcon.mp4'},
  { id: 4, imageUrl: '/characters/ArabianHorse.jpeg', videoUrl: '/arabicvids/characters/horse.mp4' },
];

export default function CharacterSelection({ onSelect, value }: { onSelect: (avatar: string) => void; value?: string; }) {
  const [flipped, setFlipped] = useState<number | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const t = useTranslations('CharacterSelection');
  const locale = useLocale();
  const characterAssets = locale === 'ar' ? characterAssetsAr : characterAssetsEn;
  const characters = characterAssets.map((asset, i) => ({
    ...asset,
    name:      t(`characters.${i}.name`),
    role:      t(`characters.${i}.role`),
    backstory: t(`characters.${i}.backstory`),
  }));

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .char-scroll::-webkit-scrollbar { height: 4px; }
      .char-scroll::-webkit-scrollbar-track { background: rgba(99,32,36,0.08); border-radius: 2px; }
      .char-scroll::-webkit-scrollbar-thumb { background: rgba(99,32,36,0.3); border-radius: 2px; }

      .char-card-inner {
        position: relative; width: 100%; height: 100%;
        transition: transform 0.7s cubic-bezier(0.4,0,0.2,1);
        transform-style: preserve-3d;
      }
      .char-card-inner.flipped { transform: rotateY(180deg); }

      .char-face {
        position: absolute; inset: 0;
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        border-radius: 18px;
        overflow: hidden;
      }

      .char-back { transform: rotateY(180deg); }

      .char-selected-badge {
        position: absolute; bottom: 10px; left: 0; right: 0;
        display: flex; justify-content: center;
        z-index: 10;
        animation: badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
      }

      @keyframes badgePop {
        0% { transform: scale(0.7); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const handleMouseEnter = (id: number, index: number) => {
    setFlipped(id);
    const video = videoRefs.current[index];
    if (video) { video.currentTime = 0; video.play().catch(() => {}); }
  };

  const handleMouseLeave = (index: number) => {
    setFlipped(null);
    const video = videoRefs.current[index];
    if (video) video.pause();
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {/* Section label */}
      <div style={{
        fontFamily: "'Cinzel', serif", fontSize: "0.65rem",
        letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(99,32,36,0.5)", textAlign: "center",
        marginBottom: "1rem",
      }}>
        {t('label')}
      </div>

      <div className="char-scroll" style={{
        display: "flex", overflowX: "auto",
        gap: "1rem", padding: "0.5rem 0.25rem 1rem",
        scrollBehavior: "smooth",
      }}>
        {characters.map((char, index) => {
          const isSelected = value === char.imageUrl;
          return (
            <div
              key={char.id}
              onMouseEnter={() => handleMouseEnter(char.id, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onClick={() => onSelect(char.imageUrl)}
              style={{
                flexShrink: 0, width: 210, height: 300,
                perspective: "1200px", cursor: "pointer",
                position: "relative",
                borderRadius: 18,
                outline: isSelected ? "2.5px solid #c5a57e" : "2.5px solid transparent",
                boxShadow: isSelected
                  ? "0 0 0 4px rgba(197,165,126,0.2), 0 12px 32px rgba(99,32,36,0.18)"
                  : "0 6px 24px rgba(99,32,36,0.14), inset 0 1px 0 rgba(255,255,255,0.6)",
                transition: "box-shadow 0.3s, outline 0.3s, transform 0.25s",
              }}
              onMouseOver={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div className={cn("char-card-inner", flipped === char.id && "flipped")}>

                {/* FRONT */}
                <div className="char-face" style={{
                  background: "linear-gradient(160deg, #e8d8c4 0%, #dcc9b0 100%)",
                  border: "1px solid rgba(99,32,36,0.15)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  padding: "1.4rem 1rem", gap: 0,
                }}>
                  {/* Top stripe */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, #632024, #c5a57e)",
                  }} />

                  {/* Avatar */}
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%", overflow: "hidden",
                    border: "3px solid #632024",
                    boxShadow: "0 0 0 4px rgba(197,165,126,0.2)",
                    marginBottom: "1rem", flexShrink: 0,
                  }}>
                    <img src={char.imageUrl} alt={char.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <h3 style={{
                    fontFamily: "'Cinzel', serif", fontSize: "0.9rem",
                    fontWeight: 700, color: "#3e1316",
                    textAlign: "center", marginBottom: "0.3rem", lineHeight: 1.2,
                  }}>{char.name}</h3>

                  <div style={{
                    fontFamily: "'Cinzel', serif", fontSize: "0.55rem",
                    letterSpacing: "0.15em", textTransform: "uppercase",
                    color: "#8B2635", opacity: 0.8, marginBottom: "0.8rem",
                    textAlign: "center",
                  }}>{char.role}</div>

                  <div style={{
                    height: 1, width: 40,
                    background: "linear-gradient(90deg, transparent, #c5a57e, transparent)",
                    marginBottom: "0.8rem",
                  }} />

                  <p style={{
                    fontFamily: "'Crimson Pro', serif", fontSize: "0.82rem",
                    color: "#5C4033", fontStyle: "italic", fontWeight: 300,
                    textAlign: "center", lineHeight: 1.5, padding: "0 0.2rem",
                  }}>{char.backstory}</p>

                  <div style={{
                    position: "absolute", bottom: 10,
                    fontFamily: "'Cinzel', serif", fontSize: "0.55rem",
                    letterSpacing: "0.15em", color: "rgba(99,32,36,0.35)",
                    textTransform: "uppercase",
                  }}>{t('hover_hint')}</div>
                </div>

                {/* BACK */}
                <div className="char-face char-back" style={{
                  background: "#1a0a0b",
                  border: "1px solid rgba(197,165,126,0.2)",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, #c5a57e, rgba(197,165,126,0.2))",
                  }} />
                  <video
                    ref={el => { videoRefs.current[index] = el; }}
                    src={char.videoUrl}
                    muted={false}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 18 }}
                  />
                </div>

              </div>

              {/* Selected badge */}
              {isSelected && (
                <div className="char-selected-badge">
                  <span style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: "0.6rem", letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    background: "linear-gradient(135deg, #3e1316, #632024)",
                    color: "#E8D4BC",
                    padding: "5px 14px", borderRadius: 999,
                    boxShadow: "0 4px 12px rgba(99,32,36,0.35)",
                    border: "1px solid rgba(197,165,126,0.3)",
                  }}>
                    {t('selected_badge')}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}