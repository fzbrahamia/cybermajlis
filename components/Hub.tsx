// ============================================================
// HUB — The Digital Souq
// Migrated to next-intl. All strings come from messages/en.json
// or messages/ar.json depending on the locale cookie.
//
// HOW LANGUAGE SWITCHING WORKS:
//   setLocaleCookie() writes a 'locale' cookie and reloads.
//   The server reads the cookie in src/i18n/request.ts and
//   serves the correct JSON. The <html dir> in layout.tsx
//   flips automatically — no manual RTL CSS needed.
// ============================================================

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';
import { GAMES, GAME_DIFF } from '@/app/lib/gamesData';
import { CHARS } from '@/app/lib/characters';
import { genLB } from '@/app/lib/leaderboard';
import { useTranslations, useLocale } from 'next-intl';

// ─── Locale cookie helper ────────────────────────────────────
// Writing the cookie triggers a full page reload so the server
// re-runs getRequestConfig and serves the new locale's JSON.
function setLocaleCookie(locale: string) {
  document.cookie = `locale=${locale}; path=/; max-age=31536000`;
  window.location.reload();
}


// ─── Simulation IDs — metadata now lives in messages JSON ────
const SIM_IDS = ['virus', 'rootkit', 'keylogger', 'worm', 'polymorphic', 'metamorphic', 'ransomware'] as const;
type SimId = (typeof SIM_IDS)[number];


const SIM_ICONS: Record<SimId, string> = {
  virus:     '🦠',
  rootkit:   '👻',
  keylogger: '⌨️',
  worm:      '🐛',
  polymorphic:  '🎭',
  metamorphic:  '🔬',
  ransomware:   '🔐',
};

// ─── Props ───────────────────────────────────────────────────
interface HubProps {
  totalXP: number;
  onSelectGame: (id: string) => void;
  onDashboard: () => void;
  gameMap: Record<string, React.ComponentType<{ onHome: () => void }>>;
  simMap: Record<string, React.ComponentType<{ onHome: () => void }>>;
}

