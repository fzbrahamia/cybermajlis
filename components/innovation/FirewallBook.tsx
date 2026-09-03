"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCcw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const IMAGE_SRCS = [
  "/firewall/f1.jpeg",
  "/firewall/f2.png",
  "/firewall/f3.png",
  "/firewall/f4.png",
  "/firewall/f5.png",
  "/firewall/f6.png",
];

const PAGE_ALT_EN = [
  "Rouda asks why cars stop at the guarded neighborhood gate, and Hamad explains that not everything should be allowed in.",
  "The guard checks vehicles entering the neighborhood and decides what may pass through his gate.",
  "Rouda assumes the gate makes everything inside safe, and Hamad asks whether the guard checks between the houses.",
  "A delivery cart moves from one house to another without passing the main gate again.",
  "Hamad explains that a gate controls what passes through it but cannot see everything happening elsewhere; Rouda realizes a gate alone does not make everything inside safe.",
  "The neighborhood gate transforms into a network boundary and firewall, revealing the cybersecurity concept.",
];

const PAGE_ALT_AR = [
  "تسأل روضة لماذا تتوقف السيارات عند بوابة الحي، ويشرح حمد أن ليس كل شيء ينبغي السماح له بالدخول.",
  "يفحص الحارس المركبات الداخلة إلى الحي ويقرر ما الذي يمكنه العبور من بوابته.",
  "تفترض روضة أن وجود البوابة يعني أن كل شيء في الداخل آمن، فيسألها حمد إن كان الحارس يراقب ما يحدث بين البيوت.",
  "تتحرك عربة توصيل من بيت إلى آخر داخل الحي دون المرور بالبوابة الرئيسية مرة أخرى.",
  "يشرح حمد أن البوابة تتحكم بما يعبرها لكنها لا ترى كل ما يحدث في بقية الحي، وتدرك روضة أن وجود البوابة وحده لا يعني أن كل ما في الداخل آمن.",
  "تتحول بوابة الحي إلى حدّ شبكي وجدار حماية، فتظهر فكرة الأمن السيبراني للمرة الأولى.",
];

// IMPORTANT: these match the user's WAV files.
const SOUNDS = {
  open: "/sounds/book-open.wav",
  page: "/sounds/page-turn.wav",
  close: "/sounds/book-close.wav",
};

const LEATHER = "#5A2B2F";
const LEATHER_DARK = "#2E1417";
const GOLD = "#D1AD60";
const PAPER = "#F7EED8";
const PAPER_DARK = "#D8C49A";

type Props = {
  titleEn: string;
  titleAr: string;
};

type SoundKind = keyof typeof SOUNDS;

