// ============================================================
// DM DETECTOR — Spot suspicious messages before time runs out
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CHARS } from "@/app/lib/characters";
import { GameShell, GameHeader, Intro, Result } from "@/components/GameShell";

const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

const GAME_XP     = 100;
const TOTAL       = 8;
const MAX_LIVES   = 4;
const TIMER       = 30;
const PASSING_SCORE = 600; // ~half the max possible

interface DMMessage {
  from: string;
  msg: string;
  sus: boolean;
  flagKeys: string[];
}

const DMS: DMMessage[] = [
  { from: "dmDetector.senders.unknown",          msg: "dmDetector.messages.claimPrize",          sus: true,  flagKeys: ["dmDetector.flags.unsolicitedLink", "dmDetector.flags.tooGoodToBeTrue"] },
  { from: "dmDetector.senders.friend",           msg: "dmDetector.messages.howsItGoing",         sus: false, flagKeys: ["dmDetector.flags.casualGreeting", "dmDetector.flags.knownContact"] },
  { from: "dmDetector.senders.support",          msg: "dmDetector.messages.verifyOrClose",       sus: true,  flagKeys: ["dmDetector.flags.urgentPressure", "dmDetector.flags.requestsPassword"] },
  { from: "dmDetector.senders.mom",              msg: "dmDetector.messages.dinnerTomorrow",      sus: false, flagKeys: ["dmDetector.flags.personalMessage", "dmDetector.flags.expectedContact"] },
  { from: "dmDetector.senders.admin",            msg: "dmDetector.messages.updatePayment",       sus: true,  flagKeys: ["dmDetector.flags.urgentDemand", "dmDetector.flags.suspiciousSender"] },
  { from: "dmDetector.senders.classmate",        msg: "dmDetector.messages.finishHomework",      sus: false, flagKeys: ["dmDetector.flags.normalQuestion", "dmDetector.flags.knownPerson"] },
  { from: "dmDetector.senders.bank",             msg: "dmDetector.messages.confirmSSN",          sus: true,  flagKeys: ["dmDetector.flags.requestsSensitiveInfo", "dmDetector.flags.phishing"] },
  { from: "dmDetector.senders.game",             msg: "dmDetector.messages.wonCoins",            sus: true,  flagKeys: ["dmDetector.flags.fakeReward", "dmDetector.flags.suspiciousLink"] },
  { from: "dmDetector.senders.alexGamer",        msg: "dmDetector.messages.fortniteClan",        sus: true,  flagKeys: ["dmDetector.flags.suspiciousShortenedLink", "dmDetector.flags.promiseFreeItems", "dmDetector.flags.strangerYouDontKnow"] },
  { from: "dmDetector.senders.mom",              msg: "dmDetector.messages.pickUpBread",         sus: false, flagKeys: ["dmDetector.flags.knownContact", "dmDetector.flags.normalEverydayRequest", "dmDetector.flags.noLinksOrUrgency"] },
  { from: "dmDetector.senders.prizeBot",         msg: "dmDetector.messages.wonPS5",              sus: true,  flagKeys: ["dmDetector.flags.didntEnterContest", "dmDetector.flags.asksForAddress", "dmDetector.flags.suspiciousXyzDomain"] },
  { from: "dmDetector.senders.saraClassmate",    msg: "dmDetector.messages.cmpsAssignment",      sus: false, flagKeys: ["dmDetector.flags.knownClassmate", "dmDetector.flags.normalSchoolQuestion", "dmDetector.flags.noLinksOrPersonalInfo"] },
  { from: "dmDetector.senders.cryptoKing",       msg: "dmDetector.messages.cryptoProfit",        sus: true,  flagKeys: ["dmDetector.flags.tooGoodToBeTrue", "dmDetector.flags.pressureToAct", "dmDetector.flags.classicInvestmentScam"] },
  { from: "dmDetector.senders.ahmedTeamLead",    msg: "dmDetector.messages.meetingMoved",        sus: false, flagKeys: ["dmDetector.flags.knownColleague", "dmDetector.flags.normalWorkRequest", "dmDetector.flags.noSuspiciousElements"] },
  { from: "dmDetector.senders.techSupportOffcl", msg: "dmDetector.messages.instagramDeleted",    sus: true,  flagKeys: ["dmDetector.flags.fakeUrgency", "dmDetector.flags.instagramNeverDMs", "dmDetector.flags.suspiciousVerificationLink"] },
  { from: "dmDetector.senders.unknownNumber",    msg: "dmDetector.messages.foundYourPhone",      sus: true,  flagKeys: ["dmDetector.flags.didntLosePhone", "dmDetector.flags.askingForFullName", "dmDetector.flags.socialEngineering"] },
  { from: "dmDetector.senders.nooraFriend",      msg: "dmDetector.messages.kataraPhoto",         sus: false, flagKeys: ["dmDetector.flags.knownFriend", "dmDetector.flags.referencesSharedExperience", "dmDetector.flags.normalPhotoSharing"] },
  { from: "dmDetector.senders.adminModerator",   msg: "dmDetector.messages.robloxFlagged",       sus: true,  flagKeys: ["dmDetector.flags.noPlatformAsksPasswords", "dmDetector.flags.urgencyTactic", "dmDetector.flags.impersonatingAuthority"] },
];

