# Lua Design System — Complete Export for AI Implementation

> **Purpose**: This document contains all design tokens, colors, typography, and UI specifications needed to replicate Lua's exact look and feel in any frontend framework.

---

## 🎨 Color Palette (HSL Format — Use These Values!)

### Primary Colors
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| **Pumpkin Spice** | `#FC7A1E` | `25 97% 55%` | Primary buttons, CTAs, focus rings, accent elements |
| **Apricot Cream** | `#F9C784` | `35 91% 75%` | Primary light, hover states, secondary accents |
| **Apricot Cream Light** | `#FDF6ED` | `35 91% 97%` | Subtle backgrounds, input backgrounds |

### Accent Colors
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| **Dusk Blue** | `#485696` | `228 35% 43%` | Info messages, links, secondary text highlights |
| **Molten Orange** | `#F24C00` | `19 100% 47%` | Destructive actions, errors, warnings |

### Neutral Colors
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| **Foreground** | `#2D3354` | `228 35% 25%` | Primary text, headings |
| **Muted Foreground** | `#6B7196` | `228 20% 50%` | Secondary text, placeholders, descriptions |
| **Alabaster Grey** | `#E8E8E8` | `0 0% 91%` | Borders, dividers, secondary backgrounds |
| **Background** | `#FFFFFF` | `0 0% 100%` | Page background (light mode) |
| **Muted** | `#F2F2F2` | `0 0% 95%` | Muted backgrounds, cards |

### Semantic Colors
| Name | HEX | HSL | Usage |
|------|-----|-----|-------|
| **Success** | `#22C55E` | `142 71% 45%` | Completed tasks, confirmations, positive states |
| **Warning** | `#E5A633` | `35 91% 55%` | Warning messages, alerts |
| **Info** | `#485696` | `228 35% 43%` | Informational messages, tips |

### Progress Colors (Gradient Scale)
| Stage | HEX | HSL |
|-------|-----|-----|
| Start (0%) | `#E0E0E0` | `0 0% 88%` |
| Low (25%) | `#F5D9A8` | `35 91% 80%` |
| Medium (50%) | `#F0C67A` | `35 91% 70%` |
| High (75%) | `#FD8E3A` | `25 97% 60%` |
| Complete (100%) | `#22C55E` | `142 71% 45%` |

### Dark Mode Colors
| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `#FFFFFF` (`0 0% 100%`) | `#141824` (`228 25% 8%`) |
| Foreground | `#2D3354` (`228 35% 25%`) | `#F5EDE3` (`35 20% 95%`) |
| Card | `#FFFFFF` | `#1E2433` (`228 25% 12%`) |
| Border | `#E8E8E8` (`0 0% 91%`) | `#2E3544` (`228 20% 20%`) |
| Muted | `#F2F2F2` (`0 0% 95%`) | `#252B3A` (`228 20% 15%`) |

---

## 🔤 Typography

### Font Families
| Type | Font | Fallbacks |
|------|------|-----------|
| **Display** | Plus Jakarta Sans | -apple-system, BlinkMacSystemFont, sans-serif |
| **Body** | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |
| **Logo** | Italiana | serif |

### Font Weights
| Name | Weight | Usage |
|------|--------|-------|
| Light | 300 | Subtle text, captions |
| Regular | 400 | Body text |
| Medium | 500 | Emphasized text |
| Semibold | 600 | Subheadings, labels |
| Bold | 700 | Headings |
| Extrabold | 800 | Hero text, large headings |

### Type Scale
| Element | Size | Line Height | Letter Spacing |
|---------|------|-------------|----------------|
| H1 | 1.25rem (20px) | 1.2 | -0.02em |
| H2 | 1.125rem (18px) | 1.3 | -0.02em |
| H3 | 1rem (16px) | 1.4 | -0.02em |
| Body | 1rem (16px) | 1.5 | normal |
| Small | 0.875rem (14px) | 1.5 | normal |
| XS | 0.75rem (12px) | 1.5 | normal |

---

## 📐 Spacing Scale

### Base Spacing Tokens (rem → px)
| Token | Value | Pixels |
|-------|-------|--------|
| 1 | 0.25rem | 4px |
| 2 | 0.5rem | 8px |
| 3 | 0.75rem | 12px |
| 4 | 1rem | 16px |
| 5 | 1.25rem | 20px |
| 6 | 1.5rem | 24px |
| 8 | 2rem | 32px |
| 10 | 2.5rem | 40px |
| 12 | 3rem | 48px |
| 16 | 4rem | 64px |
| 18 | 4.5rem | 72px |
| 22 | 5.5rem | 88px |