export default function FirewallBook({ titleEn, titleAr }: Props) {
  const isAR = useLocale() === "ar";
  const total = IMAGE_SRCS.length;

  // 0 = closed cover, 1..6 = story spreads, 7 = finished spread
  const [step, setStep] = useState(0);
  const [muted, setMuted] = useState(false);
  const [turning, setTurning] = useState<"next" | "prev" | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Partial<Record<SoundKind, AudioBuffer>>>({});
  const audioReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const loadSounds = async () => {
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;

        if (!AudioCtx) return;

        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const entries = Object.entries(SOUNDS) as [SoundKind, string][];

        for (const [kind, src] of entries) {
          const response = await fetch(src);
          if (!response.ok) continue;
          const arrayBuffer = await response.arrayBuffer();
          const decoded = await ctx.decodeAudioData(arrayBuffer);
          if (!cancelled) audioBuffersRef.current[kind] = decoded;
        }

        if (!cancelled) audioReadyRef.current = true;
      } catch {
        // If Web Audio fails, the book still works silently.
      }
    };

    loadSounds();

    return () => {
      cancelled = true;
      audioCtxRef.current?.close().catch(() => {});
    };
  }, []);

  const playSound = useCallback(
    async (kind: SoundKind) => {
      if (muted) return;

      const ctx = audioCtxRef.current;
      const buffer = audioBuffersRef.current[kind];
      if (!ctx || !buffer || !audioReadyRef.current) return;

      try {
        if (ctx.state === "suspended") await ctx.resume();

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();

        source.buffer = buffer;

        // Louder than normal HTMLAudio. Tweak 1.5–2.0 if needed.
        gain.gain.value =
        kind === "page"
          ? 1.25
          : kind === "open"
            ? 1.55
            : 1.5;

        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
      } catch {
        // no-op
      }
    },
    [muted]
  );

  const animateTurn = useCallback(
    (direction: "next" | "prev") => {
      setTurning(direction);
      window.setTimeout(() => setTurning(null), 900);
    },
    []
  );

  const next = useCallback(() => {
    setStep((current) => {
      if (current >= total + 1) return current;

      animateTurn("next");

      if (current === 0) {
        playSound("open");
      } else {
        playSound("page");
      }

      return current + 1;
    });
  }, [animateTurn, playSound, total]);

  const prev = useCallback(() => {
    setStep((current) => {
      if (current <= 0) return current;

      animateTurn("prev");
      playSound("page");

      const nextStep = current - 1;
      if (nextStep === 0) playSound("close");
      else playSound("page");

      return nextStep;
    });
  }, [animateTurn, playSound]);

  const restart = useCallback(() => {
    if (step > 0) playSound("close");
    setTurning("prev");
    window.setTimeout(() => setTurning(null), 650);
    setStep(0);
  }, [playSound, step]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        isAR ? prev() : next();
      }
      if (event.key === "ArrowLeft") {
        isAR ? next() : prev();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAR, next, prev]);

  const storyIndex = useMemo(() => {
    if (step <= 0) return -1;
    return Math.min(step - 1, total - 1);
  }, [step, total]);


  return (
    <section className="storybook" dir={isAR ? "rtl" : "ltr"}>
      <div className="stage">
        <div className="floorShadow" aria-hidden />

        {step === 0 ? (
          <ClosedBook
            title={isAR ? titleAr : titleEn}
            subtitle={isAR ? "قصة من المجلس السيبراني" : "A CYBERMAJLIS STORY"}
            openText={isAR ? "افتح الكتاب" : "OPEN THE BOOK"}
            onOpen={next}
          />
        ) : step === total + 1 ? (
          <BackCoverBook
            isAR={isAR}
            onClose={() => {
              playSound("close");
              setTurning("prev");
              window.setTimeout(() => setTurning(null), 650);
              setStep(0);
            }}
            onReopen={prev}
          />
        ) : (
          <>
            <AmbientMotes />
            <OpenBook
              src={IMAGE_SRCS[storyIndex]}
              alt={isAR ? PAGE_ALT_AR[storyIndex] : PAGE_ALT_EN[storyIndex]}
              pageNumber={storyIndex + 1}
              active={true}
              finalPage={storyIndex === total - 1}
              turning={turning}
              onPrev={prev}
              onNext={next}
              canPrev={step > 0}
              canNext={step < total + 1}
            />
          </>
        )}
      </div>

      <div className="controls">
        <button
          className="control"
          onClick={prev}
          disabled={step === 0}
          aria-label={isAR ? "السابق" : "Previous"}
        >
          {isAR ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>

        <div className="progress">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={[
                "dot",
                step > i ? "done" : "",
                storyIndex === i && step > 0 && step <= total ? "current" : "",
              ].join(" ")}
            />
          ))}
        </div>

        <button
          className="control"
          onClick={next}
          disabled={step === total + 1}
          aria-label={isAR ? "التالي" : "Next"}
        >
          {isAR ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>

        <span className="separator" />

        <button
          className="control"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Sound on" : "Mute"}
        >
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>

        {step > 0 && (
          <button
            className="control"
            onClick={restart}
            aria-label={isAR ? "ابدأ من جديد" : "Restart"}
          >
            <RotateCcw size={16} />
          </button>
        )}
      </div>

      <p className="hint">
        {isAR
          ? "يمكنك الضغط على السهم لتقليب الصفحة"
          : "You can use the arrows to turn the pages"}
      </p>

      <style jsx>{`
        .storybook {
          width: 100%;
          user-select: none;
        }

        .stage {
          position: relative;
          width: min(96vw, 1280px);
          height: clamp(500px, 72dvh, 700px);
          margin: 0 auto 26px;
          display: grid;
          place-items: center;
          perspective: 2600px;
          overflow: visible;
        }

        .floorShadow {
          position: absolute;
          width: 84%;
          height: 9%;
          bottom: 4%;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at center,
            rgba(84, 58, 31, 0.24),
            rgba(84, 58, 31, 0.06) 56%,
            transparent 76%
          );
          filter: blur(8px);
        }

        .controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 11px;
          margin-top: 8px;
        }

        .control {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: #684720;
          border: 1px solid rgba(117,80,38,.26);
          background: rgba(255,250,238,.72);
          box-shadow: 0 3px 10px rgba(95,64,30,.08);
          transition: transform .18s ease, background .18s ease;
        }

        .control:hover:not(:disabled) {
          transform: translateY(-2px);
          background: #fffaf0;
        }

        .control:disabled {
          opacity: .26;
          cursor: default;
        }

        .separator {
          width: 1px;
          height: 24px;
          background: rgba(107,73,35,.18);
          margin: 0 2px;
        }

        .progress {
          display: flex;
          gap: 7px;
          align-items: center;
          padding: 0 6px;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 99px;
          background: rgba(98,66,32,.18);
          transition: .25s ease;
        }

        .dot.done {
          background: rgba(157,109,50,.68);
        }

        .dot.current {
          width: 18px;
          background: #A66F32;
          box-shadow: 0 0 10px rgba(166,111,50,.25);
        }

        .hint {
          margin: 9px 0 0;
          text-align: center;
          font-size: 10.5px;
          color: rgba(69,45,28,.48);
        }

        @media (max-width: 820px) {
          .stage {
            width: 98vw;
            height: clamp(360px, 62dvh, 520px);
          }
        }
      `}</style>
    </section>
  );
}

