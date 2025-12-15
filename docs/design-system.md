# Backlogged Design System

**Style:** Soft Neubrutalism
**Concept:** Chunky toy blocks with playful colors - bold black borders and offset shadows from neubrutalism, combined with claymorphism's rounded corners and softer pastel-influenced palette.

---

## Core Principles

1. **Bold but friendly** - Hard edges softened by rounded corners
2. **Playful hierarchy** - Clear visual weight without being aggressive
3. **Game-forward** - Colors and energy that match gaming culture
4. **Accessible first** - WCAG AA minimum, aim for AAA

---

## Colors

### Primary Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#7C3AED` | Main brand, headers, primary actions |
| `primary-light` | `#A78BFA` | Hover states, secondary elements |
| `primary-dark` | `#5B21B6` | Active states, focus rings |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `accent-yellow` | `#FBBF24` | Ratings, highlights, badges |
| `accent-pink` | `#F472B6` | Favorites, love states |
| `accent-mint` | `#34D399` | Success, completed, played |
| `accent-coral` | `#FB7185` | Alerts, dropped, errors |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-base` | `#FAFAF9` | Page background (light mode) |
| `bg-elevated` | `#FFFFFF` | Cards, modals |
| `bg-dark` | `#1C1917` | Page background (dark mode) |
| `bg-dark-elevated` | `#292524` | Cards in dark mode |
| `text-primary` | `#1C1917` | Headings, primary text |
| `text-secondary` | `#57534E` | Body text, descriptions |
| `text-muted` | `#A8A29E` | Placeholders, hints |
| `border` | `#000000` | Component borders (the neubrutalism signature) |
| `border-soft` | `#E7E5E4` | Subtle dividers |

### Status Colors

| Token | Hex | Status |
|-------|-----|--------|
| `status-played` | `#34D399` | Played/Completed |
| `status-playing` | `#60A5FA` | Currently playing |
| `status-backlog` | `#FBBF24` | In backlog |
| `status-dropped` | `#FB7185` | Dropped |
| `status-wishlist` | `#A78BFA` | Wishlist |
| `status-skipped` | `#A8A29E` | Skipped/Not interested |

---

## Typography

### Font Stack

```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
```

| Usage | Font | Weight | Size |
|-------|------|--------|------|
| Display/Logo | Fredoka | 700 | 32-48px |
| Headings | Fredoka | 600 | 20-28px |
| Subheadings | Fredoka | 500 | 16-18px |
| Body | Nunito | 400 | 14-16px |
| Labels | Nunito | 600 | 12-14px |
| Small/Captions | Nunito | 400 | 12px |

### Tailwind Config

```js
fontFamily: {
  display: ['Fredoka', 'sans-serif'],
  body: ['Nunito', 'sans-serif'],
}
```

---

## Spacing & Layout

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 8px | Small elements, chips |
| `rounded-md` | 12px | Buttons, inputs |
| `rounded-lg` | 16px | Cards, modals |
| `rounded-xl` | 24px | Large containers, hero sections |

### Spacing Scale

Use Tailwind's default spacing scale with preference for:
- `gap-3` / `gap-4` for card grids
- `p-4` / `p-6` for card padding
- `space-y-2` for form elements
- `mb-6` / `mb-8` for section spacing

---

## Components

### Borders (The Neubrutalism Signature)

All interactive components use **3px solid black borders**:

```css
.card {
  border: 3px solid #000000;
  border-radius: 16px;
}
```

### Shadows

Offset shadows instead of blur shadows - this is the key neubrutalism element:

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `3px 3px 0 #000` | Buttons, small cards |
| `shadow-md` | `5px 5px 0 #000` | Cards, dropdowns |
| `shadow-lg` | `8px 8px 0 #000` | Modals, popovers |
| `shadow-hover` | `6px 6px 0 #000` | Hover state (with translate) |

### Hover States

Buttons and cards shift on hover - the "press" effect:

```css
.card {
  transition: transform 150ms ease-out, box-shadow 150ms ease-out;
}

.card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.card:active {
  transform: translate(1px, 1px);
  box-shadow: 2px 2px 0 #000;
}
```

---

## Component Examples

### Button

```html
<button class="
  bg-primary text-white
  font-display font-semibold
  px-6 py-3
  border-3 border-black
  rounded-md
  shadow-[3px_3px_0_#000]
  hover:translate-x-[-2px] hover:translate-y-[-2px]
  hover:shadow-[5px_5px_0_#000]
  active:translate-x-[1px] active:translate-y-[1px]
  active:shadow-[1px_1px_0_#000]
  transition-all duration-150 ease-out
  cursor-pointer
">
  Add to Library
</button>
```

