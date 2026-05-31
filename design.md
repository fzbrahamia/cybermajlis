# CyberMajlis — Design System

## Overview

CyberMajlis (المجلس السيبراني) is a gamified cybersecurity education platform for beginners. The visual identity draws from **Qatari cultural heritage** — deep maroons, warm golds, and cream parchment tones — combined with a modern editorial serif typographic system. The result is a premium, legible aesthetic that communicates authority and trust while remaining accessible to younger audiences.

---

## Color Palette

### Brand Tokens

These are the authoritative values used across the codebase. They are defined as CSS variables inside `AuthStepper.tsx` and applied by value in `page.tsx` and other component files.

| Token           | Hex       | RGB              | Usage                                      |
|-----------------|-----------|------------------|--------------------------------------------|
| `--maroon-deep` | `#3e1316` | `62, 19, 22`     | Title "Cyber", navbar gradient, text       |
| `--maroon`      | `#632024` | `99, 32, 36`     | Primary buttons, badges, accents, borders  |
| `--maroon-mid`  | `#8B2635` | `139, 38, 53`    | Title " Majlis", gradient end, hover tones |
| `--maroon-dark` | `#7a1e22` | `122, 30, 34`    | Navbar gradient third stop                 |
| `--gold`        | `#c5a57e` | `197, 165, 126`  | Dividers, ornaments, section labels        |
| `--gold-light`  | `#E8D4BC` | `232, 212, 188`  | Video overlay text, play button border     |
| `--cream`       | `#E3DAC9` | `227, 218, 201`  | Page background                            |

### Text Colors

| Value                  | Context                                     |
|------------------------|---------------------------------------------|
| `#3e1316`              | Primary headings                            |
| `#5a2428`              | Body italic text, subtitle                  |
| `#7a4840`              | Footer body text                            |
| `#8B6050`              | Section subtitles, muted labels             |
| `#a07060`              | Arabic secondary labels, card metadata      |
| `#b08060`              | Footer tagline, lowest-hierarchy labels     |
| `rgba(99,32,36,.4)`    | Footer legal links (resting)                |
| `rgba(90,36,40,.6)`    | Ghost button / "Continue as Guest" (resting)|

### Semantic Overlays

| Usage                        | Value                               |
|------------------------------|-------------------------------------|
| Page background glow (top)   | `rgba(99,32,36,.09)` — maroon       |
| Page background glow (bottom)| `rgba(197,165,126,.14)` — gold      |
| Diagonal grid lines          | `rgba(99,32,36,.04)`                |
| Card frosted glass background| `rgba(255,255,255,.45)`             |
| Card frosted glass (hover)   | `rgba(99,32,36,.08)`                |
| Video bottom gradient        | `rgba(62,19,22,.82) → transparent`  |
| Video play overlay           | `rgba(62,19,22,.15) → rgba(62,19,22,.6)` |
| SOC pulse ring               | `rgba(39,174,96,.5)`                |

### Character Accent Colors

Each guide character has a unique accent used for card borders, role badges, and dividers.

| Character | Accent Hex | RGB            | Role color |
|-----------|------------|----------------|------------|
| Saqr      | `#8B2635`  | `139, 38, 53`  | Maroon-red |
| Oryx      | `#7a5c2e`  | `122, 92, 46`  | Warm brown |
| Tha'lab   | `#8B4513`  | `139, 69, 19`  | Sienna     |
| Hisan     | `#4a7c59`  | `74, 124, 89`  | Forest green|

---

## Typography

### Typefaces

| Family        | Source       | Weights loaded          | Role                                    |
|---------------|--------------|-------------------------|-----------------------------------------|
| **Cinzel**    | Google Fonts | 400, 700, 900           | All headings, badges, labels, buttons   |
| **Crimson Pro**| Google Fonts| 300, 400, 600 + italic  | Body text, subtitles, italic accents    |
| **Geist Sans**| Next.js      | Variable                | System UI (Shadcn components, dashboard)|
| **Geist Mono**| Next.js      | Variable                | Code, terminal-style UI (SOC)           |

Cinzel and Crimson Pro are loaded dynamically via a `<link>` injection in a `useEffect` on the landing page. Geist fonts are set as CSS variables in `app/layout.tsx`.

### Scale

