"use client";

import { lessonsData } from "@/app/lib/lessonsData";
import Image from "next/image";
import Link from "next/link";
import { use, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = use(params);
  const lessons = (lessonsData as any)[category] || [];
  // const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  const t1 = useTranslations("CategoryPage");
  const t = useTranslations("Lessons");
  const tCategory = useTranslations("Categories");
  const formattedCategory = tCategory(category);
  const locale = useLocale();
  const isRtl = locale === "ar";

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      :root {
        --maroon: #632024; --maroon-deep: #3e1316;
        --maroon-mid: #8B2635; --gold: #c5a57e;
        --gold-light: #E8D4BC; --cream: #E3DAC9;
      }
      @keyframes orb-drift {
        0% { transform: translate(0, 0) scale(1); }
        100% { transform: translate(30px, 40px) scale(1.08); }
      }
      @keyframes gridMove {
        0% { background-position: 0 0; }
        100% { background-position: 40px 40px; }
      }
      .cat-orb {
        position: fixed; border-radius: 50%;
        pointer-events: none; z-index: 0;
        filter: blur(80px); opacity: 0.15;
        animation: orb-drift 18s ease-in-out infinite alternate;
      }
      .cat-grid {
        position: fixed; inset: 0; z-index: 0; pointer-events: none;
        background-image: repeating-linear-gradient(45deg, rgba(97,120,145,0.065) 0px, rgba(97,120,145,0.065) 1px, transparent 1px, transparent 20px);
        background-size: 20px 20px;
        animation: gridMove 15s linear infinite;
      }
      .lesson-card {
        position: relative;
        background: linear-gradient(160deg, #f5ede0 0%, #ede0cc 100%);
        border-radius: 20px;
        border: 1px solid rgba(99,32,36,0.15);
        overflow: hidden;
        text-decoration: none;
        display: flex; flex-direction: column;
        transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s ease;
        box-shadow: 0 4px 24px rgba(99,32,36,0.08);
      }
      .lesson-card:hover {
        transform: translateY(-8px) scale(1.01);
        box-shadow: 0 24px 60px rgba(99,32,36,0.18), 0 0 0 1px rgba(197,165,126,0.3);
      }
      .lesson-card-stripe { height: 3px; background: linear-gradient(90deg, var(--maroon), var(--gold)); flex-shrink: 0; }
      .lesson-card-body { padding: 1.4rem 1.6rem 1.8rem; display: flex; flex-direction: column; flex: 1; }
      .lesson-card-img { width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 10px; border: 1px solid rgba(99,32,36,0.12); margin-bottom: 1.2rem; }
      .lesson-card-title { font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700; color: var(--maroon-deep); margin-bottom: 0.6rem; line-height: 1.3; text-align: center; }
      .lesson-card-desc { font-family: 'Crimson Pro', serif; font-size: 0.95rem; line-height: 1.65; color: #5C4033; font-weight: 300; text-align: center; flex: 1; }
      .lesson-card-arrow { display: flex; align-items: center; justify-content: center; margin-top: 1.2rem; padding-top: 1rem; border-top: 1px solid rgba(99,32,36,0.1); font-family: 'Cinzel', serif; font-size: 0.65rem; letter-spacing: 0.15em; color: var(--maroon-mid); opacity: 0; transition: opacity 0.25s, transform 0.25s; transform: translateY(4px); }
      .lesson-card:hover .lesson-card-arrow { opacity: 1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#E3DAC9", position: "relative", overflow: "hidden", paddingBottom: "4rem" }}>
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 2rem" }}>

        {/* Header */}
        <div style={{ textAlign: "center", padding: "7rem 0 3rem" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'Cinzel', serif", fontSize: "0.65rem",
            letterSpacing: "0.35em", textTransform: "uppercase",
            color: "#8B2635",
            background: "linear-gradient(135deg, rgba(99,32,36,0.08), rgba(197,165,126,0.18))",
            border: "1px solid rgba(99,32,36,0.2)",
            padding: "0.4rem 1.4rem", borderRadius: 999, marginBottom: "1rem",
          }}>
            {t1("eyebrow", { category: formattedCategory })}
          </div>

          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(2rem, 4vw, 3.2rem)", fontWeight: 900, color: "#3e1316", marginBottom: "0.8rem", lineHeight: 1.1 }}>
            {formattedCategory} <span style={{ color: "#8B2635" }}>{t1("title_suffix")}</span>
          </h1>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: "0.8rem" }}>
            <div style={{ height: 1.5, width: 48, background: "linear-gradient(90deg, transparent, #632024)", borderRadius: 2 }} />
            <div style={{ width: 5, height: 5, background: "#c5a57e", transform: "rotate(45deg)" }} />
            <div style={{ height: 1.5, width: 48, background: "linear-gradient(90deg, #632024, transparent)", borderRadius: 2 }} />
          </div>

          <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "1.05rem", fontStyle: "italic", color: "#5C4033", fontWeight: 300 }}>
            {t1("subtitle")}
          </p>
        </div>

        {/* Back button */}
        <div style={{ marginBottom: "2rem" }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: "'Cinzel', serif", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#632024", textDecoration: "none", padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(99,32,36,0.25)", background: "rgba(99,32,36,0.05)", transition: "background 0.2s" }}
          >
            {t1("back")}
          </Link>
        </div>

        {/* Cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: lessons.length === 1 ? "minmax(300px, 400px)" : "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", justifyContent: "center" }}>
          {lessons.map((lesson: any, index: number) => (
            <Link key={index} href={`/dashboard/${category}/${lesson.slug}`} className="lesson-card">
              <div className="lesson-card-stripe" />
              <div className="lesson-card-body">
                <Image src={lesson.image} alt={lesson.title} width={400} height={225} className="lesson-card-img" />
                <h2 className="lesson-card-title">{lesson.titleKey ? t(lesson.titleKey) : t1("coming_soon")}</h2>
                <p className="lesson-card-desc">{lesson.descKey ? t(lesson.descKey) : ""}</p>
                <div className="lesson-card-arrow">{t1("explore")}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}