function ClosedBook({
  title,
  subtitle,
  openText,
  onOpen,
}: {
  title: string;
  subtitle: string;
  openText: string;
  onOpen: () => void;
}) {
  return (
    <button className="closedBook" onClick={onOpen}>
      <div className="closedPageStack" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            style={{
              transform: `translateY(${7 + i * 0.65}px) translateZ(${-i}px)`,
            }}
          />
        ))}
      </div>

      <div className="coverSurface">
        <div className="coverGrain" aria-hidden />
        <div className="goldFrame" aria-hidden />
        <div className="embossedPanel" aria-hidden />
        <div className="corner tl" aria-hidden />
        <div className="corner tr" aria-hidden />
        <div className="corner bl" aria-hidden />
        <div className="corner br" aria-hidden />
        <div className="ornament top" aria-hidden>✦</div>
        <div className="ornament bottom" aria-hidden>✦</div>

        <h2>{title}</h2>
        <p>{subtitle}</p>
        <span className="openLabel">{openText}</span>
      </div>

      <style jsx>{`
        .closedBook {
          position: relative;
          width: min(60vw, calc(61dvh * 1.36), 600px);
          aspect-ratio: 1.36 / 1;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          transform-style: preserve-3d;
          transform: rotateX(12deg) rotateZ(-1.2deg);
          transition: transform .35s ease;
          overflow: visible;
        }

        .closedBook:hover {
          transform: rotateX(9deg) rotateZ(-.5deg) translateY(-5px);
        }

        .closedPageStack {
          position: absolute;
          inset: 4.5% 3% 1%;
          transform-style: preserve-3d;
        }

        .closedPageStack span {
          position: absolute;
          inset: 0;
          border-radius: 15px 9px 9px 15px;
          background: linear-gradient(
            90deg,
            #cbb78f,
            #f3e7c9 7%,
            #f8edda 90%,
            #c8b186
          );
          border-bottom: 1px solid rgba(91,58,27,.12);
          box-shadow: 0 1px 0 rgba(255,255,255,.55);
        }

        .coverSurface {
          position: absolute;
          inset: 0;
          overflow: hidden;
          border-radius: 20px 11px 11px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: ${GOLD};
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,.055), transparent 28%),
            radial-gradient(circle at 34% 18%, rgba(255,255,255,.045), transparent 28%),
            linear-gradient(145deg, #815033 0%, #5C351F 38%, #432415 72%, #28150D 100%);
          box-shadow:
            inset 0 0 0 2px rgba(215,181,99,.72),
            inset 0 0 0 9px rgba(60,34,18,.82),
            inset 0 0 0 11px rgba(209,173,96,.24),
            inset 0 0 86px rgba(0,0,0,.42),
            0 28px 32px rgba(74,48,24,.20);
        }

        .coverGrain {
          position: absolute;
          inset: 0;
          opacity: .34;
          background-image:
            radial-gradient(circle at 21% 14%, rgba(255,255,255,.09) 0 .5px, transparent .7px),
            radial-gradient(circle at 73% 68%, rgba(0,0,0,.18) 0 .5px, transparent .7px);
          background-size: 8px 9px, 10px 11px;
        }

        .goldFrame {
          position: absolute;
          inset: 7%;
          border: 1px solid rgba(221,187,107,.68);
          box-shadow:
            0 0 0 3px rgba(67,39,20,.78),
            0 0 0 4px rgba(209,173,96,.25);
        }

        .corner {
          position: absolute;
          z-index: 4;
          width: 84px;
          height: 84px;
          pointer-events: none;
          opacity: .98;
          filter: drop-shadow(0 2px 1px rgba(46,25,11,.45));
        }

        .corner::before {
          content: "";
          position: absolute;
          inset: 0;
          clip-path: polygon(
            0 0, 100% 0, 100% 13%, 39% 13%,
            39% 24%, 27% 24%, 27% 39%,
            13% 39%, 13% 100%, 0 100%
          );
          background:
            linear-gradient(135deg,#F0D68A 0%,#C79A42 42%,#8F6325 74%,#E0BE67 100%);
          box-shadow: inset 0 0 0 1px rgba(255,241,184,.52);
        }

        .corner::after {
          content: "✦";
          position: absolute;
          left: 15px;
          top: 10px;
          width: 26px;
          height: 26px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(255,231,160,.74);
          border-radius: 50%;
          color: #F6DF9B;
          background: radial-gradient(circle,#B98734,#79511F);
          font-size: 12px;
          box-shadow:
            inset 0 0 0 2px rgba(79,46,15,.22),
            0 1px 2px rgba(49,28,11,.35);
        }

        .corner.tl { top: 2.7%; left: 2.7%; }
        .corner.tr { top: 2.7%; right: 2.7%; transform: scaleX(-1); }
        .corner.bl { bottom: 2.7%; left: 2.7%; transform: scaleY(-1); }
        .corner.br { bottom: 2.7%; right: 2.7%; transform: scale(-1); }

        .embossedPanel {
          position: absolute;
          inset: 18% 17%;
          border-radius: 8px;
          border: 1px solid rgba(224,187,98,.34);
          box-shadow:
            inset 0 0 20px rgba(255,226,152,.035),
            0 0 0 3px rgba(56,31,16,.36),
            0 0 0 4px rgba(206,166,78,.14);
          pointer-events: none;
        }

        .ornament {
          position: absolute;
          color: rgba(223,188,105,.70);
          font-size: 15px;
        }

        .ornament.top { top: 14%; }
        .ornament.bottom { bottom: 14%; }

        h2 {
          position: relative;
          z-index: 2;
          width: 68%;
          margin: 0;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(24px, 3.35vw, 42px);
          line-height: 1.05;
          text-transform: uppercase;
          letter-spacing: .055em;
          text-shadow: 0 2px 0 rgba(58,33,17,.8), 0 3px 8px rgba(0,0,0,.45);
        }

        p {
          position: relative;
          z-index: 2;
          margin: 15px 0 0;
          font-size: clamp(9px,1vw,12px);
          letter-spacing: .23em;
          color: rgba(235,207,145,.72);
        }

        .openLabel {
          position: absolute;
          z-index: 2;
          bottom: 8%;
          font-size: 10px;
          letter-spacing: .16em;
          color: rgba(235,207,145,.78);
        }

        @media (max-width: 820px) {
          .closedBook {
            width: min(82vw, calc(58dvh * 1.36), 570px);
          }
        }
      `}</style>
    </button>
  );
}