| Element              | Size                         | Weight | Family      |
|----------------------|------------------------------|--------|-------------|
| Page title (h1)      | `clamp(3rem, 5vw, 4.2rem)`   | 900/700| Cinzel      |
| Section heading (h2) | `clamp(1.8rem, 3vw, 2.5rem)` | 700    | Cinzel      |
| Subtitle / body      | `1.15rem`                    | 400 italic | Crimson Pro |
| Card title           | `14px`                       | 700    | Cinzel      |
| Character name       | `15px`                       | 700    | Cinzel      |
| Footer brand         | `18px`                       | 900    | Cinzel      |
| Section eyebrow      | `9px`                        | 600    | Cinzel      |
| Badge text           | `9.5px`                      | 600    | Cinzel      |
| Button text          | `13px`                       | 700    | Cinzel      |
| Ghost button         | `13px`                       | 400 italic | Crimson Pro |
| Footer links         | `0.92rem`                    | 400    | Crimson Pro |
| Legal / copyright    | `0.82rem`                    | 400 italic | Crimson Pro |
| Stats value          | `13px`                       | 700    | Cinzel      |
| Stats label          | `9px`, uppercase             | 400    | system      |

### Letter Spacing

| Context            | Value     |
|--------------------|-----------|
| Section eyebrows   | `3px`     |
| Badge              | `2.5px`   |
| Button primary     | `0.8px`   |
| Button secondary   | `0.5px`   |
| Role pill          | `1.5px`   |
| Footer group label | `2.5px`   |
| Footer tagline     | `2px`     |
| H1 title           | `-0.5px`  |
| Video guide label  | `0.15em`  |

---

## Spacing & Layout

### Page Layout

The landing page uses a **vertically stacked section** model with a fixed atmospheric background:

```
position: fixed  → atmospheric background (grid, glows, watermark)
position: relative, zIndex: 1 → all page sections stack above
```

### Section Padding

| Section         | Padding                   |
|-----------------|---------------------------|
| Hero            | `7rem 4rem 5rem`          |
| Features        | `96px 4rem`               |
| Characters      | `96px 4rem`               |
| Footer body     | `64px 4rem 48px`          |
| Footer bar      | `20px 4rem`               |

### Max Widths

| Area              | Max Width |
|-------------------|-----------|
| Features grid     | `1080px`  |
| Characters grid   | `960px`   |
| Footer content    | `1100px`  |
| Hero copy column  | `460px`   |
| Footer brand desc | `260px`   |

### Grid Systems

| Section       | Columns                                  | Gap  |
|---------------|------------------------------------------|------|
| Hero          | `flexbox, wrap, gap: 5rem`               | —    |
| Features      | `repeat(auto-fit, minmax(240px, 1fr))`   | 22px |
| Characters    | `repeat(auto-fit, minmax(210px, 1fr))`   | 22px |
| Footer links  | `2fr 1fr 1fr 1fr`                        | 3rem |

### Border Radius

| Element          | Radius  |
|------------------|---------|
| Card (features)  | `16px`  |
| Card (character) | `18px`  |
| Button primary   | `10px`  |
| Button secondary | `10px`  |
| Stats strip      | `12px`  |
| Badge            | `99px`  |
| Role pill        | `99px`  |
| Video card       | `22px`  |
| Mute button      | `50%`   |

---

## Component Patterns

### Buttons

Three distinct levels of visual hierarchy:

**Primary** — filled gradient, main action (Create Account)
```
background: linear-gradient(135deg, #632024, #8B2635)
color: #f5ede0
padding: 13px 28px
border-radius: 10px
box-shadow: 0 4px 20px rgba(99,32,36,.35), inset 0 1px 0 rgba(255,255,255,.1)
hover: translateY(-2px), shadow deepens
```

**Secondary** — outlined, equal-weight action (Log In)
```
background: rgba(99,32,36,.06)
border: 1.5px solid rgba(99,32,36,.3)
color: #632024
hover: background → rgba(99,32,36,.13), translateY(-2px)
```

**Ghost** — text link, lowest commitment (Continue as Guest)
```
background: none, border: none
color: rgba(90,36,40,.6)
font: Crimson Pro italic
text-decoration: underline, underlineOffset: 3px
hover: color → #632024
```

### Cards

**Feature cards** — static, informational
```
background: rgba(255,255,255,.45)
border: 1.5px solid rgba(197,165,126,.2)
backdrop-filter: blur(8px)
box-shadow: 0 2px 12px rgba(99,32,36,.06)
no hover interaction (intentional — informational only)
```

**Character cards** — hover lift with accent glow
```
resting: same as feature cards
hover:
  background: rgba({char.rgb}, 0.07)
  border: 1.5px solid {char.accent}55
  transform: translateY(-6px)
  box-shadow: 0 18px 50px rgba({char.rgb}, .18)
  image: scale(1.06) over 0.4s ease
```