---

## 🔲 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 0.625rem (10px) | Small buttons, badges |
| md | 0.875rem (14px) | Inputs, small cards |
| lg | 1rem (16px) | Cards, dialogs |
| xl | 1.25rem (20px) | Large cards |
| 2xl | 1.5rem (24px) | Hero sections |
| full | 9999px | Pills, avatars, tags |

---

## 🌑 Shadows (CSS Values)

| Name | CSS Value | Usage |
|------|-----------|-------|
| **Soft** | `0 1px 2px 0 rgba(72, 86, 150, 0.05)` | Subtle elements, cards |
| **Medium** | `0 4px 6px -1px rgba(72, 86, 150, 0.08), 0 2px 4px -1px rgba(72, 86, 150, 0.04)` | Cards, buttons |
| **Large** | `0 10px 15px -3px rgba(72, 86, 150, 0.08), 0 4px 6px -2px rgba(72, 86, 150, 0.04)` | Modals, popovers, dropdowns |
| **Elegant** | `0 20px 25px -5px rgba(72, 86, 150, 0.08), 0 10px 10px -5px rgba(72, 86, 150, 0.03)` | Hero elements, feature sections |

---

## ⚡ Transitions & Animations

### Transitions
| Name | Duration | Easing | Usage |
|------|----------|--------|-------|
| **Smooth** | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | General transitions |
| **Slow** | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Complex animations |
| **Bounce** | 500ms | `cubic-bezier(0.68, -0.55, 0.265, 1.55)` | Playful interactions |

### Key Animations
| Name | Description |
|------|-------------|
| **fade-in** | Opacity 0→1 with subtle translateY(8px→0) |
| **scale-in** | Scale 0.96→1 with opacity fade |
| **accordion-down** | Height 0→auto with opacity |
| **accordion-up** | Height auto→0 with opacity |
| **confetti-fall** | Falling confetti particles |
| **task-complete** | Slide out to right with scale down |

---

## 🎯 Button Specifications

### Button Variants
| Variant | Style |
|---------|-------|
| **Primary** | Background: Pumpkin Spice (#FC7A1E), Text: White, Shadow: Medium |
| **Secondary** | Background: Alabaster Grey (#E8E8E8), Text: Foreground (#2D3354) |
| **Outline** | Border: 1px solid Border color, Background: Transparent |
| **Ghost** | Background: Transparent, Hover: Muted background |
| **Destructive** | Background: Molten Orange (#F24C00), Text: White |
| **Link** | Text only, underline on hover |

### Button Sizes
| Size | Height | Padding |
|------|--------|---------|
| sm | 40px | 16px horizontal |
| default | 48px | 24px horizontal |
| lg | 56px | 32px horizontal |
| icon | 48x48px | centered |

---

## 📱 Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| sm | 640px | Tablet portrait |
| md | 768px | Tablet landscape |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1400px | Extra large |

---

## 🎭 Brand Voice & Tone

### Personality
- **Role**: Smart, involved friend
- **Tone**: Warm, practical, slightly playful — never corporate
- **Language**: Conversational Dutch
- **Principles**: 
  - Calm over completeness
  - No dark patterns or fake urgency
  - Solution-oriented communication

### Key CTA Phrases
- **"Regel dit voor mij"** — Primary action for affiliate/commercial flows
- **"Lua regelt dit"** — Confirmation that Lua will handle something
- **"Nu niet"** — Dismiss/skip action
- **"Verhuischecklist"** — Core feature reference

---

## 📋 Implementation Checklist for AI

When implementing this design system, ensure:

- [ ] All colors use **HSL format** as specified
- [ ] Primary color is Pumpkin Spice (`25 97% 55%`)
- [ ] Border radius is consistently rounded (`1rem` / `16px` for cards)
- [ ] Shadows use the Dusk Blue rgba values (`rgba(72, 86, 150, x)`)
- [ ] Typography uses Plus Jakarta Sans for headings, Inter for body
- [ ] Buttons have 48px minimum height for touch targets
- [ ] Dark mode colors are implemented (see Dark Mode section)
- [ ] Animations use the specified easings (especially bounce for playful elements)
- [ ] Card backgrounds are white with soft shadows
- [ ] Text uses letter-spacing `-0.02em` for headings

---

## 🔗 Related Documents

This export is part of the Lua documentation package:
- `docs/design-system.md` — Full design system reference
- `docs/lua-overview.md` — Technical and conceptual overview
- `src/index.css` — CSS variable definitions (if code access available)
- `tailwind.config.ts` — Tailwind configuration (if code access available)

---

*Export generated for Lua — Digital Moving Assistant*