export default function Hub({ totalXP, onSelectGame, onDashboard, gameMap, simMap }: HubProps) {
  const router = useRouter();
  const t = useTranslations('Hub');
  const locale = useLocale();           // 'en' | 'ar'
  const isRtl = locale === 'ar';
  const tickerMsgs = t.raw('ticker') as string[];
  const lbFeats = t.raw('lbFeats') as string[];
  const SIM_TAGS: Record<SimId, string[]> = {
    virus:     t.raw("SimTags.virus"),
    rootkit:   t.raw("SimTags.rootkit"),
    keylogger: t.raw("SimTags.keylogger"),
    worm:      t.raw("SimTags.worm"),
    polymorphic:  t.raw("SimTags.polymorphic"),
    metamorphic:  t.raw("SimTags.metamorphic"),
    ransomware:   t.raw("SimTags.ransomware"),
  };

  // ── Auth ──────────────────────────────────────────────────
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [userAvatar, setUserAvatar] = useState('');
  const isLoggedIn = !!user;
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) { setUsername(''); setUserAvatar(''); return; }
      const unsubDoc = onSnapshot(doc(db, 'user', u.uid), (snap) => {
        if (snap.exists()) {
          setUsername(snap.data().username || '');
          setUserAvatar(snap.data().avatar || '');
        }
      });
      return () => unsubDoc();
    });
    return () => unsub();
  }, []);

  // ── Guest XP (resets when tab closes) ────────────────────
  const [guestXP, setGuestXP] = useState(0);
  useEffect(() => {
    if (!isLoggedIn) {
      const saved = sessionStorage.getItem('guestXP');
      setGuestXP(saved ? parseInt(saved) : 0);
    }
  }, [isLoggedIn]);
  const displayXP = isLoggedIn ? totalXP : guestXP;

  // ── UI state ──────────────────────────────────────────────
  const [view, setView] = useState<'games' | 'simulations' | 'rankings'>('games');
  const [charFilter, setCharFilter] = useState<string | null>(null);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [activeSimulation, setActiveSimulation] = useState<string | null>(null);

  // ── Leaderboard (client-only to avoid SSR mismatch) ──────
  const [lbBase, setLbBase] = useState<ReturnType<typeof genLB>>([]);
  useEffect(() => { setLbBase(genLB(2400)); }, []);
  const lb = useMemo(
    () => lbBase.map((p) => (p.isYou ? { ...p, xp: displayXP } : p)).sort((a, b) => b.xp - a.xp),
    [displayXP, lbBase],
  );

  // ── Ticker ────────────────────────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setTickerIdx((t) => (t + 1) % tickerMsgs.length), 4000);
    return () => clearInterval(i);
  }, []);

  // ── Helpers ───────────────────────────────────────────────
  const handleLogoClick = () => router.back();
  const filteredGames = GAMES.filter((g) => gameMap[g.id]).filter(
    (g) => !charFilter || Object.values(CHARS).find((c) => c.name === charFilter)?.games.includes(g.id),
  );

  // ── Full-screen simulation ────────────────────────────────
  if (activeSimulation) {
    const SimComponent = simMap[activeSimulation];
    if (SimComponent) {
      return (
        <div className="relative w-full h-screen overflow-hidden">
          <SimComponent onHome={() => setActiveSimulation(null)} />
          <button
            onClick={() => setActiveSimulation(null)}
            className="fixed top-3 left-3 z-[9999] flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/70 border border-white/20 text-white text-xs font-bold backdrop-blur-sm hover:bg-black/90 transition-colors shadow-lg"
          >
            ← {t('simulations.back')}
          </button>
        </div>
      );
    }
    setActiveSimulation(null);
  }

  // ═══════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#5C1E22] font-sans relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#5C1E22] to-[#4F1A1B] pointer-events-none" />

      <div className="relative z-10 max-w-[960px] mx-auto px-5 pb-24">

        {/* ═══ HEADER ═══ */}
        <div className="flex justify-between items-center py-4 border-b border-white/5 mb-6">

          {/* Left: logo + Souq + Simulations */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleLogoClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg mr-2 text-[#D5B893] hover:bg-white/5 transition-colors"
            >
              <span className="text-base">🛡</span>
              <span className="font-serif text-sm font-semibold tracking-wide whitespace-nowrap cursor-pointer">
                {t('brand')}
              </span>
            </button>
            <div className="w-px h-5 bg-white/10 mr-1" />
            {(
              [
                { id: 'games'       as const, label: t('tabs.souq')        },
                { id: 'simulations' as const, label: t('tabs.simulations') },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                  view === tab.id
                    ? 'bg-[#D5B893]/20 text-[#f5ede0] font-bold'
                    : 'text-[#f5ede0]/40 hover:text-[#f5ede0]/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Rankings + language toggle + user */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('rankings')}
              className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
                view === 'rankings'
                  ? 'bg-[#D5B893]/20 text-[#f5ede0] font-bold'
                  : 'text-[#f5ede0]/40 hover:text-[#f5ede0]/60'
              }`}
            >
              {t('tabs.rankings')}
            </button>
            {/* Language toggle — switches locale cookie and reloads */}
            <button
              onClick={() => setLocaleCookie(isRtl ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-[#D5B893] text-xs font-bold cursor-pointer hover:bg-white/10 transition-colors"
            >
              {t('lang_toggle')}
            </button>
            {/* User avatar + username */}
            {isLoggedIn && (
              <div className="flex items-center gap-2 pl-1">
                <div
                  className="flex items-center justify-center overflow-hidden flex-shrink-0"
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #D5B893, #c5a57e)',
                    border: '2px solid rgba(197,165,126,0.4)',
                  }}
                >
                  {userAvatar ? (
                    <img src={userAvatar} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span style={{ color: '#632024', fontWeight: 700, fontSize: '0.8rem' }}>
                      {username.charAt(0).toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
                {username && (
                  <span style={{
                    fontFamily: "'Cinzel', serif", fontSize: '0.75rem',
                    fontWeight: 600, color: '#D5B893', letterSpacing: '0.04em',
                  }}>
                    {username}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ═══ GAMES / SOUQ VIEW ═══ */}
        {view === 'games' && (
          <>
            <div className="text-center mb-7 pt-4 pb-5">
              <h1 className="font-serif text-5xl font-medium text-[#f5ede0] tracking-wide">
                {t('souq.title_prefix')}
                <span className="text-[#D5B893] italic">{t('souq.title_highlight')}</span>
              </h1>
              <p className="text-[#f5ede0]/50 text-sm mt-3 font-light">
                {t('souq.subtitle')}
              </p>
            </div>

            {/* Character filter */}
            <div className="flex gap-2 justify-center mb-5 flex-wrap">
              <button
                onClick={() => setCharFilter(null)}
                className={`px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition-all border-2 ${
                  !charFilter
                    ? 'border-[#D5B893] bg-[#D5B893]/25 text-[#f5ede0]'
                    : 'border-white/10 bg-[#4F1A1B]/50 text-[#f5ede0]/50 hover:border-white/20'
                }`}
              >
                {t('souq.filter_all')}
              </button>
              {Object.entries(CHARS).map(([charId, c]) => (
                <button
                  key={c.name}
                  onClick={() => setCharFilter(charFilter === c.name ? null : c.name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all border-2 ${
                    charFilter === c.name
                      ? 'border-[#D5B893] bg-[#D5B893]/25 text-[#f5ede0]'
                      : 'border-white/10 bg-[#4F1A1B]/50 text-[#f5ede0]/50 hover:border-white/20'
                  }`}
                >
                  <span className="text-lg">
                    <img src={c.profile} alt={c.emoji} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} style={{ width: 35, height: 40, objectFit: "cover", borderRadius: "50%" }} />
                  </span>
                  <span>{t(`chars.${charId}.name`)}</span>
                  <span className="text-[10px] text-[#f5ede0]/30">
                    · {isRtl ? c.roleAr : c.role}
                  </span>
                </button>
              ))}
            </div>

            {/* Daily quest */}
            <div className="bg-gradient-to-r from-[#D5B893]/15 to-[#C5A57E]/8 border border-[#D5B893]/30 rounded-2xl px-5 py-4 mb-4 flex items-center gap-4">
              <div className="text-3xl animate-bounce" style={{ animationDuration: '3s' }}>🏆</div>
              <div className="flex-1">
                <div className="text-[10px] text-[#D5B893] font-bold tracking-[3px]">
                  {t('souq.quest_label')}
                </div>
                <div className="text-sm text-[#f5ede0] font-bold mt-1">
                  {t('souq.quest_title')}
                </div>
                <div className="text-xs text-[#f5ede0]/50 mt-1">
                  {t('souq.quest_reward')}
                </div>
              </div>
              <button
                onClick={() => onSelectGame('inbox')}
                className="px-5 py-2 bg-[#D5B893] rounded-xl text-[#3a1012] text-xs font-extrabold cursor-pointer whitespace-nowrap"
              >
                {t('souq.quest_cta')}
              </button>
            </div>

            {/* Ticker */}
            <div className="h-6 overflow-hidden mb-4 text-center">
              <div key={tickerIdx} className="text-xs text-[#f5ede0]/40 animate-slide-up">
                ⚡ {tickerMsgs[tickerIdx]}
              </div>
            </div>

            {/* Game grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredGames.map((game, gi) => {
                const diff    = GAME_DIFF[game.id] || { stars: 1, time: '3 min' };
                const learns  = t.raw(`gameLearn.${game.id}`) as string[];
                const skills  = t.raw(`games.${game.id}.skills`) as string[];
                const isHov   = hoveredGame === game.id;
                const gName = isRtl ? game.nameAr : game.name;
                const gTag  = isRtl ? game.taglineAr : game.tagline;
                return (
                  <div
                    key={game.id}
                    onClick={() => onSelectGame(game.id)}
                    onMouseEnter={() => setHoveredGame(game.id)}
                    onMouseLeave={() => setHoveredGame(null)}
                    className={`bg-white/[.09] border rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden ${
                      isHov
                        ? 'border-[#D5B893]/60 -translate-y-1 shadow-2xl shadow-black/25'
                        : 'border-white/10 shadow-sm shadow-black/10'
                    }`}
                    style={{ animationDelay: `${gi * 60}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[34px]">
                        <img src={game.char.profile} alt={game.char.emoji} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} style={{ width: 35, height: 40, objectFit: "cover", borderRadius: "50%" }} />
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] px-2.5 py-1 rounded-lg bg-[#D5B893]/15 border border-[#D5B893]/20 text-[#D5B893] font-bold">
                          {t(`games.${game.id}.mechanic`)}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3].map((s) => (
                            <span key={s} className={`text-[10px] ${s <= diff.stars ? 'text-[#D5B893]' : 'text-[#f5ede0]/20'}`}>★</span>
                          ))}
                          <span className="text-[9px] text-[#f5ede0]/30 ml-0.5">{diff.time}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-lg font-extrabold text-[#f5ede0] mb-1">{gName}</div>
                    <div className="text-xs text-[#D5B893] font-semibold mb-2">{gTag}</div>
                    <div className={`overflow-hidden transition-all duration-400 ${isHov ? 'max-h-48 opacity-100 mt-2.5' : 'max-h-0 opacity-0'}`}>
                      {learns.map((l, i) => (
                        <div key={i} className="text-[11px] text-[#f5ede0]/40 flex items-center gap-1.5 mb-1">
                          <span className="text-[#D5B893] text-[8px]">◆</span> {l}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap mt-2">
                      {skills.map((s, j) => (
                        <span key={j} className="text-[9px] px-2 py-1 rounded-md bg-[#D5B893]/10 border border-[#D5B893]/15 text-[#D5B893] font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ═══ RANKINGS VIEW ═══ */}
        {view === 'rankings' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6 pt-4">
              <h2 className="font-serif text-4xl font-medium text-[#f5ede0]">
                {t('rankings.title')}
              </h2>
            </div>

            {lb.length >= 3 && (
              <div className="flex justify-center items-end gap-3 mb-6">
                {[lb[1], lb[0], lb[2]].map((p, pi) => {
                  const heights = ['h-24', 'h-36', 'h-20'];
                  const medals  = ['🥈', '👑', '🥉'];
                  return (
                    <div key={pi} className="text-center">
                      {pi === 1 && <div className="text-xl mb-1 animate-bounce" style={{ animationDuration: '2.5s' }}>👑</div>}
                      <div className={`rounded-full mx-auto mb-1.5 border-2 overflow-hidden ${
                        pi === 1 ? 'border-[#D5B893]' : 'border-white/10'
                      }`} style={{ width: 60, height: 65 }}>
                        <img src={p.isYou ? (userAvatar || '/characters/falcon.jpeg') : p.avatar} alt={p.name} style={{ width: 60, height: 65, objectFit: "cover", borderRadius: "50%" }} />
                      </div>
                      <div className="text-xs font-extrabold text-[#f5ede0]">
                        {p.isYou ? t('rankings.you') : p.name}
                      </div>
                      <div className="font-mono text-xs font-bold text-[#D5B893]">{p.xp.toLocaleString()} XP</div>
                      <div className={`w-11 ${heights[pi]} bg-white/[.04] rounded-t-xl mt-1.5 mx-auto flex items-start justify-center pt-1.5 border border-white/10 border-b-0`}>
                        <span className="text-base">{medals[pi]}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white/[.07] rounded-2xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex justify-between">
                <span className="text-xs text-[#D5B893] font-bold tracking-[2px]">
                  {t('rankings.leaderboard_label')}
                </span>
                <span className="text-[10px] text-[#f5ede0]/30">
                  {t('rankings.updated')}
                </span>
              </div>
              {lb.map((p, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 px-4 py-2.5 ${
                    i < lb.length - 1 ? 'border-b border-[#D5B893]/5' : ''
                  } ${p.isYou ? 'bg-[#D5B893]/8' : ''}`}
                >
                  <div className="w-5 text-center font-mono text-[10px] font-extrabold text-[#f5ede0]/30">
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}
                  </div>
                  <div className={`rounded-full overflow-hidden border ${
                    p.isYou ? 'border-[#D5B893]' : 'border-white/10'
                  }`}>
                    <img src={p.isYou ? (userAvatar || '/characters/falcon.jpeg') : p.avatar} alt={p.name} style={{ width: 60, height: 65, objectFit: "cover", borderRadius: "50%" }} />
                  </div>
                  <div className="flex-1">
                    <span className={`text-xs ${p.isYou ? 'font-extrabold' : 'font-medium'} text-[#f5ede0]`}>
                      {p.isYou ? t('rankings.you') : p.name}
                    </span>
                    <div className="text-[9px] text-[#f5ede0]/30">{lbFeats[i % lbFeats.length]}</div>
                  </div>
                  <div className="font-mono text-xs font-bold text-[#D5B893]">{p.xp.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ SIMULATIONS VIEW ═══ */}
        {view === 'simulations' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6 pt-4">
              <h2 className="font-serif text-4xl font-medium text-[#f5ede0]">
                {t('simulations.title')}
              </h2>
              <p className="text-[#f5ede0]/40 text-sm mt-2">
                {t('simulations.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {SIM_IDS.map((simId) => {
                const isAvailable = !!simMap[simId];
                return (
                  <div
                    key={simId}
                    onClick={() => isAvailable && setActiveSimulation(simId)}
                    className={`group bg-white/[.09] border border-white/10 rounded-2xl p-5 transition-all duration-300 ${
                      isAvailable
                        ? 'cursor-pointer hover:-translate-y-1 hover:border-[#D5B893]/60 hover:shadow-2xl hover:shadow-black/25'
                        : 'cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="text-[34px] group-hover:animate-bounce" style={{ animationDuration: '1.5s' }}>
                        {SIM_ICONS[simId]}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[9px] px-2.5 py-1 rounded-lg bg-[#D5B893]/15 border border-[#D5B893]/20 text-[#D5B893] font-bold">
                          {t('simulations.badge')}
                        </span>
                        {isAvailable ? (
                          <span className="text-[8px] px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold">
                            {t('simulations.launch')}
                          </span>
                        ) : (
                          <span className="text-[8px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#f5ede0]/30 font-semibold">
                            {t('simulations.coming_soon')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-lg font-extrabold text-[#f5ede0] mb-1">
                      {t(`simList.${simId}.name`)}
                    </div>
                    <div className="text-xs text-[#D5B893] font-semibold mb-2">
                      {t(`simList.${simId}.sub`)}
                    </div>
                    {isAvailable && (
                      <div className="max-h-0 opacity-0 overflow-hidden transition-all duration-400 group-hover:max-h-48 group-hover:opacity-100 group-hover:mt-2.5">
                        <p className="text-[11px] text-[#f5ede0]/40 leading-relaxed">
                          {t(`simList.${simId}.desc`)}
                        </p>
                      </div>
                    )}
                    <div className="flex gap-1 flex-wrap mt-2">
                      {SIM_TAGS[simId].map((tag, j) => (
                        <span key={j} className="text-[9px] px-2 py-1 rounded-md bg-[#D5B893]/10 border border-[#D5B893]/15 text-[#D5B893] font-semibold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 p-3.5 bg-white/[.04] rounded-xl border border-white/5 text-center">
              <div className="text-xs text-[#f5ede0]/40 leading-relaxed">
                {t('simulations.disclaimer')}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pt-3 border-t border-[#D5B893]/8">
          <div className="text-[9px] text-[#f5ede0]/20">
            {t('footer')}
          </div>
        </div>
      </div>

      {/* XP circle — fixed bottom-left */}
      <div className="fixed bottom-6 left-6 z-50 group">
        <div className="absolute inset-0 rounded-full bg-[#D5B893] opacity-20 blur-lg scale-110" />
        <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-[#D5B893] to-[#B8935A] border-2 border-[#D5B893]/50 flex flex-col items-center justify-center shadow-xl shadow-black/40 cursor-default">
          <span className="font-mono text-[11px] font-black text-[#3a1012] leading-none">
            {displayXP >= 1000 ? `${(displayXP / 1000).toFixed(1)}k` : displayXP}
          </span>
          <span className="text-[8px] font-bold text-[#3a1012]/60 leading-none mt-0.5">XP</span>
        </div>
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-black/80 border border-white/10 text-[10px] text-[#D5B893] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          {t('xp_tooltip', { xp: displayXP.toLocaleString() })}
        </div>
      </div>
    </div>
  );
}