**Variants:**
- Primary: `bg-primary text-white`
- Secondary: `bg-white text-primary`
- Success: `bg-accent-mint text-black`
- Danger: `bg-accent-coral text-black`
- Ghost: `bg-transparent border-2 border-black`

### Card (Game Card)

```html
<div class="
  bg-white
  border-3 border-black
  rounded-lg
  shadow-[5px_5px_0_#000]
  overflow-hidden
  hover:translate-x-[-2px] hover:translate-y-[-2px]
  hover:shadow-[7px_7px_0_#000]
  transition-all duration-150 ease-out
  cursor-pointer
">
  <img src="cover.jpg" alt="Game cover" class="w-full aspect-[3/4] object-cover" />
  <div class="p-4">
    <h3 class="font-display font-semibold text-lg">Game Title</h3>
    <p class="font-body text-text-secondary text-sm">2023 | RPG</p>
    <div class="mt-2 flex items-center gap-2">
      <span class="bg-accent-yellow px-2 py-1 rounded-sm text-xs font-semibold border-2 border-black">
        9.5
      </span>
      <span class="bg-status-played px-2 py-1 rounded-sm text-xs font-semibold border-2 border-black">
        Played
      </span>
    </div>
  </div>
</div>
```

### Input

```html
<input
  type="text"
  placeholder="Search games..."
  class="
    w-full
    px-4 py-3
    font-body
    bg-white
    border-3 border-black
    rounded-md
    shadow-[3px_3px_0_#000]
    focus:outline-none
    focus:ring-2 focus:ring-primary focus:ring-offset-2
    placeholder:text-text-muted
  "
/>
```

### Badge/Chip

```html
<span class="
  inline-flex items-center
  px-3 py-1
  font-body font-semibold text-sm
  bg-status-backlog text-black
  border-2 border-black
  rounded-sm
  shadow-[2px_2px_0_#000]
">
  Backlog
</span>
```

### Rating Stars

```html
<div class="flex items-center gap-1">
  <!-- Filled star -->
  <svg class="w-5 h-5 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
  </svg>
</div>
```

---

## Dark Mode

Dark mode inverts backgrounds while keeping the bold border aesthetic:

```css
/* Dark mode adjustments */
.dark .card {
  background: #292524;
  border-color: #FAFAF9; /* Inverted border */
  box-shadow: 5px 5px 0 #FAFAF9;
}

.dark .text-primary {
  color: #FAFAF9;
}

.dark .text-secondary {
  color: #A8A29E;
}
```

---

## Animation Guidelines

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Hover transitions | 150ms | ease-out |
| Modal open/close | 200ms | ease-out |
| Page transitions | 300ms | ease-in-out |
| Loading spinners | 1000ms | linear |

### Motion Principles

1. **Respect `prefers-reduced-motion`** - disable animations for users who prefer it
2. **No continuous decorative animations** - only loading states
3. **Hover shifts are small** - 2-4px max, never scale transforms
4. **Ease-out for entering, ease-in for exiting**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7C3AED',
          light: '#A78BFA',
          dark: '#5B21B6',
        },
        accent: {
          yellow: '#FBBF24',
          pink: '#F472B6',
          mint: '#34D399',
          coral: '#FB7185',
        },
        status: {
          played: '#34D399',
          playing: '#60A5FA',
          backlog: '#FBBF24',
          dropped: '#FB7185',
          wishlist: '#A78BFA',
          skipped: '#A8A29E',
        },
      },
      fontFamily: {
        display: ['Fredoka', 'sans-serif'],
        body: ['Nunito', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'brutal-sm': '3px 3px 0 #000',
        'brutal-md': '5px 5px 0 #000',
        'brutal-lg': '8px 8px 0 #000',
        'brutal-hover': '6px 6px 0 #000',
        'brutal-active': '2px 2px 0 #000',
      },
    },
  },
}
```

---

## Icon Guidelines

- **Use:** Heroicons (outline for nav, solid for actions) or Lucide
- **Never:** Use emojis as icons
- **Size:** 20px for inline, 24px for buttons, 32px for empty states
- **Color:** Inherit from parent (`currentColor`)

---

## Accessibility Checklist

- [ ] All text meets 4.5:1 contrast ratio (AA)
- [ ] Interactive elements have visible focus states
- [ ] `prefers-reduced-motion` is respected
- [ ] All images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have descriptive text or aria-label
- [ ] Color is never the only indicator of state

---

## File Structure (Frontend)

```
src/
  components/
    ui/
      button.tsx
      card.tsx
      input.tsx
      badge.tsx
      rating.tsx
    game/
      game-card.tsx
      game-grid.tsx
      game-details.tsx
    library/
      library-filters.tsx
      library-stats.tsx
  styles/
    globals.css
    tailwind.css
```
