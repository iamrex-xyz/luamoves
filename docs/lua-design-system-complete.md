# Lua Design System – Complete Reference

> Compleet, kopieerbaar design system zoals gebruikt in de Lua app.  
> Bevat alle tokens, CSS variabelen, Tailwind config, typografie, componenten en gebruiksrichtlijnen.

---

## 1. Filosofie

Lua is een digitale verhuisassistent voor starters (25-35 jaar). De stijl is:

- **Warm & menselijk** – aardse tinten, geen koud corporate blauw
- **Rustig & helder** – veel witruimte, beperkte kleurinzet, één duidelijke accentkleur
- **Mobiel-eerst** – compacte layouts, grote touch targets (min. 44px)
- **Licht speels** – zachte schaduwen, ronde hoeken, subtiele animaties

Principe: *kalmte boven volledigheid*. Geen dark patterns, geen valse urgentie.

---

## 2. Kleurenpalet

Alle kleuren worden gedefinieerd als **HSL** in `src/index.css` en gebruikt via semantische Tailwind tokens (`bg-primary`, `text-foreground`, etc.). **Nooit hardcoded hex in componenten.**

### Brand kleuren

| Naam | HEX | HSL | Rol |
|------|-----|-----|-----|
| Pumpkin Spice | `#FC7A1E` | `25 97% 55%` | `--primary` – CTA's, focus, accenten |
| Apricot Cream | `#F9C784` | `35 91% 75%` | `--primary-muted` – hover, soft accents |
| Apricot Cream Light | `#FDF6ED` | `35 91% 93%` | `--primary-light` – subtle backgrounds |
| Dusk Blue | `#485696` | `228 35% 43%` | `--info` / accent – links, info |
| Molten Orange | `#F24C00` | `19 100% 47%` | `--destructive` – errors, delete |

### Neutrals

| Naam | HEX | HSL | Token |
|------|-----|-----|-------|
| Foreground | `#2D3354` | `228 35% 25%` | `--foreground` |
| Muted Foreground | `#6B7196` | `228 20% 50%` | `--muted-foreground` |
| Alabaster Grey | `#E8E8E8` | `0 0% 91%` | `--border`, `--secondary` |
| Muted BG | `#F2F2F2` | `0 0% 95%` | `--muted` |
| Background | `#FFFFFF` | `0 0% 100%` | `--background` |

### Semantisch

| Token | HSL | Gebruik |
|-------|-----|---------|
| `--success` | `142 71% 45%` | Voltooide taken |
| `--warning` | `35 91% 55%` | Waarschuwingen |
| `--info` | `228 35% 43%` | Info berichten |

### Progress gradient (0% → 100%)

| Stadium | HSL |
|---------|-----|
| start (0%) | `0 0% 88%` |
| low (25%) | `35 91% 80%` |
| medium (50%) | `35 91% 70%` |
| high (75%) | `25 97% 60%` |
| complete (100%) | `142 71% 45%` |

---

## 3. CSS Variabelen (kopieer in `src/index.css`)

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 228 35% 25%;

    --card: 0 0% 100%;
    --card-foreground: 228 35% 25%;
    --popover: 0 0% 100%;
    --popover-foreground: 228 35% 25%;

    --primary: 25 97% 55%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 35 91% 93%;
    --primary-muted: 35 91% 75%;

    --secondary: 0 0% 91%;
    --secondary-foreground: 228 35% 25%;
    --muted: 0 0% 95%;
    --muted-foreground: 228 20% 50%;

    --accent: 228 35% 95%;
    --accent-foreground: 228 35% 43%;

    --destructive: 19 100% 47%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 91%;
    --input: 0 0% 91%;
    --ring: 25 97% 55%;

    --radius: 1rem;

    --success: 142 71% 45%;
    --warning: 35 91% 55%;
    --warning-foreground: 25 97% 25%;
    --info: 228 35% 43%;

    --progress-start: 0 0% 88%;
    --progress-low: 35 91% 80%;
    --progress-medium: 35 91% 70%;
    --progress-high: 25 97% 60%;
    --progress-complete: 142 71% 45%;

    --shadow-soft: 0 1px 2px 0 rgba(72, 86, 150, 0.05);
    --shadow-medium: 0 4px 6px -1px rgba(72, 86, 150, 0.08), 0 2px 4px -1px rgba(72, 86, 150, 0.04);
    --shadow-large: 0 10px 15px -3px rgba(72, 86, 150, 0.08), 0 4px 6px -2px rgba(72, 86, 150, 0.04);
    --shadow-elegant: 0 20px 25px -5px rgba(72, 86, 150, 0.08), 0 10px 10px -5px rgba(72, 86, 150, 0.03);

    --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-bounce: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .dark {
    --background: 228 25% 8%;
    --foreground: 35 20% 95%;
    --card: 228 25% 12%;
    --card-foreground: 35 20% 95%;
    --popover: 228 25% 12%;
    --popover-foreground: 35 20% 95%;
    --primary: 25 97% 55%;
    --primary-foreground: 0 0% 100%;
    --primary-light: 25 50% 20%;
    --primary-muted: 35 50% 35%;
    --secondary: 228 20% 18%;
    --secondary-foreground: 35 20% 95%;
    --muted: 228 20% 15%;
    --muted-foreground: 228 15% 60%;
    --accent: 228 35% 20%;
    --accent-foreground: 35 91% 80%;
    --destructive: 19 100% 50%;
    --destructive-foreground: 0 0% 100%;
    --border: 228 20% 20%;
    --input: 228 20% 20%;
    --ring: 25 97% 55%;
    --progress-start: 228 20% 22%;
    --progress-low: 35 50% 35%;
    --progress-medium: 35 60% 45%;
    --progress-high: 25 80% 50%;
    --progress-complete: 142 60% 50%;
  }
}
```

---

## 4. Tailwind Config (`tailwind.config.ts`)

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1400px" } },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        italiana: ['Italiana', 'serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          muted: "hsl(var(--primary-muted))",
        },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        success: "hsl(var(--success))",
        warning: { DEFAULT: "hsl(var(--warning))", foreground: "hsl(var(--warning-foreground))" },
        info: "hsl(var(--info))",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        large: "var(--shadow-large)",
        elegant: "var(--shadow-elegant)",
      },
      spacing: { '18': '4.5rem', '22': '5.5rem' },
      borderRadius: {
        lg: "1rem", md: "0.875rem", sm: "0.625rem",
        xl: "1.25rem", "2xl": "1.5rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 5. Typografie

| Familie | Font | Gebruik |
|---------|------|---------|
| Display | **Plus Jakarta Sans** | Headings, hero |
| Body | **Inter** | Body, UI |
| Logo | **Italiana** | Alleen "LUA" wordmark |

Import in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Italiana&display=swap" rel="stylesheet">
```