function OpenBook({
  src,
  alt,
  pageNumber,
  active,
  finalPage,
  turning,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  src: string;
  alt: string;
  pageNumber: number;
  active: boolean;
  finalPage: boolean;
  turning: "next" | "prev" | null;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  return (
    <div className="openBook">
      <div className="bookBase" aria-hidden />
      <div className="coverLip leftLip" aria-hidden />
      <div className="coverLip rightLip" aria-hidden />

      <div className="leftStack" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            style={{ transform: `translateY(${5 + i * .65}px)` }}
          />
        ))}
      </div>

      <div className="rightStack" aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            style={{ transform: `translateY(${5 + i * .65}px)` }}
          />
        ))}
      </div>

      <div className="spread">
        <div className="leftPage" />
        <div className="rightPage" />

        <div className="illustrationFrame">
          <Image
            src={src}
            alt={alt}
            fill
            priority={pageNumber === 1}
            sizes="(max-width: 1280px) 92vw, 1180px"
            style={{ objectFit: "cover" }}
          />

          <div className="vignette" aria-hidden />

          {active && finalPage && <div className="networkSweep" aria-hidden />}
        </div>

        <div className="gutter" aria-hidden />
        <div className="leftCurl" aria-hidden />
        <div className="rightCurl" aria-hidden />
        <button
          className="bookClick leftClick"
          aria-label="Previous page"
          onClick={onPrev}
          disabled={!canPrev}
        >
          <span className="edgeHint">‹</span>
        </button>
        <button
          className="bookClick rightClick"
          aria-label="Next page"
          onClick={onNext}
          disabled={!canNext}
        >
          <span className="edgeHint">›</span>
        </button>

        {turning && (
          <div
            className={`turnSheet ${
              turning === "prev" ? "turnSheetPrev" : "turnSheetNext"
            }`}
            aria-hidden
          >
            <div className="turnHighlight" />
          </div>
        )}

        <div className="pageNumber">{pageNumber}</div>
      </div>

      <style jsx>{`
        .openBook {
          position: relative;
          width: min(94vw, calc(69dvh * 1.72), 1210px);
          aspect-ratio: 1.72 / 1;
          transform-style: preserve-3d;
          transform: rotateX(6deg);
          overflow: visible;
        }

        .bookBase {
          position: absolute;
          inset: 1.4% -0.8% -1.8%;
          border-radius: 5% 5% 8% 8%;
          transform: translateY(17px) translateZ(-32px);
          background: linear-gradient(
            90deg,
            ${LEATHER_DARK},
            ${LEATHER} 18%,
            #6a3235 50%,
            ${LEATHER} 82%,
            ${LEATHER_DARK}
          );
          box-shadow:
            inset 0 0 0 3px rgba(209,173,96,.48),
            inset 0 0 0 10px rgba(62,34,18,.30),
            0 24px 34px rgba(81,51,24,.22);
        }

        .coverLip {
          position: absolute;
          z-index: 0;
          top: 7%;
          bottom: 0%;
          width: 5.4%;
          background:
            linear-gradient(180deg,#72452C,#4D2B1B 52%,#2D180F);
          border: 1px solid rgba(205,165,77,.40);
          box-shadow:
            inset 0 0 12px rgba(0,0,0,.25),
            0 8px 14px rgba(71,43,22,.14);
        }

        .leftLip {
          left: -.7%;
          border-radius: 22px 4px 8px 24px;
        }

        .rightLip {
          right: -.7%;
          border-radius: 4px 22px 24px 8px;
        }

        .leftStack,
        .rightStack {
          position: absolute;
          top: 5.5%;
          bottom: 2.5%;
          width: 49.3%;
          pointer-events: none;
        }

        .leftStack { left: 1%; }
        .rightStack { right: 1%; }

        .leftStack span,
        .rightStack span {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            #e7d7b7,
            #f6ebd4 18%,
            #efdfbf 88%,
            #d1bc93
          );
          border-bottom: 1px solid rgba(99,65,31,.11);
          box-shadow: 0 1px 0 rgba(255,255,255,.6);
        }

        .leftStack span {
          border-radius: 7% 2% 3% 8%;
          transform-origin: right center;
        }

        .rightStack span {
          border-radius: 2% 7% 8% 3%;
          transform-origin: left center;
        }

        .spread {
          position: absolute;
          inset: 2.5% 1.6% 4.5%;
          transform-style: preserve-3d;
          filter: drop-shadow(0 18px 16px rgba(85,55,28,.16));
        }

        .leftPage,
        .rightPage {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 50%;
          background:
            radial-gradient(circle at 20% 18%, rgba(130,83,39,.045), transparent 26%),
            linear-gradient(90deg,#decca5,#f8efd9 10%,#fbf4e4 92%,#dcc79f);
        }

        .leftPage {
          left: 0;
          border-radius: 7% 1.5% 2.5% 8%;
          box-shadow:
            inset -26px 0 34px rgba(78,49,22,.11),
            inset 11px 0 15px rgba(255,255,255,.27);
          transform: rotateY(1.8deg);
          transform-origin: right center;
        }

        .rightPage {
          right: 0;
          border-radius: 1.5% 7% 8% 2.5%;
          box-shadow:
            inset 26px 0 34px rgba(78,49,22,.11),
            inset -11px 0 15px rgba(255,255,255,.23);
          transform: rotateY(-1.8deg);
          transform-origin: left center;
        }

        .illustrationFrame {
          position: absolute;
          z-index: 4;
          left: 4.1%;
          right: 4.1%;
          top: 5%;
          bottom: 7.2%;
          overflow: hidden;
          border-radius: 16px 16px 12px 12px;
          box-shadow:
            0 3px 13px rgba(68,43,20,.14),
            0 0 0 1px rgba(91,56,25,.10);
          background: #decfb1;
        }

        .vignette {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
          background:
            radial-gradient(circle at center, transparent 58%, rgba(46,27,14,.13) 125%);
        }

        .gutter {
          position: absolute;
          z-index: 12;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 5.2%;
          transform: translateX(-50%);
          pointer-events: none;
          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(74,43,20,.05) 18%,
              rgba(54,29,14,.25) 48%,
              rgba(255,248,226,.18) 52%,
              rgba(74,43,20,.05) 82%,
              transparent
            );
          filter: blur(.4px);
        }

        .leftCurl,
        .rightCurl {
          position: absolute;
          z-index: 11;
          top: 1.6%;
          bottom: 1.6%;
          width: 5%;
          pointer-events: none;
          opacity: .65;
        }

        .leftCurl {
          left: 0;
          border-radius: 45% 0 0 45%;
          background: linear-gradient(90deg,rgba(87,54,27,.14),transparent);
        }

        .rightCurl {
          right: 0;
          border-radius: 0 45% 45% 0;
          background: linear-gradient(270deg,rgba(87,54,27,.14),transparent);
        }

        .turnSheet {
          position: absolute;
          z-index: 30;
          top: 1.3%;
          bottom: 1.6%;
          width: 49.6%;
          pointer-events: none;
          border-radius: 3% 6% 7% 3%;
          background:
            linear-gradient(90deg,#f8efd8,#fff8e8 55%,#dfcba7);
          box-shadow:
            -12px 8px 22px rgba(65,38,18,.18),
            inset 18px 0 22px rgba(82,48,22,.08);
          transform-style: preserve-3d;
          overflow: hidden;
        }

        .turnSheetNext {
          right: .4%;
          transform-origin: left center;
          animation: turnNext .88s cubic-bezier(.25,.04,.20,1) both;
        }

        .turnSheetPrev {
          left: .4%;
          transform-origin: right center;
          border-radius: 6% 3% 3% 7%;
          animation: turnPrev .88s cubic-bezier(.25,.04,.20,1) both;
        }

        .turnHighlight {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              transparent 15%,
              rgba(0,0,0,.09) 48%,
              rgba(255,255,255,.35) 76%,
              rgba(0,0,0,.07) 100%
            );
          animation: highlightMove .88s ease both;
        }
        .networkSweep {
          position: absolute;
          z-index: 5;
          top: -18%;
          bottom: -18%;
          width: 15%;
          left: -18%;
          transform: skewX(-12deg);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(123,212,255,.05),
            rgba(123,212,255,.30),
            rgba(255,255,255,.32),
            rgba(123,212,255,.08),
            transparent
          );
          animation: networkSweep 5.2s ease-in-out infinite 1s;
          pointer-events: none;
        }

        .bookClick {
          position: absolute;
          z-index: 60;
          top: 2.5%;
          bottom: 3%;
          width: 43%;
          border: 0;
          padding: 0;
          background: transparent;
          cursor: pointer;
          outline: none;
        }

        .bookClick:disabled {
          cursor: default;
          pointer-events: none;
        }

        .leftClick { left: 2.2%; cursor: w-resize; }
        .rightClick { right: 2.2%; cursor: e-resize; }

        .edgeHint {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          font: 400 34px/1 Georgia, serif;
          color: rgba(91,57,25,.35);
          background: rgba(255,249,234,.14);
          opacity: 0;
          transition: opacity .18s ease, background .18s ease;
          pointer-events: none;
        }

        .leftClick .edgeHint { left: 1.2%; }
        .rightClick .edgeHint { right: 1.2%; }

        .bookClick:hover .edgeHint {
          opacity: .95;
          background: rgba(255,249,234,.55);
        }

        .pageNumber {
          position: absolute;
          z-index: 14;
          bottom: 2.5%;
          right: 4.4%;
          font: 10px Georgia, serif;
          letter-spacing: .14em;
          color: rgba(90,55,26,.43);
        }

        @keyframes turnNext {
          0% {
            transform: rotateY(0deg) translateZ(12px);
          }
          45% {
            transform: rotateY(-90deg) translateZ(58px) scaleX(.93);
          }
          100% {
            transform: rotateY(-178deg) translateZ(8px);
          }
        }

        @keyframes turnPrev {
          0% {
            transform: rotateY(0deg) translateZ(12px);
          }
          45% {
            transform: rotateY(90deg) translateZ(58px) scaleX(.93);
          }
          100% {
            transform: rotateY(178deg) translateZ(8px);
          }
        }

        @keyframes highlightMove {
          0% { opacity: .10; transform: translateX(30%); }
          50% { opacity: 1; transform: translateX(-8%); }
          100% { opacity: .15; transform: translateX(-34%); }
        }

        @keyframes networkSweep {
          0%,18% { left: -18%; opacity: 0; }
          38% { opacity: .9; }
          100% { left: 108%; opacity: 0; }
        }

        @media (max-width: 820px) {
          .openBook {
            width: 97vw;
            transform: rotateX(3deg);
          }

          .illustrationFrame {
            left: 4.6%;
            right: 4.6%;
            top: 5.4%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .turnSheet,
          .turnHighlight,
          .networkSweep {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}




function AmbientMotes() {
  const particles = [
    // Left outer side
    { x: 3,  y: 82, s: 4, d: 12.8, delay: 0.2, kind: "dot" },
    { x: 6,  y: 67, s: 3, d: 10.6, delay: 2.7, kind: "star" },
    { x: 8,  y: 54, s: 5, d: 13.4, delay: 5.1, kind: "dot" },
    { x: 10, y: 74, s: 3, d: 11.8, delay: 1.4, kind: "star" },
    { x: 12, y: 60, s: 3, d: 14.2, delay: 4.0, kind: "dot" },
    { x: 14, y: 84, s: 2, d: 10.9, delay: 6.3, kind: "star" },

    // Lightly touching left page edge
    { x: 17, y: 72, s: 4, d: 12.1, delay: 3.2, kind: "star" },
    { x: 19, y: 57, s: 3, d: 13.7, delay: 6.8, kind: "dot" },

    // Right outer side
    { x: 82, y: 80, s: 3, d: 13.1, delay: 1.1, kind: "star" },
    { x: 85, y: 64, s: 4, d: 11.2, delay: 4.5, kind: "dot" },
    { x: 88, y: 52, s: 3, d: 14.0, delay: 6.4, kind: "star" },
    { x: 91, y: 76, s: 5, d: 12.4, delay: 2.1, kind: "dot" },
    { x: 94, y: 60, s: 2, d: 10.8, delay: 5.6, kind: "star" },
    { x: 96, y: 84, s: 3, d: 14.6, delay: 0.4, kind: "star" },

    // Lightly touching right page edge
    { x: 79, y: 69, s: 4, d: 11.7, delay: 3.8, kind: "dot" },
    { x: 77, y: 55, s: 3, d: 13.3, delay: 7.1, kind: "star" },

    // A few above the book
    { x: 34, y: 24, s: 3, d: 13.6, delay: 1.8, kind: "star" },
    { x: 43, y: 18, s: 4, d: 15.1, delay: 5.0, kind: "dot" },
    { x: 52, y: 21, s: 3, d: 12.9, delay: 2.9, kind: "star" },
    { x: 61, y: 17, s: 2, d: 14.4, delay: 6.2, kind: "star" },
    { x: 68, y: 25, s: 4, d: 13.2, delay: 0.9, kind: "dot" },
  ];

  return (
    <div className="ambientMagic" aria-hidden>
      {particles.map((p, i) => (
        <span
          key={i}
          className={`particle ${p.kind}`}
          style={
            {
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.s}px`,
              height: `${p.s}px`,
              "--duration": `${p.d}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${i % 2 === 0 ? 16 : -14}px`,
            } as React.CSSProperties
          }
        />
      ))}

      <style jsx>{`
        .ambientMagic {
          position: absolute;
          inset: -8% -5% 2%;
          pointer-events: none;
          z-index: 42;
          overflow: visible;
        }

        .particle {
          position: absolute;
          opacity: 0;
          will-change: transform, opacity;
          animation:
            calmRise var(--duration) ease-in-out var(--delay) infinite,
            softTwinkle 3.2s ease-in-out var(--delay) infinite;
        }

        .particle.dot {
          border-radius: 50%;
          background: #FFE07A;
          border: 1px solid rgba(122,78,13,.28);
          box-shadow:
            0 0 4px rgba(255,255,255,.98),
            0 0 9px rgba(255,216,92,.98),
            0 0 16px rgba(209,145,22,.72),
            0 0 24px rgba(151,97,11,.28);
        }

        .particle.star {
          background: transparent;
          filter:
            drop-shadow(0 0 2px rgba(255,255,255,1))
            drop-shadow(0 0 5px rgba(245,196,57,.95))
            drop-shadow(0 0 9px rgba(145,91,10,.48));
        }

        .particle.star::before,
        .particle.star::after {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 999px;
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0),
            #F2BE34 26%,
            #FFF7CF 48%,
            #FFFFFF 50%,
            #FFE176 65%,
            rgba(255,255,255,0)
          );
        }

        .particle.star::before {
          width: max(11px, calc(100% * 3.7));
          height: 1.6px;
          box-shadow: 0 0 6px rgba(214,155,34,.82);
        }

        .particle.star::after {
          width: 1.6px;
          height: max(11px, calc(100% * 3.7));
          box-shadow: 0 0 6px rgba(214,155,34,.82);
        }

        @keyframes calmRise {
          0% {
            opacity: 0;
            transform: translate3d(0, 15px, 0) scale(.72) rotate(0deg);
          }
          12% { opacity: .58; }
          34% {
            opacity: .98;
            transform: translate3d(var(--drift), -22px, 0) scale(1.06) rotate(10deg);
          }
          68% {
            opacity: .76;
            transform: translate3d(calc(var(--drift) * -.38), -66px, 0) scale(.96) rotate(-7deg);
          }
          100% {
            opacity: 0;
            transform: translate3d(calc(var(--drift) * .55), -118px, 0) scale(.76) rotate(6deg);
          }
        }

        @keyframes softTwinkle {
          0%, 100% {
            filter: brightness(.92) saturate(1.05);
          }
          35% {
            filter: brightness(1.55) saturate(1.25);
          }
          52% {
            filter: brightness(1.12) saturate(1.1);
          }
          71% {
            filter: brightness(1.42) saturate(1.2);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambientMagic { display: none; }
        }
      `}</style>
    </div>
  );
}

