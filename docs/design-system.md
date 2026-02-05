# Lua Design System

> Stylesheet overzicht voor presentaties en documentatie

---

## 🎨 Kleurenpalet

### Primary Colors

| Naam | HEX | HSL | Gebruik |
|------|-----|-----|---------|
| **Pumpkin Spice** | `#FC7A1E` | `25 97% 55%` | Primary buttons, CTA's, focus rings |
| **Apricot Cream** | `#F9C784` | `35 91% 75%` | Primary light, hover states |
| **Apricot Cream Light** | `#FDF6ED` | `35 91% 93%` | Subtle backgrounds |

### Accent Colors

| Naam | HEX | HSL | Gebruik |
|------|-----|-----|---------|
| **Dusk Blue** | `#485696` | `228 35% 43%` | Accents, info, links |
| **Molten Orange** | `#F24C00` | `19 100% 47%` | Destructive actions, errors |

### Neutral Colors

| Naam | HEX | HSL | Gebruik |
|------|-----|-----|---------|
| **Foreground** | `#2D3354` | `228 35% 25%` | Primary text |
| **Muted Foreground** | `#6B7196` | `228 20% 50%` | Secondary text |
| **Alabaster Grey** | `#E8E8E8` | `0 0% 91%` | Borders, secondary backgrounds |
| **Background** | `#FFFFFF` | `0 0% 100%` | Page background |
| **Muted** | `#F2F2F2` | `0 0% 95%` | Muted backgrounds |

### Semantic Colors

| Naam | HEX | HSL | Gebruik |
|------|-----|-----|---------|
| **Success** | `#22C55E` | `142 71% 45%` | Voltooide taken, bevestigingen |
| **Warning** | `#E5A633` | `35 91% 55%` | Waarschuwingen |
| **Info** | `#485696` | `228 35% 43%` | Informatie berichten |

### Progress Colors (Gradient)

| Stadium | HEX | HSL |
|---------|-----|-----|
| Start (0%) | `#E0E0E0` | `0 0% 88%` |
| Low (25%) | `#F5D9A8` | `35 91% 80%` |
| Medium (50%) | `#F0C67A` | `35 91% 70%` |
| High (75%) | `#FD8E3A` | `25 97% 60%` |
| Complete (100%) | `#22C55E` | `142 71% 45%` |

---

## 🔤 Typography

### Font Families

| Type | Font | Fallbacks |
|------|------|-----------|
| **Display** | Plus Jakarta Sans | -apple-system, BlinkMacSystemFont, sans-serif |
| **Body** | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |
| **Logo** | Italiana | serif |

### Font Weights

| Naam | Gewicht | Gebruik |
|------|---------|---------|
| Light | 300 | Subtiele tekst |
| Regular | 400 | Body tekst |
| Medium | 500 | Emphasized tekst |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings |
| Extrabold | 800 | Hero tekst |

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

## 📐 Spacing

### Base Scale

| Token | Waarde |
|-------|--------|
| 1 | 0.25rem (4px) |
| 2 | 0.5rem (8px) |
| 3 | 0.75rem (12px) |
| 4 | 1rem (16px) |
| 5 | 1.25rem (20px) |
| 6 | 1.5rem (24px) |
| 8 | 2rem (32px) |
| 10 | 2.5rem (40px) |
| 12 | 3rem (48px) |
| 16 | 4rem (64px) |

### Custom Spacing

| Token | Waarde |
|-------|--------|
| 18 | 4.5rem (72px) |
| 22 | 5.5rem (88px) |

---

## 🔲 Border Radius

| Token | Waarde | Gebruik |
|-------|--------|---------|
| sm | 0.625rem (10px) | Small buttons, badges |
| md | 0.875rem (14px) | Inputs, small cards |
| lg | 1rem (16px) | Cards, dialogs |
| xl | 1.25rem (20px) | Large cards |
| 2xl | 1.5rem (24px) | Hero sections |
| full | 9999px | Pills, avatars |

---

## 🌑 Shadows

| Naam | CSS Value | Gebruik |
|------|-----------|---------|
| **Soft** | `0 1px 2px 0 rgba(72, 86, 150, 0.05)` | Subtiele elementen |
| **Medium** | `0 4px 6px -1px rgba(72, 86, 150, 0.08), 0 2px 4px -1px rgba(72, 86, 150, 0.04)` | Cards, buttons |
| **Large** | `0 10px 15px -3px rgba(72, 86, 150, 0.08), 0 4px 6px -2px rgba(72, 86, 150, 0.04)` | Modals, popovers |
| **Elegant** | `0 20px 25px -5px rgba(72, 86, 150, 0.08), 0 10px 10px -5px rgba(72, 86, 150, 0.03)` | Hero elementen |

---

## ⚡ Transitions

| Naam | Duration | Easing | Gebruik |
|------|----------|--------|---------|
| **Smooth** | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | Algemene transities |
| **Slow** | 350ms | cubic-bezier(0.4, 0, 0.2, 1) | Complexe animaties |
| **Bounce** | 500ms | cubic-bezier(0.68, -0.55, 0.265, 1.55) | Playful interacties |

---

## 🎭 Animaties

| Naam | Beschrijving |
|------|--------------|
| **fade-in** | Element fade in met subtle translateY |
| **scale-in** | Element scale in van 96% naar 100% |
| **accordion-down/up** | Accordion open/close animatie |
| **confetti-fall** | Confetti celebration animatie |
| **task-complete** | Taak voltooiing slide-out |

---

## 📱 Breakpoints

| Naam | Waarde | Gebruik |
|------|--------|---------|
| sm | 640px | Tablet portrait |
| md | 768px | Tablet landscape |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1400px | Extra large |

---

## 🎯 Button Variants

| Variant | Stijl |
|---------|-------|
| **Default** | Primary orange, white text, shadow |
| **Secondary** | Grey background, dark text |
| **Outline** | Border only, transparent background |
| **Ghost** | No background, hover shows background |
| **Destructive** | Molten orange, white text |
| **Link** | Text only, underline on hover |

### Button Sizes

| Size | Height | Padding |
|------|--------|---------|
| sm | 40px | 16px horizontal |
| default | 48px | 24px horizontal |
| lg | 56px | 32px horizontal |
| icon | 48x48px | centered |

---

## 🌙 Dark Mode

Het design system ondersteunt dark mode met aangepaste kleuren:

| Element | Light | Dark |
|---------|-------|------|
| Background | `#FFFFFF` | `#141824` |
| Foreground | `#2D3354` | `#F5EDE3` |
| Card | `#FFFFFF` | `#1E2433` |
| Border | `#E8E8E8` | `#2E3544` |
| Muted | `#F2F2F2` | `#252B3A` |

---

## 📋 Brand Guidelines

### Logo

- Font: Italiana
- Text: "LUA" (all caps)
- Kleur: Foreground (#2D3354)

### Tone of Voice

- **Vriendelijk** - niet corporate of pedant
- **Praktisch** - oplossingsgerichte communicatie
- **Betrouwbaar** - rustig en kalm
- **Licht speels** - maar professioneel

### Target Audience

- Starters (25-35 jaar)
- Nederlandse markt
- Verhuizende huishoudens

---

*Gegenereerd voor Lua - Jouw verhuis assistent*