interface JudgeFeedback {
  correct: boolean;
  dm: DMMessage;
  timeout: boolean;
}

export default function DMDetector({ onHome }: { onHome: (xp?: number) => void }) {
  const  t  = useTranslations();
  const [phase, setPhase]       = useState<"intro"|"play"|"done">("intro");
  const [msgs, setMsgs]         = useState<DMMessage[]>([]);
  const [idx, setIdx]           = useState(0);
  const [score, setScore]       = useState(0);
  const [lives, setLives]       = useState(MAX_LIVES);
  const [timer, setTimer]       = useState(TIMER);
  const [feedback, setFeedback] = useState<JudgeFeedback | null>(null);
  const tRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    let t = TIMER; setTimer(TIMER);
    if (tRef.current) clearInterval(tRef.current);
    tRef.current = setInterval(() => {
      t--; setTimer(t);
      if (t <= 0) { if (tRef.current) clearInterval(tRef.current); judge("timeout"); }
    }, 1000);
  };

  const start = () => {
    setMsgs(shuffle([...DMS]).slice(0, TOTAL));
    setIdx(0); setScore(0); setLives(MAX_LIVES); setFeedback(null);
    setPhase("play"); setTimeout(startTimer, 100);
  };

  const judge = (answer: "safe" | "sus" | "timeout") => {
    if (tRef.current) clearInterval(tRef.current);
    const dm = msgs[idx];
    const correct = answer !== "timeout" && ((answer === "sus" && dm.sus) || (answer === "safe" && !dm.sus));
    if (correct) setScore(s => s + 100 + timer * 3);
    else setLives(l => l - 1);
    setFeedback({ correct, dm, timeout: answer === "timeout" });
  };

  const next = () => {
    setFeedback(null);
    if (lives <= 1 && !feedback?.correct || idx + 1 >= TOTAL) setPhase("done");
    else { setIdx(i => i + 1); startTimer(); }
  };

  useEffect(() => () => { if (tRef.current) clearInterval(tRef.current); }, []);

  // Fix next when lives drop to 0
  const handleNext = () => {
    setFeedback(null);
    if ((lives <= 0) || (idx + 1 >= TOTAL)) setPhase("done");
    else { setIdx(i => i + 1); startTimer(); }
  };

  if (phase === "intro") return (
    <GameShell>
      <Intro
        char={CHARS.fox}
        title={t("dmDetector.title")}
        lines={[
          t("dmDetector.intro.line1"),
          t("dmDetector.intro.line2"),
          t("dmDetector.intro.line3"),
        ]}
        onStart={start}
      />
    </GameShell>
  );

  if (phase === "done") return (
    <GameShell>
      <Result
        score={score}
        total={TOTAL * 190}
        char={CHARS.fox}
        title={t("dmDetector.result.title")}
        message={
          score >= 1200
            ? t("dmDetector.result.excellent")
            : score >= PASSING_SCORE
            ? t("dmDetector.result.passed")
            : t("dmDetector.result.failed", { score: PASSING_SCORE })
        }
        onRestart={start}
        onHome={() => onHome(score >= PASSING_SCORE ? GAME_XP : 0)}
      />
    </GameShell>
  );

  const dm = msgs[idx];
  if (!dm) return null;

  return (
    <GameShell>
      <GameHeader
        name={t("dmDetector.title")} onBack={() => { if (tRef.current) clearInterval(tRef.current); onHome(0); }}
        score={score} round={idx + 1} maxRound={TOTAL}
        timer={feedback ? null : timer} maxTimer={TIMER}
        lives={lives} maxLives={MAX_LIVES}
      />

      <div style={{ padding: "24px 40px", maxWidth: 680, margin: "0 auto" }}>

        {/* Fixed-height slot — no jumping */}
        <div style={{ minHeight: 420 }}>
          {!feedback ? (
            /* ── Message card ── */
            <div>
              <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,.08)", border: "1px solid #e8e0d4", overflow: "hidden", marginBottom: 20 }}>
                {/* Sender header */}
                <div style={{ padding: "14px 20px", background: "#f8f4ed", borderBottom: "1px solid #e8e0d4", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(99,32,36,.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#632024", flexShrink: 0 }}>
                    {t(dm.from)[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#2c1810" }}>{t(dm.from)}</div>
                    <div style={{ fontSize: 11, color: "#8a7a6e" }}>{t("dmDetector.directMessage")}</div>
                  </div>
                </div>
                {/* Message body */}
                <div style={{ padding: "20px 24px" }}>
                  <p style={{ fontSize: 16, color: "#2c1810", lineHeight: 1.7, margin: 0 }}>{t(dm.msg)}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <button
                  onClick={() => judge("sus")}
                  style={{ padding: "18px", borderRadius: 14, background: "rgba(192,57,43,.06)", border: "2px solid rgba(192,57,43,.2)", cursor: "pointer", textAlign: "center", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#c0392b"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(192,57,43,.2)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🚩</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#c0392b" }}>{t("dmDetector.btn.suspicious")}</div>
                </button>
                <button
                  onClick={() => judge("safe")}
                  style={{ padding: "18px", borderRadius: 14, background: "rgba(39,174,96,.06)", border: "2px solid rgba(39,174,96,.2)", cursor: "pointer", textAlign: "center", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#27ae60"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(39,174,96,.2)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#27ae60" }}>{t("dmDetector.btn.safe")}</div>
                </button>
              </div>
            </div>
          ) : (
            /* ── Feedback ── */
            <div>
              <div style={{ textAlign: "center", fontSize: 22, fontWeight: 800, marginBottom: 16,
                color: feedback.timeout ? "#c0392b" : feedback.correct ? "#27ae60" : "#c0392b" }}>
                {feedback.timeout ? t("dmDetector.feedback.tooSlow") : feedback.correct ? t("dmDetector.feedback.goodCall") : t("dmDetector.feedback.missedIt")}
              </div>

              <div style={{
                background: dm.sus ? "rgba(192,57,43,.04)" : "rgba(39,174,96,.04)",
                border: `1px solid ${dm.sus ? "rgba(192,57,43,.2)" : "rgba(39,174,96,.2)"}`,
                borderRadius: 16, padding: 20, marginBottom: 20,
              }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: dm.sus ? "#c0392b" : "#27ae60", marginBottom: 12 }}>
                  {dm.sus ? t("dmDetector.feedback.wasSuspicious") : t("dmDetector.feedback.wasSafe")}
                </div>
                {dm.flagKeys.map((fk, i) => (
                  <div key={i} style={{ fontSize: 13, color: "#5a4a3e", display: "flex", gap: 8, marginBottom: 6, lineHeight: 1.5 }}>
                    <span style={{ color: dm.sus ? "#c0392b" : "#27ae60", flexShrink: 0 }}>{dm.sus ? "⚠" : "✓"}</span>
                    {t(fk)}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  onClick={handleNext}
                  style={{ padding: "13px 36px", background: "#632024", border: "none", borderRadius: 12, color: "#f5ede0", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  {idx + 1 >= TOTAL || lives <= 0 ? t("dmDetector.btn.seeResults") : t("dmDetector.btn.nextDM")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameShell>
  );
}