function BackCoverBook({
  isAR,
  onClose,
  onReopen,
}: {
  isAR: boolean;
  onClose: () => void;
  onReopen: () => void;
}) {
  return (
    <div className="backBookWrap">
      <div className="backBook">
        <div className="backPageStack" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span
              key={i}
              style={{
                transform: `translateY(${7 + i * .62}px) translateZ(${-i}px)`,
              }}
            />
          ))}
        </div>

        <div className="backLeather">
          <div className="backFrame" />
          <div className="backCorner tl" />
          <div className="backCorner tr" />
          <div className="backCorner bl" />
          <div className="backCorner br" />
          <div className="backMark">✦</div>
        </div>

        {/* Large reverse area: go back from the rear cover to page 6 */}
        <button
          className="reverseCover"
          onClick={onReopen}
          aria-label={isAR ? "الرجوع إلى الصفحة الأخيرة" : "Return to the last page"}
        >
          <span className="reverseArrow">{isAR ? "›" : "‹"}</span>
        </button>
      </div>

      {/* Separate close action so reverse and close are both possible */}
      <button
        className="closeBookButton"
        onClick={onClose}
        aria-label={isAR ? "إغلاق الكتاب" : "Close the book"}
        title={isAR ? "إغلاق الكتاب" : "Close the book"}
      >
        <span aria-hidden>✕</span>
      </button>

      <style jsx>{`
        .backBookWrap {
          display: grid;
          justify-items: center;
          gap: 24px;
        }

        .backBook {
          position: relative;
          width: min(60vw, calc(61dvh * 1.36), 600px);
          aspect-ratio: 1.36 / 1;
          background: transparent;
          transform-style: preserve-3d;
          transform: rotateX(11deg) rotateZ(.8deg);
          overflow: visible;
        }

        .backPageStack {
          position: absolute;
          inset: 4.5% 3% 1%;
          transform-style: preserve-3d;
        }

        .backPageStack span {
          position: absolute;
          inset: 0;
          border-radius: 10px 16px 16px 10px;
          background: linear-gradient(90deg,#cab58c,#f4e9cd 9%,#f7ecd6 91%,#c7af84);
          border-bottom: 1px solid rgba(91,58,27,.12);
        }

        .backLeather {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 12px 20px 20px 12px;
          color: #D5B366;
          background:
            radial-gradient(circle at 35% 18%,rgba(255,255,255,.04),transparent 28%),
            linear-gradient(145deg,#805035,#5A341F 42%,#2D180F);
          box-shadow:
            inset 0 0 0 2px rgba(216,181,98,.70),
            inset 0 0 0 9px rgba(62,34,18,.80),
            inset 0 0 0 11px rgba(208,170,82,.20),
            inset 0 0 80px rgba(0,0,0,.40),
            0 24px 30px rgba(74,48,24,.18);
        }

        .backFrame {
          position: absolute;
          inset: 8%;
          border: 1px solid rgba(220,183,98,.46);
        }

        .backMark {
          font-size: 46px;
          opacity: .62;
          text-shadow: 0 2px 5px rgba(0,0,0,.38);
        }

        .backCorner {
          position: absolute;
          width: 76px;
          height: 76px;
        }

        .backCorner::before {
          content: "";
          position: absolute;
          inset: 0;
          clip-path: polygon(
            0 0, 100% 0, 100% 13%, 39% 13%,
            39% 24%, 27% 24%, 27% 39%,
            13% 39%, 13% 100%, 0 100%
          );
          background: linear-gradient(135deg,#EACF7E,#BE903A 46%,#845A20);
        }

        .backCorner.tl { top: 3%; left: 3%; }
        .backCorner.tr { top: 3%; right: 3%; transform: scaleX(-1); }
        .backCorner.bl { bottom: 3%; left: 3%; transform: scaleY(-1); }
        .backCorner.br { bottom: 3%; right: 3%; transform: scale(-1); }

        .reverseCover {
          position: absolute;
          z-index: 5;
          inset: 0;
          border: 0;
          background: transparent;
          cursor: w-resize;
          color: #F2D98C;
        }

        .reverseArrow {
          position: absolute;
          left: 4.5%;
          top: 50%;
          transform: translateY(-50%);
          width: 42px;
          height: 68px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          font: 400 40px/1 Georgia, serif;
          color: rgba(246,222,155,.62);
          background: rgba(255,244,211,.04);
          transition: all .2s ease;
        }

        .reverseCover:hover .reverseArrow {
          color: rgba(255,239,185,.95);
          background: rgba(255,244,211,.10);
          box-shadow: 0 0 22px rgba(230,191,91,.16);
        }

        .closeBookButton {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(122,83,37,.34);
          border-radius: 50%;
          padding: 0;
          background: rgba(255,250,238,.76);
          color: #714A25;
          cursor: pointer;
          font-size: 15px;
          box-shadow: 0 5px 15px rgba(88,57,25,.08);
          transition: transform .16s ease, background .16s ease, box-shadow .16s ease;
        }

        .closeBookButton:hover {
          transform: translateY(-1px) scale(1.03);
          background: rgba(255,250,238,.96);
          box-shadow: 0 7px 18px rgba(88,57,25,.12);
        }
      `}</style>
    </div>
  );
}