### Type scale (mobiel-eerst, compact)

| Element | Size | Line Height | Letter Spacing |
|---------|------|-------------|----------------|
| H1 | 1.25rem (20px) | 1.2 | -0.02em |
| H2 | 1.125rem (18px) | 1.3 | -0.02em |
| H3 | 1rem (16px) | 1.4 | -0.02em |
| Body | 1rem (16px) | 1.5 | normal |
| Small | 0.875rem (14px) | 1.5 | normal |
| XS | 0.75rem (12px) | 1.5 | normal |

Body altijd `font-size: 16px` om iOS auto-zoom op inputs te voorkomen.

---

## 6. Spacing, radius & shadows

**Spacing:** standaard Tailwind scale (4px basis) + custom `18` (72px) en `22` (88px).

**Border radius:** `--radius: 1rem` (16px) als basis. Cards en dialogs gebruiken `rounded-lg`. Buttons `rounded-xl`. Pills/avatars `rounded-full`.

**Shadows:** vier niveaus (`soft`, `medium`, `large`, `elegant`), allemaal gebaseerd op Dusk Blue rgba voor warmte i.p.v. neutraal grijs.

---

## 7. Transitions & animaties

```css
--transition-smooth: 250ms cubic-bezier(0.4, 0, 0.2, 1);  /* default */
--transition-slow:   350ms cubic-bezier(0.4, 0, 0.2, 1);  /* complex */
--transition-bounce: 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55); /* playful */
```

Keyframes in gebruik: `fade-in`, `scale-in`, `accordion-down/up`, `confetti-fall`, `task-complete`.

---

## 8. Component standaarden

### Button (`src/components/ui/button.tsx`)
- Basis: `rounded-xl`, `font-medium`, `transition-all 200ms`, `active:scale-[0.98]`
- Default size: **48px hoog**, `px-6`, `text-base`
- Variants: `default` (primary orange), `secondary`, `outline`, `ghost`, `destructive`, `link`
- Min. touch target: 44px (40px op <360px schermen)

### Input
- 44px hoog (`h-11`), `rounded-md`, `px-4`, `text-base` (16px tegen iOS zoom)
- Focus ring in `--primary`

### Card
- `rounded-lg` (16px), `border`, `bg-card`, `shadow-sm`
- Padding `p-6`

### Progress
- Dynamische kleur volgens progress-gradient tokens (grijs → oranje → groen)
- 16px hoog, `rounded-full`

### Task card (Lua-specifiek)
- CSS Grid met 2 vaste rijen: titel-zone 36px, datum/actie-zone 20px
- Titel `text-sm font-medium`, max 2 regels
- Alle interactie-elementen op één horizontale baseline

---

## 9. Brand voice (tone)

| Context | Toon |
|---------|------|
| Onboarding | Warm, laagdrempelig |
| Stress moment | Kalm, oplossingsgericht |
| Voltooiing | Positief, vierend (confetti) |

Standaard CTA voor affiliate/commerciële acties: **"Regel dit voor mij"**.

---

## 10. Logo

```tsx
<span className="font-italiana tracking-wide text-foreground text-2xl">
  LUA
</span>
```
- Altijd uppercase
- Italiana font, `text-foreground` kleur
- Geen icon naast wordmark

---

## 11. Mobile-first regels

- Body `overscroll-behavior: none` (geen iOS bounce)
- `-webkit-tap-highlight-color: transparent` op interactieve elementen
- Inputs altijd `font-size: 16px`
- `user-select: none` op body, expliciet `text` op inputs/textareas
- Scrollbars verborgen via `scrollbar-width: none`

---

## 12. Quick checklist voor nieuwe componenten

- [ ] Geen hardcoded kleuren – alleen semantische tokens
- [ ] HSL waarden, geen hex in CSS
- [ ] `rounded-lg` of `rounded-xl` voor consistentie
- [ ] Shadow uit `soft|medium|large|elegant`
- [ ] Touch target ≥ 44px
- [ ] Dark mode getest
- [ ] Transitie via `--transition-smooth`

---

*Versie 1.0 – gegenereerd vanuit de live Lua codebase.*