**Video card** — ornate portrait frame
```
width: 320px, height: 560px
border: 2px solid rgba(99,32,36,.35)
box-shadow: 0 32px 80px rgba(99,32,36,.22),
            0 0 0 1px rgba(197,165,126,.2),
            inset 0 1px 0 rgba(255,255,255,.3)
outer rings: inset -8px and -14px hairline borders
glow halo: blur(16px) gradient behind card
```

### Badges & Pills

**Section eyebrow**
```
font: Cinzel 9px, letter-spacing: 3px, color: #c5a57e
margin-bottom: 12px
```

**Page badge** (hero)
```
padding: 5px 16px, border-radius: 99px
background: rgba(197,165,126,.18)
border: 1px solid rgba(197,165,126,.4)
color: #632024
```

**Role pill** (character cards)
```
padding: 3px 12px, border-radius: 99px
background: rgba({char.rgb}, .12)
border: 1px solid rgba({char.rgb}, .25)
color: {char.accent}
```

### Dividers

**Gold divider** (left-aligned, used below hero title)
```
[52px gradient bar] [5px rotated square] [flex gradient bar → transparent]
colors: #632024 → #c5a57e
```

**Center divider** (section headers)
```
[transparent → #c5a57e] [5px rotated square] [#c5a57e → transparent]
max-width: 280px
```

**Card inner divider** (beneath card title)
```
height: 1px, background: linear-gradient(90deg, #c5a57e, transparent)
```

**Character accent divider**
```
height: 1px, background: linear-gradient(90deg, {char.accent}66, transparent)
```

---

## Decorative Language

### Geometric Watermark

An SVG of nested hexagons, circles, and cross-lines drawn in the maroon/gold palette at `opacity: 0.04`. Used in two places:

- **Hero**: fixed to the right edge, 600×600, centered vertically
- **Characters section**: absolute left edge, 420×420, centered vertically

```svg
<!-- Three concentric hexagons + two concentric circles + cross + diagonals -->
stroke: #632024 (outer) and #c5a57e (inner)
```

### Corner Ornaments

Used on the hero video card — four L-shaped brackets at each corner plus four dot midpoints on each edge:

```
corners: 22×22px, 2.5px solid #c5a57e, border-radius on inner corner
midpoints: 5px circles, #c5a57e, centered on each edge
```

### Atmospheric Background (fixed)

Three layers, all `position: fixed`, `pointer-events: none`, `z-index: 0`:

1. **Maroon radial glow** — 700×700px circle, top-left, `blur(40px)`
2. **Gold radial glow** — 500×500px circle, bottom-right, `blur(40px)`
3. **Animated diagonal grid** — `repeating-linear-gradient(45deg)`, 22px repeat, `rgba(99,32,36,.04)`, animates via `gridMove` at 18s

---

## Animation System

All keyframes are injected via an inline `<style>` block on the landing page.

| Name            | Duration | Easing      | Effect                                     |
|-----------------|----------|-------------|---------------------------------------------|
| `gridMove`      | 18s      | linear ∞    | Shifts diagonal grid background-position    |
| `videoPulse`    | 5s       | ease-in-out | Video card breathes: scale 1 → 1.015       |
| `socPulse`      | 1.8s     | ease-in-out | SOC dot ring expands and fades              |
| `floatUp`       | 2s       | ease-in-out | Character image lifts 7px and returns       |
| `scrollBounce`  | 1.6s     | ease-in-out | Scroll cue chevron bounces 5px              |
| `playPulse`     | 2.2s     | ease-in-out | Play button ring radiates outward and fades |

### Entrance Animation

Hero content enters in 5 staggered steps. Each step is triggered by a `setTimeout` chain at 300ms intervals:

| Step | Delay | Elements                          |
|------|-------|-----------------------------------|
| 1    | 300ms | Badge, title, Arabic name         |
| 2    | 600ms | Gold divider, subtitle            |
| 3    | 900ms | Stats strip, video card           |
| 4    | 1200ms| Auth buttons                      |
| 5    | 1500ms| Scroll cue                        |

Each element uses:
```
opacity: 0 → 1
transform: translateY(14px) → translateY(0)
transition: 0.7s ease [+ delay]
```

The video card uses a spring cubic-bezier instead:
```
transition: opacity/transform 0.8s cubic-bezier(0.34, 1.2, 0.64, 1)
```

### Hover Transitions

All hover interactions use `transition: all 0.2s ease` for buttons, `0.3s ease` for cards, and `0.4s ease` for images.

---

## Internationalization

The page supports English and Arabic via `next-intl`. The locale is read with `useLocale()` and stored as `isAR = locale === "ar"`.

### Conditional Arabic rendering

Arabic text is only rendered when `isAR === true`. This applies to:

- Hero: Arabic title "المجلس السيبراني" (subtitle below h1)
- Stats strip: no Arabic labels in English
- Features: titles and descriptions switch to Arabic strings
- Characters: names and role pills switch to Arabic; English name shown below as subtitle
- CTA section: tagline switches language
- Footer brand: Arabic name only in AR locale
- Footer description: switches language

### RTL support

When Arabic content renders, `direction: "rtl"` is applied inline on text containers. The page layout itself does not flip (no `dir="rtl"` on `<html>`) — only specific elements use RTL.

---

## Assets

### Video

| File         | Path           | Dimensions  | Usage                          |
|--------------|----------------|-------------|--------------------------------|
| `hamad.mp4`  | `/hamad.mp4`   | 320×560 (portrait) | Hero video card — autoplays muted, loops |

Video interaction:
- First click: unmutes audio and plays
- Subsequent clicks: toggles mute
- Mute button appears only after first play

### Character Images

| Character | File                    | Path                         |
|-----------|-------------------------|------------------------------|
| Saqr      | `saqr.GIF`              | `/characters/saqr.GIF`       |
| Oryx      | `oryx.GIF`              | `/characters/oryx.GIF`       |
| Tha'lab   | `fox.GIF`               | `/characters/fox.GIF`        |
| Hisan     | `hisan.GIF`             | `/characters/hisan.GIF`      |

Static JPEG alternates exist: `falcon.jpeg`, `oryx.jpeg`, `fox.jpeg`, `ArabianHorse.jpeg`.

Images are displayed with `object-fit: contain` inside a 200px tall container with a tinted background matching the character's accent color.

### Icons

Game and feature icons live in `/public/icons/` as GIF files. The `games.gif` icon is referenced in the original hero but removed from the current landing page (now internal to the games section only).

---

## Page Sections

### § 1 — Hero

Full-viewport section. Two-column flex layout (wraps on narrow screens).

**Left column (max 460px)**
- Badge pill
- H1 with two-tone "Cyber" / "Majlis" coloring
- Optional Arabic name (AR locale only)
- Gold divider
- Subtitle paragraph
- Stats strip (4 metrics)
- Auth trio: Create Account (primary) + Log In (secondary) on one row, Continue as Guest (ghost) centered below

**Right column**
- Portrait video card (320×560) with ornate corner frame
- "WATCH INTRO" play overlay before first interaction
- Guide label and mute toggle once playing

**Bottom**
- Animated scroll cue: "SCROLL" label + bouncing chevron

### § 2 — Features

Background slightly tinted (`rgba(62,19,22,.03)`), separated by a gold hairline border.

- Eyebrow: WHAT IS CYBERMAJLIS
- H2: Your Cybersecurity Adventure
- Center divider
- Italic description
- 4-column auto-fit grid of static frosted-glass cards
- Cards are **not interactive** — informational only

### § 3 — Characters

Geometric watermark positioned left. Same section padding as features.

- Eyebrow: YOUR GUIDES
- H2: Meet the Guardians
- Center divider
- Italic description
- 4-column auto-fit grid of character profile cards
- Cards are **not clickable** — decorative hover lift only (no navigation)
- Each card: character GIF image (200px height, contain) + name + role pill + bio description

### § 4 — Footer

Four-column grid layout with brand column spanning 2fr.

**Brand column**
- CyberMajlis wordmark
- Arabic name (AR locale only)
- Italic tagline paragraph
- Mini gold divider
- "QATAR · CYBERSECURITY EDUCATION" in Cinzel caps

**Link columns** — Learn / Play / Account
- Column header in Cinzel caps, gold color
- Links in Crimson Pro, `#7a4840` resting, `#632024` on hover

**Bottom bar** (separated by hairline)
- Left: copyright in Crimson Pro italic
- Right: Privacy Policy · Terms of Use · Accessibility

---

## Tailwind & Global CSS

`globals.css` imports Tailwind CSS 4 and defines OKLCH design tokens for the Shadcn component system. These tokens are separate from the landing page's brand palette and apply to UI primitives (buttons, inputs, dialogs) inside the dashboard, games, and auth flows.

| Token          | Light value              | Dark value              |
|----------------|--------------------------|-------------------------|
| `--background` | `oklch(1 0 0)` — white   | `oklch(0.145 0 0)` — near black |
| `--primary`    | `oklch(0.205 0 0)` — dark| `oklch(0.922 0 0)` — light |
| `--radius`     | `0.625rem`               | same                    |

The landing page bypasses Tailwind entirely — it uses inline styles exclusively for full control over the brand aesthetic.
