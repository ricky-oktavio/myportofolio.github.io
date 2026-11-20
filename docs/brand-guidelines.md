# Brand Guidelines: Ricky Oktavio Adi Pranata

Personal brand for a Senior Mobile Engineer (Flutter & Dart).
Source of truth for visuals is `assets/css/site.css` `:root` (public site). `assets/css/style.css` still styles `admin.html` only.

## Direction: "Pixel editorial"

Black-and-paper editorial layout, oversized grotesk type, one saturated accent, and pixel/halftone details pulled from the world of phones (status-bar icons, notifications, dot-matrix screens).

| Attribute | In the design |
|-----------|---------------|
| **Precise** | Strict type scale, mono labels, numbered work, real metrics |
| **Bold** | Display type at 10–12vw, a single cobalt accent, hard pixel borders |
| **Playful** | Pixel sprites, a push-notification greeting, halftone photo that reacts to the cursor |

## Color

| Name | Hex | Token | Usage |
|------|-----|-------|-------|
| Black | #0A0A0A | --black | Hero, top bar, contact |
| Paper | #ECEAE4 | --paper | Main content sheet |
| Paper 2 | #E2DFD7 | --paper-2 | Filter tray, quiet fills |
| Ink | #0B0B0C | --ink | Text on paper, pixel art |
| Muted | #5E5D58 | --muted | Secondary text on paper (5.5:1) |
| Ghost | #7E7C76 | --ghost | Statement words before they light up; large text only (3.5:1) |
| On-dark | #F4F3EF | --on-dark | Text on black |
| On-dark muted | #9A9A96 | --on-dark-muted | Secondary text on black (7:1) |
| **Cobalt** | #2F45FF | --cobalt | The one accent: numbers, active states, fills, duotone |
| Cobalt tint | #8C9BFF | --cobalt-tint | Cobalt for text/dots on black (7.8:1) |
| Lime | #C8FF3E | --lime | Signal only: live/available dot, clock, focus on dark |

Why cobalt: it keeps the Flutter/Dart blue heritage but pushed toward International Klein Blue, so it reads designed rather than corporate. It works as text on paper (5.1:1) and as a fill under white text (6.2:1). Lime is never text on paper (1:1).

Rules: one accent per view; lime only on black; no gradients between accents.

## Type

```css
--font-display: 'Archivo', sans-serif;      /* variable: wght 400–900, wdth 62–125 */
--font-mono: 'JetBrains Mono', monospace;   /* 400/600, labels & meta only */
```

| Role | Spec |
|------|------|
| Hero name / contact title | 900, stretch 116%, 10–11vw, line-height .84, tracking -.05em, uppercase |
| Section mega heading | 850, stretch 112%, up to 12vw, uppercase |
| Statement | 850, ~4vw, uppercase, words reveal on scroll |
| Body | Archivo 500, 1–1.3rem, line-height 1.5 |
| Labels | JetBrains Mono 600, 12px, uppercase, tracking .08em, in `(parentheses)` |

## Shapes & details

- **Pixel border**: 4 hard box-shadows of `--px` (3px) = notched corners. Used on chips and the notification.
- **Pixel sprites**: drawn from string maps in `main.js` (`#` ink, `a` accent). Add new ones there.
- **Halftone**: hero photo rendered as dots on canvas; contact blobs are CSS dot gradients.
- **Duotone work images**: grayscale + cobalt multiply; real colors on hover/focus.
- **Sheet**: paper section with large radius (`--sheet-r`) floating on black.
- No glassmorphism, no glow, no soft shadows.

## Motion

Short, eased (`cubic-bezier(.2,.8,.2,1)`), and never an idle loop. The notification drops in once, the scroll arrow nudges three times, sprites and dot blobs move with scroll (parallax), the halftone hero redraws only when the pointer moves, and rows sweep cobalt on hover. Everything respects `prefers-reduced-motion`.

## Voice & tone

Confident, technical, direct; speak to "you". Name the tool, the app, the result.

Avoid: ninja / rockstar / guru, "passionate about", cutting-edge / revolutionary, "pixel-perfect" without proof, "I am a hardworking person".
